import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const TECH_KEYWORDS = ['api', 'saas', 'app', 'tool', 'software', 'platform', 'dashboard', 'automation', 'ai', 'analytics', 'startup', 'product']

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return TECH_KEYWORDS.filter(kw => lower.includes(kw)).slice(0, 5)
}

// GET - fetch ideas from database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const subreddit = searchParams.get('subreddit')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const days = parseInt(searchParams.get('days') || '30')

    const supabase = await createClient()

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    let query = supabase
      .from('ideas')
      .select('*', { count: 'exact' })
      .gte('source_created_at', fromDate.toISOString())
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (source) {
      query = query.eq('source', source)
    }

    if (subreddit) {
      query = query.eq('subreddit', subreddit)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      total: count,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - sync ideas from external APIs to database
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const savedCount = { reddit: 0, hackernews: 0 }
    const errors: string[] = []

    // Get base URL from request
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    // Fetch from HackerNews API
    try {
      const hnRes = await fetch(`${baseUrl}/api/hackernews`, { cache: 'no-store' })
      if (hnRes.ok) {
        const hnJson = await hnRes.json()
        if (hnJson.data?.children) {
          for (const child of hnJson.data.children) {
            const idea = {
              source: 'hackernews' as const,
              source_id: child.data.id,
              subreddit: null,
              title: child.data.title,
              body: child.data.selftext || null,
              url: `https://news.ycombinator.com/item?id=${child.data.id}`,
              score: child.data.score,
              comments_count: child.data.num_comments,
              keywords: extractKeywords(child.data.title + ' ' + (child.data.selftext || '')),
              source_created_at: new Date(child.data.created_utc * 1000).toISOString(),
            }

            const { error } = await supabase
              .from('ideas')
              .upsert(idea as never, { onConflict: 'source,source_id' })

            if (error) {
              errors.push(`HN upsert error: ${error.message}`)
            } else {
              savedCount.hackernews++
            }
          }
        }
      }
    } catch (e) {
      errors.push(`HN fetch error: ${e}`)
    }

    // Fetch from Reddit API (skip mock data)
    try {
      const redditRes = await fetch(`${baseUrl}/api/reddit`, { cache: 'no-store' })
      if (redditRes.ok) {
        const redditJson = await redditRes.json()
        // Only save if it's real data, not mock
        if (redditJson.data?.children && redditJson.source !== 'mock') {
          for (const child of redditJson.data.children) {
            const idea = {
              source: 'reddit' as const,
              source_id: child.data.id,
              subreddit: child.data.subreddit,
              title: child.data.title,
              body: child.data.selftext || null,
              url: `https://reddit.com${child.data.permalink}`,
              score: child.data.score,
              comments_count: child.data.num_comments,
              keywords: extractKeywords(child.data.title + ' ' + (child.data.selftext || '')),
              source_created_at: new Date(child.data.created_utc * 1000).toISOString(),
            }

            const { error } = await supabase
              .from('ideas')
              .upsert(idea as never, { onConflict: 'source,source_id' })

            if (error) {
              errors.push(`Reddit upsert error: ${error.message}`)
            } else {
              savedCount.reddit++
            }
          }
        }
      }
    } catch (e) {
      errors.push(`Reddit fetch error: ${e}`)
    }

    // Update trend snapshots
    await updateTrendSnapshots(supabase)

    return NextResponse.json({
      success: true,
      saved: savedCount,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      message: `Synced ${savedCount.hackernews} from HackerNews, ${savedCount.reddit} from Reddit`
    })
  } catch (error) {
    console.error('Error syncing ideas:', error)
    return NextResponse.json(
      { error: 'Failed to sync ideas' },
      { status: 500 }
    )
  }
}

async function updateTrendSnapshots(supabase: Awaited<ReturnType<typeof createClient>>) {
  const today = new Date().toISOString().split('T')[0]

  // Get all ideas from last 7 days
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: ideas } = await supabase
    .from('ideas')
    .select('keywords, score')
    .gte('source_created_at', weekAgo.toISOString()) as { data: { keywords: string[]; score: number }[] | null }

  if (!ideas) return

  // Count keywords
  const keywordStats: Record<string, { count: number; totalScore: number }> = {}

  for (const idea of ideas) {
    for (const keyword of idea.keywords || []) {
      if (!keywordStats[keyword]) {
        keywordStats[keyword] = { count: 0, totalScore: 0 }
      }
      keywordStats[keyword].count++
      keywordStats[keyword].totalScore += idea.score || 0
    }
  }

  // Save snapshots
  for (const [keyword, stats] of Object.entries(keywordStats)) {
    const snapshot = {
      keyword,
      mention_count: stats.count,
      avg_score: stats.count > 0 ? stats.totalScore / stats.count : 0,
      snapshot_date: today,
    }
    await supabase
      .from('trend_snapshots')
      .upsert(snapshot as never, { onConflict: 'keyword,snapshot_date' })
  }
}

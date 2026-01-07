import { NextResponse } from 'next/server'
import {
  searchPainPoints,
  searchSubreddit,
  DEFAULT_SUBREDDITS,
  PAIN_POINT_KEYWORDS,
} from '@/lib/reddit-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const subreddit = searchParams.get('subreddit')
    const mode = searchParams.get('mode') || 'painpoints' // 'painpoints' | 'search'

    if (mode === 'search' && query) {
      // Single subreddit search
      const targetSubreddit = subreddit || 'SaaS'
      const results = await searchSubreddit(targetSubreddit, query, 25)
      return NextResponse.json({ data: results, count: results.length })
    }

    // Default: search for pain points across multiple subreddits
    const subreddits = subreddit ? [subreddit] : DEFAULT_SUBREDDITS
    const keywords = PAIN_POINT_KEYWORDS

    const results = await searchPainPoints(subreddits, keywords, 5)

    return NextResponse.json({
      data: results,
      count: results.length,
      subreddits,
      keywords,
    })
  } catch (error) {
    console.error('Reddit search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search Reddit' },
      { status: 500 }
    )
  }
}

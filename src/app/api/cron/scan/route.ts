import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { searchPainPoints } from '@/lib/reddit/client'
import { extractKeywords, TARGET_SUBREDDITS } from '@/lib/utils/patterns'

// This endpoint is meant to be called by a cron job (e.g., Vercel Cron)
// It scans Reddit for new pain points and saves them to the database

export async function GET(request: Request) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Search for pain points
    const results = await searchPainPoints(TARGET_SUBREDDITS, { limit: 10 })

    // Process and save results
    const ideasToInsert = results.map((post) => ({
      source: 'reddit' as const,
      source_id: post.id,
      subreddit: post.subreddit,
      title: post.title,
      body: post.selftext || null,
      url: post.permalink,
      score: post.score,
      comments_count: post.num_comments,
      keywords: extractKeywords(`${post.title} ${post.selftext || ''}`),
      source_created_at: new Date(post.created_utc * 1000).toISOString(),
    }))

    // Upsert ideas (update if exists, insert if new)
    const { data, error } = await supabase
      .from('ideas')
      .upsert(ideasToInsert, {
        onConflict: 'source,source_id',
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error('Error saving ideas:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Scanned ${results.length} posts, saved ${data?.length || 0} ideas`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

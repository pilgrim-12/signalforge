import { NextResponse } from 'next/server'
import {
  quickPainPointSearch,
  searchSubreddit,
} from '@/lib/reddit-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const subreddit = searchParams.get('subreddit')

    if (query && subreddit) {
      // Custom search in specific subreddit
      const results = await searchSubreddit(subreddit, query, 25)
      return NextResponse.json({ data: results, count: results.length })
    }

    // Default: quick pain point search (single fast request)
    const results = await quickPainPointSearch(50)

    return NextResponse.json({
      data: results,
      count: results.length,
    })
  } catch (error) {
    console.error('Reddit search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search Reddit' },
      { status: 500 }
    )
  }
}

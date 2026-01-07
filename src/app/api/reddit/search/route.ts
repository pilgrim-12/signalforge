import { NextResponse } from 'next/server'
import { searchSubreddit, searchPainPoints } from '@/lib/reddit/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const subreddit = searchParams.get('subreddit')
    const painPoints = searchParams.get('pain_points') === 'true'
    const limit = parseInt(searchParams.get('limit') || '25')

    if (painPoints) {
      // Search for pain points across default subreddits
      const subreddits = subreddit
        ? [subreddit]
        : ['SaaS', 'startups', 'Entrepreneur', 'indiehackers']

      const results = await searchPainPoints(subreddits, { limit })
      return NextResponse.json({ data: results })
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    if (!subreddit) {
      return NextResponse.json(
        { error: 'Subreddit parameter is required' },
        { status: 400 }
      )
    }

    const results = await searchSubreddit(subreddit, query, { limit })
    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Reddit search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Reddit' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const subreddit = searchParams.get('subreddit')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    let query = supabase
      .from('ideas')
      .select('*', { count: 'exact' })
      .order('source_created_at', { ascending: false })
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

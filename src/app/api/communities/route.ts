import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - fetch communities from database
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')

    let query = supabase
      .from('communities')
      .select('*')
      .eq('is_active', true)
      .order('subscribers', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('Communities fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communities', data: [] },
      { status: 500 }
    )
  }
}

// POST - add new community
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const insertData = {
      platform: body.platform,
      name: body.name,
      url: body.url,
      description: body.description || null,
      subscribers: body.subscribers || 0,
      allows_promotion: body.allows_promotion || false,
      tags: body.tags || [],
      rules: body.rules || null,
    }

    const { data, error } = await supabase
      .from('communities')
      .insert(insertData as never)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Add community error:', error)
    return NextResponse.json(
      { error: 'Failed to add community' },
      { status: 500 }
    )
  }
}

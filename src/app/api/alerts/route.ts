import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - fetch alerts
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Add match_count placeholder
    const alertsWithCounts = (alerts || []).map((alert: Record<string, unknown>) => ({
      id: alert.id,
      user_id: alert.user_id,
      name: alert.name,
      keywords: alert.keywords,
      subreddits: alert.subreddits,
      is_active: alert.is_active,
      created_at: alert.created_at,
      match_count: 0,
    }))

    return NextResponse.json({
      data: alertsWithCounts,
      count: alertsWithCounts.length,
    })
  } catch (error) {
    console.error('Alerts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts', data: [] },
      { status: 500 }
    )
  }
}

// POST - create new alert
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const insertData = {
      user_id: body.user_id || 'anonymous',
      name: body.name || 'Unnamed Alert',
      keywords: body.keywords || [],
      subreddits: body.subreddits || [],
      is_active: true,
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert(insertData as never)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// PATCH - update alert
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.keywords) updateData.keywords = body.keywords
    if (body.subreddits) updateData.subreddits = body.subreddits
    if (body.name) updateData.name = body.name

    const { data, error } = await supabase
      .from('alerts')
      .update(updateData as never)
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// DELETE - delete alert
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}

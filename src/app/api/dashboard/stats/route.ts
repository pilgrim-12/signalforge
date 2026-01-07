import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get dates
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Count ideas from this week
    const { count: ideasThisWeek } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .gte('source_created_at', weekAgo.toISOString())

    // Count total communities
    const { count: communitiesCount } = await supabase
      .from('communities')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get top trending keyword this week
    const { data: topTrend } = await supabase
      .from('trend_snapshots')
      .select('keyword, mention_count')
      .gte('snapshot_date', weekAgo.toISOString().split('T')[0])
      .order('mention_count', { ascending: false })
      .limit(1)
      .single() as { data: { keyword: string; mention_count: number } | null }

    // Count active alerts (for current user - simplified for now)
    const { count: alertsCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get recent ideas for activity feed
    const { data: recentIdeas } = await supabase
      .from('ideas')
      .select('id, title, source, score, source_created_at, url')
      .order('source_created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      stats: {
        ideasThisWeek: ideasThisWeek || 0,
        communitiesTracked: communitiesCount || 0,
        topKeyword: topTrend?.keyword || null,
        activeAlerts: alertsCount || 0,
      },
      recentActivity: recentIdeas || [],
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

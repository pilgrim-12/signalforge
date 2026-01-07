import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type IdeaRow = { keywords: string[]; score: number; source_created_at: string }

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    // Get ideas with keywords for calculating current trends
    const { data: ideas } = await supabase
      .from('ideas')
      .select('keywords, score, source_created_at')
      .gte('source_created_at', fromDate.toISOString()) as { data: IdeaRow[] | null }

    // Calculate keyword stats from ideas
    const keywordStats: Record<string, { count: number; totalScore: number; dates: Record<string, number> }> = {}

    for (const idea of ideas || []) {
      const date = new Date(idea.source_created_at).toISOString().split('T')[0]
      for (const keyword of idea.keywords || []) {
        if (!keywordStats[keyword]) {
          keywordStats[keyword] = { count: 0, totalScore: 0, dates: {} }
        }
        keywordStats[keyword].count++
        keywordStats[keyword].totalScore += idea.score || 0
        keywordStats[keyword].dates[date] = (keywordStats[keyword].dates[date] || 0) + 1
      }
    }

    // Format trending keywords with change calculation
    const trendingKeywords = Object.entries(keywordStats)
      .map(([keyword, stats]) => {
        // Calculate change (compare last 3 days to previous 3 days)
        const dates = Object.keys(stats.dates).sort()
        const recentDates = dates.slice(-3)
        const olderDates = dates.slice(-6, -3)

        const recentCount = recentDates.reduce((sum, d) => sum + (stats.dates[d] || 0), 0)
        const olderCount = olderDates.reduce((sum, d) => sum + (stats.dates[d] || 0), 0)

        let change = 0
        if (olderCount > 0) {
          change = Math.round(((recentCount - olderCount) / olderCount) * 100)
        } else if (recentCount > 0) {
          change = 100
        }

        return {
          keyword,
          mentions: stats.count,
          avgScore: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
          change,
          trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
        }
      })
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10)

    // Build chart data - group by date
    const chartDataMap: Record<string, Record<string, string | number>> = {}
    const topKeywords = trendingKeywords.slice(0, 3).map(k => k.keyword)

    for (const idea of ideas || []) {
      const date = new Date(idea.source_created_at).toLocaleDateString('en-US', { weekday: 'short' })
      if (!chartDataMap[date]) {
        chartDataMap[date] = { date }
      }
      for (const keyword of idea.keywords || []) {
        if (topKeywords.includes(keyword)) {
          chartDataMap[date][keyword] = ((chartDataMap[date][keyword] as number) || 0) + 1
        }
      }
    }

    const chartData = Object.values(chartDataMap)

    return NextResponse.json({
      trendingKeywords,
      chartData,
      topKeywords,
      period: days,
    })
  } catch (error) {
    console.error('Trends fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends', trendingKeywords: [], chartData: [] },
      { status: 500 }
    )
  }
}

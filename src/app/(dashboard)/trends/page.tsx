'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendingKeyword {
  keyword: string
  mentions: number
  avgScore: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface TrendsData {
  trendingKeywords: TrendingKeyword[]
  chartData: Record<string, string | number>[]
  topKeywords: string[]
}

const CHART_COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7')

  const fetchTrends = async (days: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trends?days=${days}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends(period)
  }, [period])

  const handlePeriodChange = (value: string) => {
    const days = value === '7d' ? '7' : value === '30d' ? '30' : '90'
    setPeriod(days)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!data || data.trendingKeywords.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No trend data yet. Sync data from the Dashboard to start tracking trends.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        {/* Chart */}
        {data.chartData.length > 0 && data.topKeywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mentions Over Time</CardTitle>
              <CardDescription>
                Track how keywords are trending across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    {data.topKeywords.map((keyword, index) => (
                      <Line
                        key={keyword}
                        type="monotone"
                        dataKey={keyword}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {data.topKeywords.map((keyword, index) => (
                  <div key={keyword} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm">{keyword}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending Keywords Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
            <CardDescription>
              Most mentioned topics with period-over-period changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trendingKeywords.map((item, index) => (
                <div
                  key={item.keyword}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{item.keyword}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.mentions.toLocaleString()} mentions · avg score {item.avgScore}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={item.trend} />
                    <Badge
                      variant={item.change > 0 ? 'default' : item.change < 0 ? 'destructive' : 'secondary'}
                    >
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trends</h1>
          <p className="text-muted-foreground">
            Track keyword mentions and emerging topics over time
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchTrends(period)} disabled={loading}>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="7d" onValueChange={handlePeriodChange}>
        <TabsList>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
          <TabsTrigger value="90d">90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value="7d" className="space-y-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="30d" className="space-y-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="90d" className="space-y-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

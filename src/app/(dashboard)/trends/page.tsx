'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Mock data for chart
const chartData = [
  { date: 'Mon', 'AI automation': 120, 'No-code': 80, 'SaaS analytics': 60 },
  { date: 'Tue', 'AI automation': 150, 'No-code': 90, 'SaaS analytics': 75 },
  { date: 'Wed', 'AI automation': 180, 'No-code': 85, 'SaaS analytics': 90 },
  { date: 'Thu', 'AI automation': 220, 'No-code': 100, 'SaaS analytics': 85 },
  { date: 'Fri', 'AI automation': 250, 'No-code': 120, 'SaaS analytics': 95 },
  { date: 'Sat', 'AI automation': 200, 'No-code': 110, 'SaaS analytics': 80 },
  { date: 'Sun', 'AI automation': 280, 'No-code': 130, 'SaaS analytics': 100 },
]

const trendingKeywords = [
  { keyword: 'AI automation', mentions: 1234, change: 45, trend: 'up' },
  { keyword: 'No-code tools', mentions: 892, change: 23, trend: 'up' },
  { keyword: 'SaaS analytics', mentions: 654, change: 12, trend: 'up' },
  { keyword: 'API integration', mentions: 543, change: -5, trend: 'down' },
  { keyword: 'Remote work tools', mentions: 432, change: 0, trend: 'stable' },
  { keyword: 'Workflow automation', mentions: 398, change: 18, trend: 'up' },
]

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trends</h1>
        <p className="text-muted-foreground">
          Track keyword mentions and emerging topics over time
        </p>
      </div>

      <Tabs defaultValue="7d">
        <TabsList>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
          <TabsTrigger value="90d">90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value="7d" className="space-y-6">
          {/* Chart */}
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
                  <LineChart data={chartData}>
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
                    <Line
                      type="monotone"
                      dataKey="AI automation"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="No-code"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="SaaS analytics"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trending Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Keywords</CardTitle>
              <CardDescription>
                Most mentioned topics with week-over-week changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingKeywords.map((item, index) => (
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
                          {item.mentions.toLocaleString()} mentions
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
        </TabsContent>

        <TabsContent value="30d">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">30 day trends coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="90d">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">90 day trends coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

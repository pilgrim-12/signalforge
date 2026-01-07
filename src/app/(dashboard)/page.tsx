import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Users, TrendingUp, Bell } from 'lucide-react'

const stats = [
  {
    title: 'Pain Points',
    value: '1,234',
    description: 'Ideas found this week',
    icon: Lightbulb,
    change: '+12%',
  },
  {
    title: 'Communities',
    value: '856',
    description: 'Active communities tracked',
    icon: Users,
    change: '+3%',
  },
  {
    title: 'Trending Topics',
    value: '48',
    description: 'Hot trends right now',
    icon: TrendingUp,
    change: '+23%',
  },
  {
    title: 'Active Alerts',
    value: '12',
    description: 'Monitoring keywords',
    icon: Bell,
    change: '0',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your research.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
                <span className="ml-2 text-green-500">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pain Points</CardTitle>
            <CardDescription>Latest ideas found across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      "I wish there was a tool for..."
                    </p>
                    <p className="text-xs text-muted-foreground">
                      r/SaaS • 2 hours ago • 45 upvotes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
            <CardDescription>Most mentioned topics this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['AI automation', 'No-code tools', 'SaaS analytics'].map((keyword) => (
                <div key={keyword} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{keyword}</span>
                  <span className="text-sm text-green-500">+24%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

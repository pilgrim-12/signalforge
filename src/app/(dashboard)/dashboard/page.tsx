'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Users, TrendingUp, Bell, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'

interface DashboardStats {
  ideasThisWeek: number
  communitiesTracked: number
  topKeyword: string | null
  activeAlerts: number
}

interface RecentIdea {
  id: string
  title: string
  source: string
  score: number
  source_created_at: string
  url: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncData = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/ideas', { method: 'POST' })
      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getSourceColor = (source: string) => {
    if (source === 'hackernews') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (source === 'reddit') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your pain point discoveries
          </p>
        </div>
        <Button variant="outline" onClick={syncData} disabled={syncing}>
          {syncing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing...</>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" />Sync Data</>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pain Points</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.ideasThisWeek || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Discovered this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.communitiesTracked || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sources tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {loading ? '...' : stats?.topKeyword || '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Top keyword this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.activeAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest pain points discovered from HackerNews & Reddit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No data yet. Click "Sync Data" to fetch pain points from HackerNews.
              </p>
              <Button onClick={syncData} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((idea) => (
                <div key={idea.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{idea.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getSourceColor(idea.source)}>
                        {idea.source === 'hackernews' ? 'HackerNews' : idea.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Score: {idea.score}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(idea.source_created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={idea.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/ideas">
                  <Button variant="outline" className="w-full">View All Pain Points</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

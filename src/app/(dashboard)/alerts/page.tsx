'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Bell, Plus, Trash2, Pause, Play } from 'lucide-react'

// Mock data
const mockAlerts = [
  {
    id: '1',
    keywords: ['SaaS', 'metrics', 'dashboard'],
    subreddits: ['SaaS', 'startups'],
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    matchCount: 45,
  },
  {
    id: '2',
    keywords: ['AI', 'automation', 'workflow'],
    subreddits: ['Entrepreneur', 'smallbusiness'],
    isActive: true,
    createdAt: '2024-01-12T15:30:00Z',
    matchCount: 32,
  },
  {
    id: '3',
    keywords: ['no-code', 'low-code'],
    subreddits: ['NoCode', 'webdev'],
    isActive: false,
    createdAt: '2024-01-08T09:00:00Z',
    matchCount: 18,
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keyword Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when new posts match your keywords
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Set up keyword monitoring for specific subreddits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  placeholder="SaaS, metrics, dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subreddits">Subreddits (comma separated)</Label>
                <Input
                  id="subreddits"
                  placeholder="SaaS, startups, Entrepreneur"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Matches Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Keywords Monitored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.reduce((acc, a) => acc + a.keywords.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className={`h-5 w-5 ${alert.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    Alert #{alert.id}
                    <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                      {alert.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(alert.createdAt).toLocaleDateString()} • {alert.matchCount} matches
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    {alert.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {alert.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Subreddits</p>
                <div className="flex flex-wrap gap-2">
                  {alert.subreddits.map((subreddit) => (
                    <Badge key={subreddit} variant="secondary">
                      r/{subreddit}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

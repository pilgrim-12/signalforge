'use client'

import { useEffect, useState } from 'react'
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
import { Bell, Plus, Trash2, Pause, Play, Loader2, RefreshCw } from 'lucide-react'

interface Alert {
  id: string
  name: string
  keywords: string[]
  subreddits: string[]
  is_active: boolean
  created_at: string
  match_count: number
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newKeywords, setNewKeywords] = useState('')
  const [newSubreddits, setNewSubreddits] = useState('')
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const toggleAlert = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })
      if (res.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === id ? { ...alert, is_active: !currentStatus } : alert
        ))
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error)
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAlerts(alerts.filter(alert => alert.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const createAlert = async () => {
    if (!newKeywords.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim() || 'New Alert',
          keywords: newKeywords.split(',').map(k => k.trim()).filter(Boolean),
          subreddits: newSubreddits.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setAlerts([{ ...data.data, match_count: 0 }, ...alerts])
        setIsCreateOpen(false)
        setNewKeywords('')
        setNewSubreddits('')
        setNewName('')
      }
    } catch (error) {
      console.error('Failed to create alert:', error)
    } finally {
      setSaving(false)
    }
  }

  const activeCount = alerts.filter(a => a.is_active).length
  const totalKeywords = alerts.reduce((acc, a) => acc + (a.keywords?.length || 0), 0)
  const totalMatches = alerts.reduce((acc, a) => acc + (a.match_count || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keyword Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when new posts match your keywords
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
            Refresh
          </Button>
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
                  Set up keyword monitoring for pain points
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Alert Name</Label>
                  <Input
                    id="name"
                    placeholder="My Alert"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="SaaS, metrics, dashboard"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subreddits">Sources (comma separated, optional)</Label>
                  <Input
                    id="subreddits"
                    placeholder="SaaS, startups, HackerNews"
                    value={newSubreddits}
                    onChange={(e) => setNewSubreddits(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAlert} disabled={saving || !newKeywords.trim()}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
              {loading ? '...' : activeCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : totalMatches}
            </div>
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
              {loading ? '...' : totalKeywords}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No alerts yet. Create your first alert to start monitoring keywords.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      {!loading && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className={`h-5 w-5 ${alert.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                      {alert.name || `Alert #${alert.id.slice(0, 8)}`}
                      <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                        {alert.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Created {new Date(alert.created_at).toLocaleDateString()} • {alert.match_count || 0} matches
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleAlert(alert.id, alert.is_active)}
                    >
                      {alert.is_active ? (
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
                    {(alert.keywords || []).map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                {alert.subreddits && alert.subreddits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {alert.subreddits.map((subreddit) => (
                        <Badge key={subreddit} variant="secondary">
                          {subreddit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

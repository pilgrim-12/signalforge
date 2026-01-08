'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, MessageSquare, ThumbsUp, Search, RefreshCw, Loader2, Flame, Filter } from 'lucide-react'

interface Idea {
  id: string
  title: string
  body: string | null
  source: string
  subreddit: string | null
  url: string
  score: number
  comments_count: number
  pain_score: number
  keywords: string[]
  source_created_at: string
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [painOnly, setPainOnly] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: '50',
        days: '30',
      })
      if (painOnly) {
        params.set('pain_only', 'true')
      }

      const res = await fetch(`/api/ideas?${params}`)
      if (!res.ok) throw new Error('Failed to fetch ideas')

      const json = await res.json()
      setIdeas(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pain points')
    } finally {
      setLoading(false)
    }
  }

  const syncData = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/ideas', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        await fetchIdeas()
      }
    } catch (err) {
      console.error('Sync error:', err)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { fetchIdeas() }, [painOnly])

  const filteredIdeas = ideas.filter(idea => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return idea.title.toLowerCase().includes(q) ||
           (idea.body?.toLowerCase().includes(q)) ||
           idea.source.toLowerCase().includes(q)
  })

  const getSourceColor = (source: string) => {
    if (source === 'hackernews') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }

  const getPainBadge = (painScore: number) => {
    if (painScore >= 8) return { label: 'Hot', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    if (painScore >= 5) return { label: 'Warm', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
    if (painScore >= 3) return { label: 'Signal', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pain Points</h1>
          <p className="text-muted-foreground">Discover user problems and product ideas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={painOnly ? "default" : "outline"}
            onClick={() => setPainOnly(!painOnly)}
            className="gap-2"
          >
            <Flame className="h-4 w-4" />
            {painOnly ? 'Pain Signals Only' : 'All Posts'}
          </Button>
          <Button variant="outline" onClick={syncData} disabled={syncing}>
            <RefreshCw className={syncing ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
            Sync
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pain points..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {painOnly && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <Filter className="h-4 w-4" />
          <span>Showing posts with pain signals (score 3+). These are posts where users express problems, needs, or frustrations.</span>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchIdeas}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading pain points...</p>
        </div>
      )}

      {!loading && !error && filteredIdeas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {painOnly ? 'No pain signals found. Try syncing more data or showing all posts.' : 'No posts found. Click Sync to fetch data.'}
            </p>
            <Button variant="outline" className="mt-4" onClick={syncData}>Sync Data</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredIdeas.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {filteredIdeas.length} {painOnly ? 'pain signals' : 'posts'}
          </p>
          {filteredIdeas.map((idea) => {
            const painBadge = getPainBadge(idea.pain_score || 0)
            return (
              <Card key={idea.id} className={painBadge ? 'border-l-4 border-l-orange-500/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 mr-4">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getSourceColor(idea.source)}>
                          {idea.source === 'hackernews' ? 'HackerNews' : `r/${idea.subreddit || idea.source}`}
                        </Badge>
                        {painBadge && (
                          <Badge variant="outline" className={painBadge.color}>
                            <Flame className="h-3 w-3 mr-1" />
                            {painBadge.label} ({idea.pain_score})
                          </Badge>
                        )}
                        <span className="text-muted-foreground">-</span>
                        <span>{new Date(idea.source_created_at).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={idea.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {idea.body && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{idea.body}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />{idea.score}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />{idea.comments_count}
                      </div>
                    </div>
                    {idea.keywords && idea.keywords.length > 0 && (
                      <div className="flex gap-2">
                        {idea.keywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

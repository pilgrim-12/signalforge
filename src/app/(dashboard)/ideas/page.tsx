'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, MessageSquare, ThumbsUp, Search, RefreshCw, Loader2 } from 'lucide-react'

interface Idea {
  id: string
  title: string
  body: string
  source: string
  url: string
  score: number
  numComments: number
  createdAt: Date
  keywords: string[]
}

const TECH_KEYWORDS = ['api', 'saas', 'app', 'tool', 'software', 'platform', 'dashboard', 'automation', 'ai', 'analytics', 'startup', 'product']

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return TECH_KEYWORDS.filter(kw => lower.includes(kw)).slice(0, 5)
}

interface ApiPost {
  data: { id: string; title: string; selftext: string; subreddit: string; permalink: string; score: number; num_comments: number; created_utc: number }
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch from both sources in parallel
      const [redditRes, hnRes] = await Promise.all([
        fetch('/api/reddit').catch(() => null),
        fetch('/api/hackernews').catch(() => null),
      ])

      const allIdeas: Idea[] = []

      // Process Reddit/mock data
      if (redditRes?.ok) {
        const redditJson = await redditRes.json()
        if (redditJson.data?.children) {
          const redditIdeas = redditJson.data.children.map((child: ApiPost) => ({
            id: 'reddit-' + child.data.id,
            title: child.data.title,
            body: child.data.selftext || '',
            source: child.data.subreddit === 'HackerNews' ? 'HackerNews' : (redditJson.source === 'mock' ? 'Example' : 'r/' + child.data.subreddit),
            url: child.data.subreddit === 'HackerNews'
              ? 'https://news.ycombinator.com' + child.data.permalink
              : 'https://reddit.com' + child.data.permalink,
            score: child.data.score,
            numComments: child.data.num_comments,
            createdAt: new Date(child.data.created_utc * 1000),
            keywords: extractKeywords(child.data.title + ' ' + (child.data.selftext || '')),
          }))
          allIdeas.push(...redditIdeas)
        }
      }

      // Process HackerNews data
      if (hnRes?.ok) {
        const hnJson = await hnRes.json()
        if (hnJson.data?.children) {
          const hnIdeas = hnJson.data.children.map((child: ApiPost) => ({
            id: 'hn-' + child.data.id,
            title: child.data.title,
            body: child.data.selftext || '',
            source: 'HackerNews',
            url: 'https://news.ycombinator.com/item?id=' + child.data.id,
            score: child.data.score,
            numComments: child.data.num_comments,
            createdAt: new Date(child.data.created_utc * 1000),
            keywords: extractKeywords(child.data.title + ' ' + (child.data.selftext || '')),
          }))
          allIdeas.push(...hnIdeas)
        }
      }

      if (allIdeas.length === 0) {
        throw new Error('No data from any source')
      }

      // Sort by score and dedupe by title
      const seen = new Set<string>()
      const uniqueIdeas = allIdeas
        .sort((a, b) => b.score - a.score)
        .filter(idea => {
          const key = idea.title.toLowerCase().slice(0, 50)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

      setIdeas(uniqueIdeas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pain points')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchIdeas() }, [])

  const filteredIdeas = ideas.filter(idea => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return idea.title.toLowerCase().includes(q) || idea.body.toLowerCase().includes(q) || idea.source.toLowerCase().includes(q)
  })

  const getSourceColor = (source: string) => {
    if (source === 'HackerNews') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (source === 'Example') return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pain Points</h1>
          <p className="text-muted-foreground">Discover user problems and product ideas from Reddit & Hacker News</p>
        </div>
        <Button variant="outline" onClick={fetchIdeas} disabled={loading}>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pain points..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

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
          <p className="mt-4 text-muted-foreground">Searching for pain points...</p>
        </div>
      )}

      {!loading && !error && filteredIdeas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pain points found</p>
            <Button variant="outline" className="mt-4" onClick={fetchIdeas}>Search Again</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredIdeas.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Found {filteredIdeas.length} pain points</p>
          {filteredIdeas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 mr-4">
                    <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline" className={getSourceColor(idea.source)}>{idea.source}</Badge>
                      <span className="text-muted-foreground">-</span>
                      <span>{idea.createdAt.toLocaleDateString()}</span>
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
                {idea.body && <p className="text-sm text-muted-foreground line-clamp-3">{idea.body}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />{idea.score}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />{idea.numComments}
                    </div>
                  </div>
                  {idea.keywords.length > 0 && (
                    <div className="flex gap-2">
                      {idea.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

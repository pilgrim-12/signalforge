'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, MessageSquare, ThumbsUp, Search, Filter, RefreshCw, Loader2 } from 'lucide-react'
import type { Idea } from '@/lib/reddit-client'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reddit/search')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ideas')
      }

      setIdeas(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pain points')
      console.error('Error fetching ideas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  const filteredIdeas = ideas.filter(idea => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      idea.title.toLowerCase().includes(query) ||
      idea.body.toLowerCase().includes(query) ||
      idea.subreddit.toLowerCase().includes(query) ||
      idea.keywords.some(k => k.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pain Points</h1>
          <p className="text-muted-foreground">
            Discover user problems and product ideas from Reddit
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchIdeas} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pain points..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchIdeas}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            Searching Reddit for pain points...
          </p>
          <p className="text-sm text-muted-foreground">
            This may take a minute due to rate limiting
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredIdeas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pain points found</p>
            <Button variant="outline" className="mt-4" onClick={fetchIdeas}>
              Search Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ideas List */}
      {!loading && !error && filteredIdeas.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {filteredIdeas.length} pain points
          </p>
          {filteredIdeas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">
                      {idea.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary">r/{idea.subreddit}</Badge>
                      <span>•</span>
                      <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
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
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {idea.body}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      {idea.score}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      {idea.numComments}
                    </div>
                  </div>

                  {idea.keywords.length > 0 && (
                    <div className="flex gap-2">
                      {idea.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
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

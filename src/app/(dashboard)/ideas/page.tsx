'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, MessageSquare, ThumbsUp, Search, Filter, RefreshCw, Loader2 } from 'lucide-react'

interface Idea {
  id: string
  title: string
  body: string
  subreddit: string
  url: string
  score: number
  numComments: number
  createdAt: Date
  keywords: string[]
}

const DEFAULT_SUBREDDITS = ['SaaS', 'startups', 'Entrepreneur', 'SideProject', 'indiehackers', 'webdev']
const TECH_KEYWORDS = ['api', 'saas', 'app', 'tool', 'software', 'platform', 'dashboard', 'automation', 'ai', 'analytics']

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return TECH_KEYWORDS.filter(kw => lower.includes(kw)).slice(0, 5)
}

interface RedditPost {
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
      const query = encodeURIComponent('I wish there was OR looking for a tool OR need an app')
      const subreddits = DEFAULT_SUBREDDITS.join('+')
      const url = 'https://www.reddit.com/r/' + subreddits + '/search.json?q=' + query + '&sort=new&limit=50&restrict_sr=1'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Reddit API error: ' + response.status)
      const json = await response.json()
      const fetchedIdeas: Idea[] = json.data.children.map((child: RedditPost) => ({
        id: child.data.id,
        title: child.data.title,
        body: child.data.selftext || '',
        subreddit: child.data.subreddit,
        url: 'https://reddit.com' + child.data.permalink,
        score: child.data.score,
        numComments: child.data.num_comments,
        createdAt: new Date(child.data.created_utc * 1000),
        keywords: extractKeywords(child.data.title + ' ' + (child.data.selftext || '')),
      }))
      fetchedIdeas.sort((a, b) => b.score - a.score)
      setIdeas(fetchedIdeas)
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
    return idea.title.toLowerCase().includes(q) || idea.body.toLowerCase().includes(q) || idea.subreddit.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pain Points</h1>
          <p className="text-muted-foreground">Discover user problems and product ideas from Reddit</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchIdeas} disabled={loading}>
            <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />Refresh
          </Button>
          <Button><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pain points..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>
      {error && (<Card className="border-destructive"><CardContent className="pt-6"><p className="text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={fetchIdeas}>Try Again</Button></CardContent></Card>)}
      {loading && (<div className="flex flex-col items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="mt-4 text-muted-foreground">Searching Reddit...</p></div>)}
      {!loading && !error && filteredIdeas.length === 0 && (<Card><CardContent className="flex flex-col items-center justify-center py-12"><p className="text-muted-foreground">No pain points found</p><Button variant="outline" className="mt-4" onClick={fetchIdeas}>Search Again</Button></CardContent></Card>)}
      {!loading && !error && filteredIdeas.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Found {filteredIdeas.length} pain points</p>
          {filteredIdeas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary">r/{idea.subreddit}</Badge>
                      <span>-</span>
                      <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" asChild><a href={idea.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {idea.body && <p className="text-sm text-muted-foreground line-clamp-3">{idea.body}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><ThumbsUp className="h-4 w-4" />{idea.score}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><MessageSquare className="h-4 w-4" />{idea.numComments}</div>
                  </div>
                  {idea.keywords.length > 0 && <div className="flex gap-2">{idea.keywords.slice(0, 3).map((keyword) => (<Badge key={keyword} variant="outline">{keyword}</Badge>))}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

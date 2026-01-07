import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, MessageSquare, ThumbsUp, Search, Filter } from 'lucide-react'

// Mock data - will be replaced with real data from Supabase
const mockIdeas = [
  {
    id: '1',
    title: 'I wish there was a tool that could automatically track my SaaS metrics across platforms',
    body: 'Currently using 5 different dashboards to monitor MRR, churn, etc. Would pay good money for something that consolidates everything.',
    source: 'reddit',
    subreddit: 'SaaS',
    score: 234,
    commentsCount: 45,
    keywords: ['SaaS', 'metrics', 'dashboard', 'MRR'],
    url: 'https://reddit.com/r/SaaS/...',
    sourceCreatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Frustrated with the lack of good AI writing tools for technical documentation',
    body: 'ChatGPT is okay but doesn\'t understand our codebase. Need something that can actually read our code and generate docs.',
    source: 'reddit',
    subreddit: 'webdev',
    score: 187,
    commentsCount: 32,
    keywords: ['AI', 'documentation', 'writing', 'technical'],
    url: 'https://reddit.com/r/webdev/...',
    sourceCreatedAt: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    title: 'Looking for a tool to manage multiple Discord communities',
    body: 'Running 3 Discord servers for different products. Need a unified dashboard for analytics and moderation.',
    source: 'reddit',
    subreddit: 'Entrepreneur',
    score: 156,
    commentsCount: 28,
    keywords: ['Discord', 'community', 'management', 'analytics'],
    url: 'https://reddit.com/r/Entrepreneur/...',
    sourceCreatedAt: '2024-01-15T08:00:00Z',
  },
]

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pain Points</h1>
          <p className="text-muted-foreground">
            Discover user problems and product ideas from Reddit and Hacker News
          </p>
        </div>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pain points..." className="pl-10" />
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {mockIdeas.map((idea) => (
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
                    <span>{new Date(idea.sourceCreatedAt).toLocaleDateString()}</span>
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
              <p className="text-sm text-muted-foreground">{idea.body}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    {idea.score}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {idea.commentsCount}
                  </div>
                </div>

                <div className="flex gap-2">
                  {idea.keywords.slice(0, 3).map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
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

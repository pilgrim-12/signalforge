import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Users, Search, Filter, CheckCircle, XCircle } from 'lucide-react'

// Mock data
const mockCommunities = [
  {
    id: '1',
    name: 'r/SaaS',
    platform: 'reddit',
    url: 'https://reddit.com/r/SaaS',
    subscribers: 125000,
    allowsPromotion: true,
    tags: ['SaaS', 'startups', 'B2B'],
    rules: 'Self-promotion allowed on Saturdays only',
  },
  {
    id: '2',
    name: 'r/Entrepreneur',
    platform: 'reddit',
    url: 'https://reddit.com/r/Entrepreneur',
    subscribers: 2100000,
    allowsPromotion: false,
    tags: ['business', 'startups', 'entrepreneurship'],
    rules: 'No self-promotion',
  },
  {
    id: '3',
    name: 'Indie Hackers',
    platform: 'discord',
    url: 'https://discord.gg/indiehackers',
    subscribers: 45000,
    allowsPromotion: true,
    tags: ['indie hackers', 'SaaS', 'bootstrapping'],
    rules: 'Share in #show-and-tell channel',
  },
  {
    id: '4',
    name: 'r/webdev',
    platform: 'reddit',
    url: 'https://reddit.com/r/webdev',
    subscribers: 1800000,
    allowsPromotion: true,
    tags: ['web development', 'programming', 'frontend'],
    rules: 'Self-promotion in weekly thread only',
  },
]

function formatSubscribers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
}

export default function CommunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Find the best communities to promote your product
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
          <Input placeholder="Search communities..." className="pl-10" />
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockCommunities.map((community) => (
          <Card key={community.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {community.name}
                    <Badge variant="secondary">{community.platform}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {formatSubscribers(community.subscribers)} members
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <a href={community.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {community.allowsPromotion ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Allows promotion</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">No promotion</span>
                  </>
                )}
              </div>

              {community.rules && (
                <p className="text-sm text-muted-foreground">
                  {community.rules}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

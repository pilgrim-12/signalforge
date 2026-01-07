'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Users, Search, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Community {
  id: string
  platform: string
  name: string
  url: string
  description: string | null
  subscribers: number
  allows_promotion: boolean
  tags: string[]
  rules: string | null
}

function formatSubscribers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'reddit': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'hackernews': return 'bg-orange-600/10 text-orange-600 border-orange-600/20'
    case 'discord': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    case 'slack': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCommunities = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/communities')
      if (res.ok) {
        const data = await res.json()
        setCommunities(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const filteredCommunities = communities.filter(c => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) ||
           c.platform.toLowerCase().includes(q) ||
           c.tags?.some(t => t.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Find the best communities to promote your product
          </p>
        </div>
        <Button variant="outline" onClick={fetchCommunities} disabled={loading}>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && filteredCommunities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No communities found. Run the SQL migration to add default communities.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Communities Grid */}
      {!loading && filteredCommunities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCommunities.map((community) => (
            <Card key={community.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {community.name}
                      <Badge variant="outline" className={getPlatformColor(community.platform)}>
                        {community.platform}
                      </Badge>
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
                {community.description && (
                  <p className="text-sm text-muted-foreground">{community.description}</p>
                )}

                <div className="flex items-center gap-2">
                  {community.allows_promotion ? (
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
                  <p className="text-sm text-muted-foreground italic">
                    {community.rules}
                  </p>
                )}

                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
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

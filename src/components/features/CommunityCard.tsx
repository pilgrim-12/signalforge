import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Users, CheckCircle, XCircle } from 'lucide-react'
import type { Community } from '@/types'

interface CommunityCardProps {
  community: Community
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

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Card>
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
          <p className="text-sm text-muted-foreground">{community.rules}</p>
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
  )
}

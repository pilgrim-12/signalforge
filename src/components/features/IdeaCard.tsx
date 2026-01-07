import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react'
import type { Idea } from '@/types'

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">
              {idea.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {idea.subreddit && (
                <>
                  <Badge variant="secondary">r/{idea.subreddit}</Badge>
                  <span>•</span>
                </>
              )}
              <span>{idea.sourceCreatedAt.toLocaleDateString()}</span>
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
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Idea } from '@/types'
import type { Database } from '@/lib/supabase/types'

type IdeaRow = Database['public']['Tables']['ideas']['Row']

interface UseIdeasOptions {
  limit?: number
  source?: 'reddit' | 'hackernews' | 'twitter'
  subreddit?: string
}

export function useIdeas(options: UseIdeasOptions = {}) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { limit = 20, source, subreddit } = options

  useEffect(() => {
    fetchIdeas()
  }, [limit, source, subreddit])

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('ideas')
        .select('*')
        .order('source_created_at', { ascending: false })
        .limit(limit)

      if (source) {
        query = query.eq('source', source)
      }

      if (subreddit) {
        query = query.eq('subreddit', subreddit)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        throw new Error(queryError.message)
      }

      const transformedIdeas: Idea[] = (data || []).map((item: IdeaRow) => ({
        id: item.id,
        source: item.source,
        sourceId: item.source_id,
        subreddit: item.subreddit || undefined,
        title: item.title,
        body: item.body || undefined,
        url: item.url,
        score: item.score,
        commentsCount: item.comments_count,
        keywords: item.keywords,
        createdAt: new Date(item.created_at),
        sourceCreatedAt: new Date(item.source_created_at),
      }))

      setIdeas(transformedIdeas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas')
    } finally {
      setLoading(false)
    }
  }

  return {
    ideas,
    loading,
    error,
    refetch: fetchIdeas,
  }
}

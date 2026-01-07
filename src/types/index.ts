// Re-export database types
export type { Database } from '@/lib/supabase/types'

// User types
export interface User {
  id: string
  email: string
  plan: 'free' | 'pro' | 'business'
  createdAt: Date
}

// Idea (Pain Point) types
export interface Idea {
  id: string
  source: 'reddit' | 'hackernews' | 'twitter'
  sourceId: string
  subreddit?: string
  title: string
  body?: string
  url: string
  score: number
  commentsCount: number
  keywords: string[]
  createdAt: Date
  sourceCreatedAt: Date
}

// Community types
export interface Community {
  id: string
  platform: 'reddit' | 'discord' | 'slack'
  name: string
  url: string
  subscribers: number
  allowsPromotion: boolean
  tags: string[]
  rules?: string
  createdAt: Date
}

// Alert types
export interface Alert {
  id: string
  userId: string
  keywords: string[]
  subreddits: string[]
  isActive: boolean
  createdAt: Date
}

// Trend types
export interface TrendSnapshot {
  id: string
  keyword: string
  mentionCount: number
  avgScore: number
  snapshotDate: Date
  createdAt: Date
}

export interface TrendData {
  keyword: string
  data: {
    date: string
    mentions: number
    avgScore: number
  }[]
  weekOverWeekChange: number
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

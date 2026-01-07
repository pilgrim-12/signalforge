export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          plan: 'free' | 'pro' | 'business'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          plan?: 'free' | 'pro' | 'business'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          plan?: 'free' | 'pro' | 'business'
          created_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          source: 'reddit' | 'hackernews' | 'twitter'
          source_id: string
          subreddit: string | null
          title: string
          body: string | null
          url: string
          score: number
          comments_count: number
          keywords: string[]
          created_at: string
          source_created_at: string
        }
        Insert: {
          id?: string
          source: 'reddit' | 'hackernews' | 'twitter'
          source_id: string
          subreddit?: string | null
          title: string
          body?: string | null
          url: string
          score?: number
          comments_count?: number
          keywords?: string[]
          created_at?: string
          source_created_at: string
        }
        Update: {
          id?: string
          source?: 'reddit' | 'hackernews' | 'twitter'
          source_id?: string
          subreddit?: string | null
          title?: string
          body?: string | null
          url?: string
          score?: number
          comments_count?: number
          keywords?: string[]
          created_at?: string
          source_created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          platform: 'reddit' | 'discord' | 'slack' | 'hackernews'
          name: string
          url: string
          description: string | null
          subscribers: number
          allows_promotion: boolean
          tags: string[]
          rules: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          platform: 'reddit' | 'discord' | 'slack' | 'hackernews'
          name: string
          url: string
          description?: string | null
          subscribers?: number
          allows_promotion?: boolean
          tags?: string[]
          rules?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          platform?: 'reddit' | 'discord' | 'slack' | 'hackernews'
          name?: string
          url?: string
          description?: string | null
          subscribers?: number
          allows_promotion?: boolean
          tags?: string[]
          rules?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          name: string
          keywords: string[]
          subreddits: string[]
          is_active: boolean
          last_triggered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          keywords: string[]
          subreddits?: string[]
          is_active?: boolean
          last_triggered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          keywords?: string[]
          subreddits?: string[]
          is_active?: boolean
          last_triggered_at?: string | null
          created_at?: string
        }
      }
      trend_snapshots: {
        Row: {
          id: string
          keyword: string
          mention_count: number
          avg_score: number
          snapshot_date: string
          created_at: string
        }
        Insert: {
          id?: string
          keyword: string
          mention_count: number
          avg_score: number
          snapshot_date: string
          created_at?: string
        }
        Update: {
          id?: string
          keyword?: string
          mention_count?: number
          avg_score?: number
          snapshot_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

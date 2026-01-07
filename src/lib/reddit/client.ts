import Snoowrap from 'snoowrap'

// Reddit client singleton
let redditClient: Snoowrap | null = null

export function getRedditClient(): Snoowrap {
  if (!redditClient) {
    redditClient = new Snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      // Using script-type app (no refresh token needed for read-only)
      username: '',
      password: '',
    })

    // Configure rate limiting
    redditClient.config({
      requestDelay: 1000,
      continueAfterRatelimitError: true,
    })
  }

  return redditClient
}

// Pain point search patterns
export const PAIN_POINT_PATTERNS = [
  'I wish there was',
  'frustrated with',
  'need app for',
  'why isn\'t there',
  'looking for a tool',
  'does anyone know',
  'is there an app',
  'need a way to',
  'struggling to find',
  'anyone recommend',
]

export interface RedditPost {
  id: string
  title: string
  selftext: string
  url: string
  subreddit: string
  score: number
  num_comments: number
  created_utc: number
  permalink: string
}

export async function searchSubreddit(
  subreddit: string,
  query: string,
  options?: { limit?: number; time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' }
): Promise<RedditPost[]> {
  const client = getRedditClient()
  const searchOptions = {
    query,
    time: options?.time || 'week',
    sort: 'relevance' as const,
  }

  // Get results and apply limit manually since snoowrap types are inconsistent
  const results = await client.getSubreddit(subreddit).search(searchOptions)
  const limitedResults = results.slice(0, options?.limit || 25)

  return limitedResults.map((post) => ({
    id: post.id,
    title: post.title,
    selftext: post.selftext,
    url: post.url,
    subreddit: (post.subreddit as { display_name: string }).display_name,
    score: post.score,
    num_comments: post.num_comments,
    created_utc: post.created_utc,
    permalink: `https://reddit.com${post.permalink}`,
  }))
}

export async function searchPainPoints(
  subreddits: string[],
  options?: { limit?: number }
): Promise<RedditPost[]> {
  const allResults: RedditPost[] = []

  for (const subreddit of subreddits) {
    for (const pattern of PAIN_POINT_PATTERNS) {
      try {
        const results = await searchSubreddit(subreddit, pattern, {
          limit: options?.limit || 10,
          time: 'week',
        })
        allResults.push(...results)
      } catch (error) {
        console.error(`Error searching ${subreddit} for "${pattern}":`, error)
      }
    }
  }

  // Remove duplicates by post ID
  const uniqueResults = Array.from(
    new Map(allResults.map((post) => [post.id, post])).values()
  )

  return uniqueResults
}

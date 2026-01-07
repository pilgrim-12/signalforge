// Reddit Public JSON API Client
// Uses public .json endpoints - no OAuth required

export interface Idea {
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

interface RedditPostData {
  id: string
  title: string
  selftext: string
  subreddit: string
  url: string
  score: number
  num_comments: number
  created_utc: number
  permalink: string
}

interface RedditListingResponse {
  data: {
    children: Array<{
      data: RedditPostData
    }>
    after: string | null
  }
}

// Default subreddits for pain point discovery
export const DEFAULT_SUBREDDITS = [
  'SaaS',
  'startups',
  'Entrepreneur',
  'SideProject',
  'indiehackers',
  'webdev',
]

// Pain point search patterns
export const PAIN_POINT_KEYWORDS = [
  'I wish there was',
  'frustrated with',
  'looking for a tool',
  'need an app',
  'why isn\'t there',
]

// Rate limiting state
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 6000 // 10 requests per minute = 6 seconds between requests
let consecutiveErrors = 0

const USER_AGENT = 'SignalForge/1.0 (market research tool)'

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest)
  }

  lastRequestTime = Date.now()

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })

  // Handle rate limiting with exponential backoff
  if (response.status === 429) {
    consecutiveErrors++
    const backoffTime = Math.min(60000, 1000 * Math.pow(2, consecutiveErrors))
    console.warn(`Rate limited by Reddit. Waiting ${backoffTime}ms before retry...`)
    await sleep(backoffTime)
    return rateLimitedFetch(url)
  }

  // Reset error counter on success
  if (response.ok) {
    consecutiveErrors = 0
  }

  return response
}

function extractKeywords(title: string, body: string): string[] {
  const text = `${title} ${body}`.toLowerCase()
  const keywords: string[] = []

  // Extract common tech/business keywords
  const techKeywords = [
    'api', 'saas', 'app', 'tool', 'software', 'platform', 'dashboard',
    'automation', 'ai', 'ml', 'analytics', 'integration', 'workflow',
    'database', 'cloud', 'mobile', 'web', 'startup', 'product',
    'marketing', 'sales', 'crm', 'erp', 'fintech', 'ecommerce',
    'subscription', 'billing', 'payment', 'notification', 'email',
    'slack', 'discord', 'notion', 'airtable', 'zapier', 'stripe',
  ]

  for (const keyword of techKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  // Limit to top 5 keywords
  return keywords.slice(0, 5)
}

export function parseRedditPost(data: RedditPostData): Idea {
  return {
    id: data.id,
    title: data.title,
    body: data.selftext || '',
    subreddit: data.subreddit,
    url: `https://reddit.com${data.permalink}`,
    score: data.score,
    numComments: data.num_comments,
    createdAt: new Date(data.created_utc * 1000),
    keywords: extractKeywords(data.title, data.selftext || ''),
  }
}

export async function getNewPosts(subreddit: string, limit: number = 25): Promise<Idea[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`
    const response = await rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`)
    }

    const json: RedditListingResponse = await response.json()
    return json.data.children.map(child => parseRedditPost(child.data))
  } catch (error) {
    console.error(`Error fetching new posts from r/${subreddit}:`, error)
    throw error
  }
}

export async function searchSubreddit(
  subreddit: string,
  query: string,
  limit: number = 25
): Promise<Idea[]> {
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodedQuery}&restrict_sr=1&sort=new&limit=${limit}`
    const response = await rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`)
    }

    const json: RedditListingResponse = await response.json()
    return json.data.children.map(child => parseRedditPost(child.data))
  } catch (error) {
    console.error(`Error searching r/${subreddit} for "${query}":`, error)
    throw error
  }
}

export async function searchPainPoints(
  subreddits: string[] = DEFAULT_SUBREDDITS,
  keywords: string[] = PAIN_POINT_KEYWORDS,
  limitPerSearch: number = 10
): Promise<Idea[]> {
  const allResults: Idea[] = []
  const seenIds = new Set<string>()

  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      try {
        const results = await searchSubreddit(subreddit, keyword, limitPerSearch)

        // Deduplicate by post ID
        for (const idea of results) {
          if (!seenIds.has(idea.id)) {
            seenIds.add(idea.id)
            allResults.push(idea)
          }
        }
      } catch (error) {
        // Log error but continue with other searches
        console.error(`Failed to search r/${subreddit} for "${keyword}":`, error)
      }
    }
  }

  // Sort by score (engagement) descending
  allResults.sort((a, b) => b.score - a.score)

  return allResults
}

// Quick search for a single subreddit (useful for testing)
export async function quickSearch(subreddit: string, query: string): Promise<Idea[]> {
  return searchSubreddit(subreddit, query, 10)
}

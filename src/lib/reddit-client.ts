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
  'why isnt there',
]

const USER_AGENT = 'SignalForge/1.0 (market research tool)'

async function redditFetch(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    throw new Error('Reddit API error: ' + response.status + ' ' + response.statusText)
  }

  return response
}

function extractKeywords(title: string, body: string): string[] {
  const text = (title + ' ' + body).toLowerCase()
  const keywords: string[] = []

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

  return keywords.slice(0, 5)
}

export function parseRedditPost(data: RedditPostData): Idea {
  return {
    id: data.id,
    title: data.title,
    body: data.selftext || '',
    subreddit: data.subreddit,
    url: 'https://reddit.com' + data.permalink,
    score: data.score,
    numComments: data.num_comments,
    createdAt: new Date(data.created_utc * 1000),
    keywords: extractKeywords(data.title, data.selftext || ''),
  }
}

export async function getNewPosts(subreddit: string, limit: number = 25): Promise<Idea[]> {
  const url = 'https://www.reddit.com/r/' + subreddit + '/new.json?limit=' + limit
  const response = await redditFetch(url)
  const json: RedditListingResponse = await response.json()
  return json.data.children.map(child => parseRedditPost(child.data))
}

export async function searchSubreddit(
  subreddit: string,
  query: string,
  limit: number = 25
): Promise<Idea[]> {
  const encodedQuery = encodeURIComponent(query)
  const url = 'https://www.reddit.com/r/' + subreddit + '/search.json?q=' + encodedQuery + '&restrict_sr=1&sort=new&limit=' + limit
  const response = await redditFetch(url)
  const json: RedditListingResponse = await response.json()
  return json.data.children.map(child => parseRedditPost(child.data))
}

// Quick search - single request, fast response for Vercel
export async function quickPainPointSearch(limit: number = 50): Promise<Idea[]> {
  // Search across all subreddits at once using Reddit's global search
  const query = 'I wish there was OR looking for a tool OR need an app OR frustrated with'
  const encodedQuery = encodeURIComponent(query)
  const subreddits = DEFAULT_SUBREDDITS.join('+')
  const url = 'https://www.reddit.com/r/' + subreddits + '/search.json?q=' + encodedQuery + '&sort=new&limit=' + limit + '&restrict_sr=1'
  
  const response = await redditFetch(url)
  const json: RedditListingResponse = await response.json()
  
  const ideas = json.data.children.map(child => parseRedditPost(child.data))
  
  // Sort by score
  ideas.sort((a, b) => b.score - a.score)
  
  return ideas
}

// Full search - multiple requests (for cron jobs, not real-time)
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
        for (const idea of results) {
          if (!seenIds.has(idea.id)) {
            seenIds.add(idea.id)
            allResults.push(idea)
          }
        }
      } catch (error) {
        console.error('Failed to search r/' + subreddit + ' for "' + keyword + '":', error)
      }
    }
  }

  allResults.sort((a, b) => b.score - a.score)
  return allResults
}

// Pain point detection patterns
export const PAIN_POINT_PATTERNS = [
  { pattern: /i wish there was/i, weight: 1.0 },
  { pattern: /frustrated with/i, weight: 0.9 },
  { pattern: /need (?:an? )?(?:app|tool|software|solution) for/i, weight: 0.95 },
  { pattern: /why isn'?t there/i, weight: 0.85 },
  { pattern: /looking for (?:a|an) (?:tool|app|way)/i, weight: 0.8 },
  { pattern: /does anyone know/i, weight: 0.6 },
  { pattern: /is there an app/i, weight: 0.9 },
  { pattern: /need a way to/i, weight: 0.85 },
  { pattern: /struggling to find/i, weight: 0.75 },
  { pattern: /anyone recommend/i, weight: 0.7 },
  { pattern: /can'?t find (?:a|an|any)/i, weight: 0.8 },
  { pattern: /how do (?:you|i|we)/i, weight: 0.5 },
  { pattern: /any alternatives to/i, weight: 0.85 },
  { pattern: /tired of/i, weight: 0.7 },
  { pattern: /hate (?:that|when|how)/i, weight: 0.65 },
]

// Analyze text for pain point score
export function analyzePainPointScore(text: string): number {
  let score = 0
  let matchCount = 0

  for (const { pattern, weight } of PAIN_POINT_PATTERNS) {
    if (pattern.test(text)) {
      score += weight
      matchCount++
    }
  }

  // Normalize score (0-100)
  return matchCount > 0 ? Math.min(100, (score / matchCount) * 100) : 0
}

// Extract keywords from text
export function extractKeywords(text: string): string[] {
  // Remove common words and extract meaningful keywords
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'also', 'now', 'here', 'there', 'then', 'any', 'my',
    'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them',
  ])

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))

  // Count word frequency
  const wordCount = new Map<string, number>()
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  }

  // Return top keywords by frequency
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

// Target subreddits for pain point discovery
export const TARGET_SUBREDDITS = [
  'SaaS',
  'startups',
  'Entrepreneur',
  'smallbusiness',
  'indiehackers',
  'webdev',
  'programming',
  'sideproject',
  'IMadeThis',
  'alphaandbetausers',
  'AppIdeas',
  'microsaas',
  'NoCode',
  'automation',
  'productivity',
]

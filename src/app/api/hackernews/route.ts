import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HNItem {
  id: number;
  title?: string;
  text?: string;
  by?: string;
  score?: number;
  descendants?: number;
  time?: number;
  type?: string;
  url?: string;
}

const PAIN_POINT_KEYWORDS = [
  'wish', 'frustrated', 'looking for', 'need', 'want', 'problem',
  'annoying', 'difficult', 'hard to', 'cant find', 'doesnt exist',
  'why isnt', 'someone should', 'would pay', 'startup idea'
];

function isPainPoint(title: string, text: string = ''): boolean {
  const content = (title + ' ' + text).toLowerCase();
  return PAIN_POINT_KEYWORDS.some(kw => content.includes(kw));
}

export async function GET() {
  try {
    // Get top and new stories
    const [topRes, newRes, askRes] = await Promise.all([
      fetch('https://hacker-news.firebaseio.com/v0/topstories.json'),
      fetch('https://hacker-news.firebaseio.com/v0/newstories.json'),
      fetch('https://hacker-news.firebaseio.com/v0/askstories.json'),
    ]);

    const topIds: number[] = await topRes.json();
    const newIds: number[] = await newRes.json();
    const askIds: number[] = await askRes.json();

    // Combine and dedupe, take first 100
    const allIds = [...new Set([...askIds.slice(0, 50), ...topIds.slice(0, 30), ...newIds.slice(0, 30)])].slice(0, 100);

    // Fetch items in parallel
    const itemPromises = allIds.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
    );

    const items: HNItem[] = await Promise.all(itemPromises);

    // Filter for pain points and format
    const painPoints = items
      .filter(item => item && item.title && item.type === 'story')
      .filter(item => isPainPoint(item.title || '', item.text || ''))
      .map(item => ({
        data: {
          id: String(item.id),
          title: item.title || '',
          selftext: item.text || '',
          subreddit: 'HackerNews',
          permalink: `/item?id=${item.id}`,
          score: item.score || 0,
          num_comments: item.descendants || 0,
          created_utc: item.time || Math.floor(Date.now() / 1000),
        }
      }))
      .sort((a, b) => b.data.score - a.data.score)
      .slice(0, 25);

    return NextResponse.json({
      data: { children: painPoints },
      source: 'hackernews'
    });
  } catch (error) {
    console.error('HackerNews API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from HackerNews', data: { children: [] } },
      { status: 500 }
    );
  }
}

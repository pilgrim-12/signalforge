import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddits = searchParams.get('subreddits') || 'SaaS,startups,Entrepreneur,SideProject,indiehackers,webdev';
  const query = searchParams.get('query') || 'I wish there was,looking for a tool,need an app,frustrated with';

  const subredditList = subreddits.split(',').join('+');
  const searchQuery = query.split(',').map(q => q.trim()).join(' OR ');
  const url = `https://www.reddit.com/r/${subredditList}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&limit=50&restrict_sr=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SignalForge/1.0 (web:signalforge:v1.0)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reddit fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Reddit', details: String(error) },
      { status: 500 }
    );
  }
}

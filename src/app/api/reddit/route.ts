import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddits = searchParams.get('subreddits') || 'SaaS,startups,Entrepreneur,SideProject,indiehackers,webdev';
  const query = searchParams.get('query') || 'I wish there was,looking for a tool,need an app,frustrated with';

  try {
    const subredditList = subreddits.split(',').join('+');
    const searchQuery = query.split(',').map(q => q.trim()).join(' OR ');
    const url = `https://www.reddit.com/r/${subredditList}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&limit=50&restrict_sr=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SignalForge/1.0 (by /u/Upstairs_Sink9557)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reddit API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

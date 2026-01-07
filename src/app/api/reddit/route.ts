import { NextRequest, NextResponse } from 'next/server';

// Mock data for when Reddit blocks requests
const MOCK_DATA = {
  data: {
    children: [
      { data: { id: '1', title: 'I wish there was a tool to automate my social media scheduling', selftext: 'Managing multiple platforms is exhausting. Looking for something that can post to Twitter, LinkedIn, and Instagram at once.', subreddit: 'SaaS', permalink: '/r/SaaS/comments/1/mock', score: 156, num_comments: 34, created_utc: Date.now() / 1000 - 3600 }},
      { data: { id: '2', title: 'Frustrated with existing CRM tools - they are all too complex', selftext: 'I just need something simple for a small team. Salesforce and HubSpot are overkill.', subreddit: 'startups', permalink: '/r/startups/comments/2/mock', score: 89, num_comments: 23, created_utc: Date.now() / 1000 - 7200 }},
      { data: { id: '3', title: 'Looking for a tool to track competitor pricing changes', selftext: 'Need to monitor when competitors change their prices. Manual checking is not scalable.', subreddit: 'Entrepreneur', permalink: '/r/Entrepreneur/comments/3/mock', score: 67, num_comments: 12, created_utc: Date.now() / 1000 - 10800 }},
      { data: { id: '4', title: 'Need an app that converts Figma designs to React components', selftext: 'Tired of manually converting designs. AI should be able to do this by now.', subreddit: 'webdev', permalink: '/r/webdev/comments/4/mock', score: 234, num_comments: 56, created_utc: Date.now() / 1000 - 14400 }},
      { data: { id: '5', title: 'I wish there was a simple invoicing tool for freelancers', selftext: 'Most tools are designed for agencies. I just need to send 5-10 invoices a month.', subreddit: 'SideProject', permalink: '/r/SideProject/comments/5/mock', score: 45, num_comments: 18, created_utc: Date.now() / 1000 - 18000 }},
      { data: { id: '6', title: 'Looking for API monitoring that actually alerts me before customers notice', selftext: 'Current monitoring tools only tell me after things are broken. Need predictive alerts.', subreddit: 'SaaS', permalink: '/r/SaaS/comments/6/mock', score: 123, num_comments: 29, created_utc: Date.now() / 1000 - 21600 }},
      { data: { id: '7', title: 'Frustrated with email marketing platforms - deliverability is terrible', selftext: 'Tried Mailchimp, SendGrid, and others. Half my emails go to spam.', subreddit: 'indiehackers', permalink: '/r/indiehackers/comments/7/mock', score: 78, num_comments: 41, created_utc: Date.now() / 1000 - 25200 }},
      { data: { id: '8', title: 'Need a tool for managing customer feedback across multiple channels', selftext: 'Getting feedback from email, Twitter, Discord, and support tickets. Need one place to see it all.', subreddit: 'startups', permalink: '/r/startups/comments/8/mock', score: 92, num_comments: 15, created_utc: Date.now() / 1000 - 28800 }},
    ]
  }
};

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
      // Reddit blocked us, return mock data
      console.log('Reddit blocked request, returning mock data');
      return NextResponse.json(MOCK_DATA);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reddit API error:', error);
    // Return mock data on any error
    return NextResponse.json(MOCK_DATA);
  }
}

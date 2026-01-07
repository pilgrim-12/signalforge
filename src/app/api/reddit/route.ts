import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Reddit OAuth credentials (set in Vercel environment variables)
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

async function getRedditAccessToken(): Promise<string | null> {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    return null;
  }

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'SignalForge/1.0',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    console.error('Failed to get Reddit token:', response.status);
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

// Fallback mock data
const MOCK_DATA = {
  data: {
    children: [
      { data: { id: '1', title: 'I wish there was a tool to automate my social media scheduling', selftext: 'Managing multiple platforms is exhausting. Looking for something that can post to Twitter, LinkedIn, and Instagram at once.', subreddit: 'SaaS', permalink: '/r/SaaS/comments/1/example', score: 156, num_comments: 34, created_utc: Math.floor(Date.now() / 1000) - 3600 }},
      { data: { id: '2', title: 'Frustrated with existing CRM tools - they are all too complex', selftext: 'I just need something simple for a small team. Salesforce and HubSpot are overkill.', subreddit: 'startups', permalink: '/r/startups/comments/2/example', score: 89, num_comments: 23, created_utc: Math.floor(Date.now() / 1000) - 7200 }},
      { data: { id: '3', title: 'Looking for a tool to track competitor pricing changes', selftext: 'Need to monitor when competitors change their prices. Manual checking is not scalable.', subreddit: 'Entrepreneur', permalink: '/r/Entrepreneur/comments/3/example', score: 67, num_comments: 12, created_utc: Math.floor(Date.now() / 1000) - 10800 }},
      { data: { id: '4', title: 'Need an app that converts Figma designs to React components', selftext: 'Tired of manually converting designs. AI should be able to do this by now.', subreddit: 'webdev', permalink: '/r/webdev/comments/4/example', score: 234, num_comments: 56, created_utc: Math.floor(Date.now() / 1000) - 14400 }},
      { data: { id: '5', title: 'I wish there was a simple invoicing tool for freelancers', selftext: 'Most tools are designed for agencies. I just need to send 5-10 invoices a month.', subreddit: 'SideProject', permalink: '/r/SideProject/comments/5/example', score: 45, num_comments: 18, created_utc: Math.floor(Date.now() / 1000) - 18000 }},
      { data: { id: '6', title: 'Looking for API monitoring that actually alerts before customers notice', selftext: 'Current monitoring tools only tell me after things are broken. Need predictive alerts.', subreddit: 'SaaS', permalink: '/r/SaaS/comments/6/example', score: 123, num_comments: 29, created_utc: Math.floor(Date.now() / 1000) - 21600 }},
      { data: { id: '7', title: 'Frustrated with email marketing platforms - deliverability is terrible', selftext: 'Tried Mailchimp, SendGrid, and others. Half my emails go to spam.', subreddit: 'indiehackers', permalink: '/r/indiehackers/comments/7/example', score: 78, num_comments: 41, created_utc: Math.floor(Date.now() / 1000) - 25200 }},
      { data: { id: '8', title: 'Need a tool for managing customer feedback across multiple channels', selftext: 'Getting feedback from email, Twitter, Discord, and support tickets. Need one place to see it all.', subreddit: 'startups', permalink: '/r/startups/comments/8/example', score: 92, num_comments: 15, created_utc: Math.floor(Date.now() / 1000) - 28800 }},
    ]
  }
};

export async function GET() {
  const subreddits = 'SaaS+startups+Entrepreneur+SideProject+indiehackers+webdev';
  const query = 'I wish there was OR looking for a tool OR need an app OR frustrated with';

  // Try OAuth first
  const token = await getRedditAccessToken();

  if (token) {
    try {
      const url = `https://oauth.reddit.com/r/${subreddits}/search?q=${encodeURIComponent(query)}&sort=new&limit=50&restrict_sr=1`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'SignalForge/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      console.error('Reddit OAuth API error:', response.status);
    } catch (error) {
      console.error('Reddit OAuth fetch error:', error);
    }
  }

  // Fallback to mock data if OAuth not configured or failed
  console.log('Using mock data (Reddit OAuth not configured or failed)');
  return NextResponse.json({ ...MOCK_DATA, source: 'mock' });
}

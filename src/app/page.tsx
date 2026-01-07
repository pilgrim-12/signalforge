import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Users, TrendingUp, Bell, ArrowRight, Zap, Target, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Lightbulb,
    title: 'Pain Point Scanner',
    description: 'Automatically find user problems and frustrations across Reddit and Hacker News using AI-powered pattern matching.',
  },
  {
    icon: Users,
    title: 'Community Finder',
    description: 'Discover the best communities to promote your product with detailed rules and promotion policies.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Tracker',
    description: 'Track keyword mentions over time and spot emerging trends before they go mainstream.',
  },
  {
    icon: Bell,
    title: 'Keyword Alerts',
    description: 'Get instant notifications when new posts match your keywords across monitored platforms.',
  },
]

const benefits = [
  {
    icon: Zap,
    title: 'Save 10+ hours weekly',
    description: 'Automate your market research instead of manually browsing Reddit threads.',
  },
  {
    icon: Target,
    title: 'Find validated ideas',
    description: 'Focus on problems people are actively complaining about, not assumptions.',
  },
  {
    icon: BarChart3,
    title: 'Data-driven decisions',
    description: 'Use engagement metrics to prioritize ideas with the most potential.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SignalForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
          Find Your Next{' '}
          <span className="text-primary">SaaS Idea</span>{' '}
          from Real User Pain Points
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          SignalForge scans Reddit, Hacker News, and more to find validated product opportunities.
          Stop guessing what to build — let the data guide you.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Everything You Need to Validate Ideas</h2>
            <p className="mt-4 text-muted-foreground">
              Powerful tools to help you find, track, and validate product opportunities
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">Why Indie Hackers Love SignalForge</h2>
              <p className="mt-4 text-muted-foreground">
                Join hundreds of entrepreneurs who use SignalForge to find their next big idea
              </p>
              <div className="mt-8 space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Recent Pain Point Found</CardTitle>
                  <CardDescription>r/SaaS • 2 hours ago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    "I wish there was a tool that could automatically track my SaaS metrics across all platforms. Currently using 5 different dashboards..."
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>234 upvotes</span>
                    <span>45 comments</span>
                    <span className="text-green-500">High potential</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card/50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Find Your Next Idea?</h2>
          <p className="mt-4 text-muted-foreground">
            Start discovering validated product opportunities today
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Lightbulb className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SignalForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SignalForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

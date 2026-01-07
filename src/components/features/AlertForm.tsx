'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface AlertFormProps {
  onSubmit: (data: { keywords: string[]; subreddits: string[] }) => void
}

export function AlertForm({ onSubmit }: AlertFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [subreddits, setSubreddits] = useState('')

  const handleSubmit = () => {
    const keywordList = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    const subredditList = subreddits
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (keywordList.length === 0) {
      return
    }

    onSubmit({
      keywords: keywordList,
      subreddits: subredditList,
    })

    setKeywords('')
    setSubreddits('')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>
            Set up keyword monitoring for specific subreddits
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma separated)</Label>
            <Input
              id="keywords"
              placeholder="SaaS, metrics, dashboard"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subreddits">Subreddits (comma separated)</Label>
            <Input
              id="subreddits"
              placeholder="SaaS, startups, Entrepreneur"
              value={subreddits}
              onChange={(e) => setSubreddits(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Alert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

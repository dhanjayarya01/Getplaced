"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"

const TECHNOLOGIES = ['React', 'Node.js', 'Next.js', 'Express', 'MongoDB', 'PostgreSQL', 'TypeScript', 'JavaScript', 'Python', 'Django', 'Flask']
const TOPICS = ['Hooks', 'State Management', 'Routing', 'API Integration', 'Authentication', 'Database Design', 'REST APIs', 'GraphQL']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const TYPES = ['coding', 'project', 'debugging', 'feature-implementation']

export default function AddDevelopmentProblem() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    difficulty: 'Beginner',
    primaryTechnology: 'React',
    technologies: [] as string[],
    topics: [] as string[],
    type: 'coding',
    companies: [] as string[],
    estimatedTime: '',
    xpReward: 100,
    hints: [''],
    // For coding type
    codingProblem: {
      starterCode: '',
      solution: '',
      testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    },
    // For project type
    projectProblem: {
      setupInstructions: '',
      tasks: [{ title: '', description: '', type: 'feature', hints: [''] }],
      files: [{ path: '', content: '', language: 'javascript' }]
    }
  })

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  const addCompany = (company: string) => {
    if (company && !formData.companies.includes(company)) {
      setFormData(prev => ({
        ...prev,
        companies: [...prev.companies, company]
      }))
    }
  }

  const removeCompany = (company: string) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.filter(c => c !== company)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.development.create(formData)
      if (response.success) {
        alert('Problem created successfully!')
        router.push('/admin/development')
      } else {
        alert('Failed to create problem: ' + response.message)
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to create problem'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Add Development Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (auto-generated)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input
                  id="estimatedTime"
                  placeholder="e.g., 30 minutes"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Primary Technology *</Label>
              <Select
                value={formData.primaryTechnology}
                onValueChange={(value) => setFormData(prev => ({ ...prev, primaryTechnology: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TECHNOLOGIES.map(tech => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Topics *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TOPICS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      topics: toggleArrayItem(prev.topics, topic)
                    }))}
                    className={`px-3 py-1 rounded text-sm ${
                      formData.topics.includes(topic)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Companies</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add company name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCompany((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.companies.map(company => (
                  <span key={company} className="bg-accent px-3 py-1 rounded text-sm flex items-center gap-2">
                    {company}
                    <button type="button" onClick={() => removeCompany(company)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coding Problem Fields */}
        {formData.type === 'coding' && (
          <Card>
            <CardHeader>
              <CardTitle>Coding Problem Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="starterCode">Starter Code</Label>
                <Textarea
                  id="starterCode"
                  value={formData.codingProblem.starterCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    codingProblem: { ...prev.codingProblem, starterCode: e.target.value }
                  }))}
                  rows={6}
                  placeholder="function solution() { ... }"
                />
              </div>

              <div>
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  id="solution"
                  value={formData.codingProblem.solution}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    codingProblem: { ...prev.codingProblem, solution: e.target.value }
                  }))}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Problem'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/development')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

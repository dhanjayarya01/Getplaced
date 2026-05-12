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

const TECHNOLOGIES = ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Spring Boot', 'MongoDB', 'PostgreSQL']
const CATEGORIES = ['State Management', 'API Integration', 'Authentication', 'Database Design', 'Performance', 'Testing', 'DevOps']
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
    technologies: [] as string[],
    categories: [] as string[],
    type: 'coding',
    companies: [] as string[],
    estimatedTime: '',
    xpReward: 100,
    hints: [''],

    // For project type
    projectProblem: {
      setupInstructions: '',
      tasks: [{ title: '', description: '', type: 'feature', hints: [''] }],
      files: [{ path: '', content: '', language: 'javascript' }],
      runtimeEnvironment: {
        baseImage: 'node:18',
        entrypoint: 'npm',
        args: 'run, dev',
        installCommand: 'npm install',
        testCommand: 'npm test',
        port: 3000
      }
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
      // Parse the comma-separated args string into an array before sending
      const payload = JSON.parse(JSON.stringify(formData));
      if (payload.projectProblem?.runtimeEnvironment?.args) {
        const rawArgs = payload.projectProblem.runtimeEnvironment.args as string;
        payload.projectProblem.runtimeEnvironment.args = rawArgs.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await apiService.development.create(payload)
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
              <Label>Technologies *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TECHNOLOGIES.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      technologies: toggleArrayItem(prev.technologies, tech)
                    }))}
                    className={`px-3 py-1 rounded text-sm ${
                      formData.technologies.includes(tech)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Categories *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      categories: toggleArrayItem(prev.categories, category)
                    }))}
                    className={`px-3 py-1 rounded text-sm ${
                      formData.categories.includes(category)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    {category}
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

        {/* Runtime Environment (Project Type Only) */}
        {formData.type === 'project' && (
          <Card>
            <CardHeader>
              <CardTitle>Runtime Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseImage">Base Image *</Label>
                  <Select
                    value={formData.projectProblem.runtimeEnvironment.baseImage}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      projectProblem: {
                        ...prev.projectProblem,
                        runtimeEnvironment: { ...prev.projectProblem.runtimeEnvironment, baseImage: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select image" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="node:18">node:18 (React/Node)</SelectItem>
                      <SelectItem value="node:20">node:20 (Latest Node)</SelectItem>
                      <SelectItem value="python:3.10">python:3.10 (Flask/Django)</SelectItem>
                      <SelectItem value="openjdk:17">openjdk:17 (Spring Boot)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="port">Internal Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.projectProblem.runtimeEnvironment.port}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectProblem: {
                        ...prev.projectProblem,
                        runtimeEnvironment: { ...prev.projectProblem.runtimeEnvironment, port: parseInt(e.target.value) || 3000 }
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="installCommand">Install Command</Label>
                  <Input
                    id="installCommand"
                    placeholder="e.g., npm install or pip install -r requirements.txt"
                    value={formData.projectProblem.runtimeEnvironment.installCommand}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectProblem: {
                        ...prev.projectProblem,
                        runtimeEnvironment: { ...prev.projectProblem.runtimeEnvironment, installCommand: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="testCommand">Test Command</Label>
                  <Input
                    id="testCommand"
                    placeholder="e.g., npm test or pytest"
                    value={formData.projectProblem.runtimeEnvironment.testCommand}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectProblem: {
                        ...prev.projectProblem,
                        runtimeEnvironment: { ...prev.projectProblem.runtimeEnvironment, testCommand: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entrypoint">Entrypoint *</Label>
                  <Input
                    id="entrypoint"
                    placeholder="e.g., npm, python, java"
                    value={formData.projectProblem.runtimeEnvironment.entrypoint}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectProblem: {
                        ...prev.projectProblem,
                        runtimeEnvironment: { ...prev.projectProblem.runtimeEnvironment, entrypoint: e.target.value }
                      }
                    }))}
                    required={formData.type === 'project'}
                  />
                </div>
                <div>
                  <Label htmlFor="args">Arguments (comma separated) *</Label>
                  <Input
                    id="args"
                    placeholder="e.g., run, dev or app.py"
                    value={formData.projectProblem.runtimeEnvironment.args}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectProblem: {
                        ...prev.projectProblem,
                        runtimeEnvironment: { ...prev.projectProblem.runtimeEnvironment, args: e.target.value }
                      }
                    }))}
                    required={formData.type === 'project'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will be parsed as: {JSON.stringify(formData.projectProblem.runtimeEnvironment.args.split(',').map(s => s.trim()).filter(Boolean))}
                  </p>
                </div>
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

"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"

const DATA_STRUCTURES = ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'Heap', 'Hash Table', 'Trie']
const PATTERNS = ['Two Pointers', 'Sliding Window', 'Binary Search', 'DFS', 'BFS', 'Dynamic Programming', 'Backtracking', 'Greedy', 'Divide and Conquer']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function EditDSAProblem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    problemNumber: 1,
    slug: '',
    description: '',
    difficulty: 'Easy',
    dataStructures: [] as string[],
    patterns: [] as string[],
    companies: [] as string[],
    constraints: [''],
    examples: [{ input: '', output: '', explanation: '' }],
    starterCode: {
      javascript: '',
      python: '',
      java: '',
      cpp: ''
    },
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    solution: {
      code: '',
      language: 'javascript',
      timeComplexity: '',
      spaceComplexity: '',
      explanation: ''
    }
  })

  useEffect(() => {
    fetchProblem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchProblem = async () => {
    try {
      const response = await apiService.dsa.getById(id)
      if (response.success) {
        const problem = response.data.problem || response.data
        setFormData({
          title: problem.title || '',
          problemNumber: problem.problemNumber || 1,
          slug: problem.slug || '',
          description: problem.description || '',
          difficulty: problem.difficulty || 'Easy',
          dataStructures: problem.dataStructures || [],
          patterns: problem.patterns || [],
          companies: problem.companies || [],
          constraints: problem.constraints?.length > 0 ? problem.constraints : [''],
          examples: problem.examples?.length > 0 ? problem.examples : [{ input: '', output: '', explanation: '' }],
          starterCode: problem.starterCode || { javascript: '', python: '', java: '', cpp: '' },
          testCases: problem.testCases?.length > 0 ? problem.testCases : [{ input: '', expectedOutput: '', isHidden: false }],
          solution: problem.solution || { code: '', language: 'javascript', timeComplexity: '', spaceComplexity: '', explanation: '' }
        })
      }
    } catch (error) {
      console.error('Error fetching problem:', error)
      alert('Failed to load problem')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await apiService.dsa.update(id, formData)
      if (response.success) {
        alert('Problem updated successfully!')
        router.push('/admin/dsa')
      } else {
        alert('Failed to update problem: ' + response.message)
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to update problem'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit DSA Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info - Same as add page */}
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
              <Label htmlFor="problemNumber">Problem Number *</Label>
              <Input
                id="problemNumber"
                type="number"
                value={formData.problemNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, problemNumber: parseInt(e.target.value) }))}
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
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
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Data Structures *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DATA_STRUCTURES.map(ds => (
                  <button
                    key={ds}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      dataStructures: toggleArrayItem(prev.dataStructures, ds)
                    }))}
                    className={`px-3 py-1 rounded text-sm ${
                      formData.dataStructures.includes(ds)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    {ds}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Patterns *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PATTERNS.map(pattern => (
                  <button
                    key={pattern}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      patterns: toggleArrayItem(prev.patterns, pattern)
                    }))}
                    className={`px-3 py-1 rounded text-sm ${
                      formData.patterns.includes(pattern)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update Problem'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/dsa')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

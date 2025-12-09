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

const DATA_STRUCTURES = ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'Heap', 'Hash Table', 'Trie']
const PATTERNS = ['Two Pointers', 'Sliding Window', 'Binary Search', 'DFS', 'BFS', 'Dynamic Programming', 'Backtracking', 'Greedy', 'Divide and Conquer']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function AddDSAProblem() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }))
  }

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }))
  }

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }))
  }

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }))
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
      const response = await apiService.dsa.create(formData)
      if (response.success) {
        alert('Problem created successfully!')
        router.push('/admin/dsa')
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
      <h1 className="text-3xl font-bold mb-8">Add DSA Problem</h1>

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
              <Label htmlFor="problemNumber">Problem Number *</Label>
              <Input
                id="problemNumber"
                type="number"
                value={formData.problemNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, problemNumber: parseInt(e.target.value) }))}
                required
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique number for indexing and company references
              </p>
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

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.examples.map((example, index) => (
              <div key={index} className="border border-border rounded p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Example {index + 1}</Label>
                  {formData.examples.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExample(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Input</Label>
                  <Textarea
                    value={example.input}
                    onChange={(e) => {
                      const newExamples = [...formData.examples]
                      newExamples[index].input = e.target.value
                      setFormData(prev => ({ ...prev, examples: newExamples }))
                    }}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Output</Label>
                  <Textarea
                    value={example.output}
                    onChange={(e) => {
                      const newExamples = [...formData.examples]
                      newExamples[index].output = e.target.value
                      setFormData(prev => ({ ...prev, examples: newExamples }))
                    }}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Explanation</Label>
                  <Textarea
                    value={example.explanation}
                    onChange={(e) => {
                      const newExamples = [...formData.examples]
                      newExamples[index].explanation = e.target.value
                      setFormData(prev => ({ ...prev, examples: newExamples }))
                    }}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addExample}>
              <Plus className="w-4 h-4 mr-2" />
              Add Example
            </Button>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.testCases.map((testCase, index) => (
              <div key={index} className="border border-border rounded p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Test Case {index + 1}</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => {
                          const newTestCases = [...formData.testCases]
                          newTestCases[index].isHidden = e.target.checked
                          setFormData(prev => ({ ...prev, testCases: newTestCases }))
                        }}
                      />
                      Hidden
                    </label>
                    {formData.testCases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Input</Label>
                  <Textarea
                    value={testCase.input}
                    onChange={(e) => {
                      const newTestCases = [...formData.testCases]
                      newTestCases[index].input = e.target.value
                      setFormData(prev => ({ ...prev, testCases: newTestCases }))
                    }}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Expected Output</Label>
                  <Textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => {
                      const newTestCases = [...formData.testCases]
                      newTestCases[index].expectedOutput = e.target.value
                      setFormData(prev => ({ ...prev, testCases: newTestCases }))
                    }}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTestCase}>
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Problem'}
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

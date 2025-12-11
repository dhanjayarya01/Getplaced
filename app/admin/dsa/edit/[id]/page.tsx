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
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        examples: prev.examples.filter((_, i) => i !== index)
                      }))}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(prev => ({
                ...prev,
                examples: [...prev.examples, { input: '', output: '', explanation: '' }]
              }))}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Example
            </Button>
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.constraints.map((constraint, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={constraint}
                  onChange={(e) => {
                    const newConstraints = [...formData.constraints]
                    newConstraints[index] = e.target.value
                    setFormData(prev => ({ ...prev, constraints: newConstraints }))
                  }}
                  placeholder="e.g., 1 <= nums.length <= 10^4"
                />
                {formData.constraints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      constraints: prev.constraints.filter((_, i) => i !== index)
                    }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(prev => ({
                ...prev,
                constraints: [...prev.constraints, '']
              }))}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Constraint
            </Button>
          </CardContent>
        </Card>

        {/* Starter Code */}
        <Card>
          <CardHeader>
            <CardTitle>Starter Code Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="starterCodeJS">JavaScript</Label>
              <Textarea
                id="starterCodeJS"
                value={formData.starterCode.javascript}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  starterCode: { ...prev.starterCode, javascript: e.target.value }
                }))}
                rows={6}
                placeholder="function twoSum(nums, target) {&#10;  // Write your solution here&#10;  return [];&#10;}"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="starterCodePython">Python</Label>
              <Textarea
                id="starterCodePython"
                value={formData.starterCode.python}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  starterCode: { ...prev.starterCode, python: e.target.value }
                }))}
                rows={6}
                placeholder="def twoSum(nums, target):&#10;    # Write your solution here&#10;    return []"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="starterCodeJava">Java</Label>
              <Textarea
                id="starterCodeJava"
                value={formData.starterCode.java}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  starterCode: { ...prev.starterCode, java: e.target.value }
                }))}
                rows={6}
                placeholder="class Solution {&#10;    public int[] twoSum(int[] nums, int target) {&#10;        // Write your solution here&#10;        return new int[]{};&#10;    }&#10;}"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="starterCodeCpp">C++</Label>
              <Textarea
                id="starterCodeCpp"
                value={formData.starterCode.cpp}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  starterCode: { ...prev.starterCode, cpp: e.target.value }
                }))}
                rows={6}
                placeholder="class Solution {&#10;public:&#10;    vector<int> twoSum(vector<int>& nums, int target) {&#10;        // Write your solution here&#10;        return {};&#10;    }&#10;};"
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <Card>
          <CardHeader>
            <CardTitle>Solution (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="solutionLanguage">Language</Label>
              <Select
                value={formData.solution.language}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  solution: { ...prev.solution, language: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="solutionCode">Solution Code</Label>
              <Textarea
                id="solutionCode"
                value={formData.solution.code}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  solution: { ...prev.solution, code: e.target.value }
                }))}
                rows={10}
                placeholder="// Optimal solution code"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="solutionExplanation">Explanation</Label>
              <Textarea
                id="solutionExplanation"
                value={formData.solution.explanation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  solution: { ...prev.solution, explanation: e.target.value }
                }))}
                rows={4}
                placeholder="Explain the approach and algorithm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeComplexity">Time Complexity</Label>
                <Input
                  id="timeComplexity"
                  value={formData.solution.timeComplexity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    solution: { ...prev.solution, timeComplexity: e.target.value }
                  }))}
                  placeholder="e.g., O(n)"
                />
              </div>

              <div>
                <Label htmlFor="spaceComplexity">Space Complexity</Label>
                <Input
                  id="spaceComplexity"
                  value={formData.solution.spaceComplexity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    solution: { ...prev.solution, spaceComplexity: e.target.value }
                  }))}
                  placeholder="e.g., O(n)"
                />
              </div>
            </div>
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
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          testCases: prev.testCases.filter((_, i) => i !== index)
                        }))}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(prev => ({
                ...prev,
                testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
              }))}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
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

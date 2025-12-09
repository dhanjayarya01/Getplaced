"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Search } from "lucide-react"

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Very Hard']

export default function AddCompany() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    website: '',
    description: '',
    industry: '',
    headquarters: '',
    locations: [''],
    employeeCount: '',
    difficulty: 'Medium',
    averagePackage: {
      min: 0,
      max: 0,
      currency: 'INR'
    },
    isHiring: true
  })

  // Problem linking state
  const [dsaSearch, setDsaSearch] = useState('')
  const [dsaSearchResults, setDsaSearchResults] = useState<any[]>([])
  const [selectedDSA, setSelectedDSA] = useState<any[]>([])
  
  const [devSearch, setDevSearch] = useState('')
  const [devSearchResults, setDevSearchResults] = useState<any[]>([])
  const [selectedDev, setSelectedDev] = useState<any[]>([])

  // Interview questions state
  const [interviewQuestions, setInterviewQuestions] = useState([
    { question: '', type: 'Technical', difficulty: 'Medium', round: '', answer: '' }
  ])

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, '']
    }))
  }

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...formData.locations]
    newLocations[index] = value
    setFormData(prev => ({ ...prev, locations: newLocations }))
  }

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }))
  }

  // DSA Problem Search
  const searchDSAProblems = async (query: string) => {
    setDsaSearch(query)
    if (query.length < 2) {
      setDsaSearchResults([])
      return
    }

    try {
      const response = await apiService.dsa.getAll({ limit: 20, sort: 'problemNumber' })
      if (response.success) {
        const filtered = response.data.filter((p: any) => 
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.problemNumber?.toString().includes(query)
        )
        setDsaSearchResults(filtered.slice(0, 20)) // Limit to 20 results
      }
    } catch (error) {
      console.error('Error searching DSA problems:', error)
      setDsaSearchResults([])
    }
  }

  const toggleDSAProblem = (problem: any) => {
    const exists = selectedDSA.find(p => p.problemId === problem._id)
    if (exists) {
      setSelectedDSA(selectedDSA.filter(p => p.problemId !== problem._id))
    } else {
      setSelectedDSA([...selectedDSA, {
        problemId: problem._id,
        title: problem.title,
        problemNumber: problem.problemNumber,
        frequency: 'Medium',
        round: '',
        notes: ''
      }])
    }
  }

  const updateDSAField = (index: number, field: keyof typeof selectedDSA[0], value: string) => {
    setSelectedDSA(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeDSAProblem = (index: number) => {
    setSelectedDSA(selectedDSA.filter((_, i) => i !== index))
  }

  // Dev Problem Search
  const searchDevProblems = async (query: string) => {
    setDevSearch(query)
    if (query.length < 2) {
      setDevSearchResults([])
      return
    }

    try {
      const response = await apiService.development.getAll({ limit: 20 })
      if (response.success) {
        const filtered = response.data.filter((p: any) => 
          p.title.toLowerCase().includes(query.toLowerCase())
        )
        setDevSearchResults(filtered.slice(0, 20)) // Limit to 20 results
      }
    } catch (error) {
      console.error('Error searching Dev problems:', error)
      setDevSearchResults([])
    }
  }

  const toggleDevProblem = (problem: any) => {
    const exists = selectedDev.find(p => p.problemId === problem._id)
    if (exists) {
      setSelectedDev(selectedDev.filter(p => p.problemId !== problem._id))
    } else {
      setSelectedDev([...selectedDev, {
        problemId: problem._id,
        title: problem.title,
        frequency: 'Medium',
        round: '',
        notes: ''
      }])
    }
  }

  const updateDevField = (index: number, field: keyof typeof selectedDev[0], value: string) => {
    setSelectedDev(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeDevProblem = (index: number) => {
    setSelectedDev(selectedDev.filter((_, i) => i !== index))
  }

  // Interview Questions
  const addQuestion = () => {
    setInterviewQuestions([...interviewQuestions, {
      question: '',
      type: 'Technical',
      difficulty: 'Medium',
      round: '',
      answer: ''
    }])
  }

  const updateQuestion = (index: number, field: keyof typeof interviewQuestions[0], value: string) => {
    setInterviewQuestions(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeQuestion = (index: number) => {
    setInterviewQuestions(interviewQuestions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create company
      const response = await apiService.companies.create(formData)
      
      if (response.success) {
        const companyId = response.data._id

        // Link DSA problems
        for (const dsa of selectedDSA) {
          await apiService.companies.linkDSA(companyId, {
            problemId: dsa.problemId,
            frequency: dsa.frequency,
            round: dsa.round,
            notes: dsa.notes
          })
        }

        // Link Dev problems
        for (const dev of selectedDev) {
          await apiService.companies.linkDev(companyId, {
            problemId: dev.problemId,
            frequency: dev.frequency,
            round: dev.round,
            notes: dev.notes
          })
        }

        // Add interview questions
        for (const q of interviewQuestions) {
          if (q.question.trim()) {
            await apiService.companies.addInterviewQuestion(companyId, q)
          }
        }

        alert('Company created successfully with all linked data!')
        router.push('/admin/companies')
      } else {
        alert('Failed to create company: ' + response.message)
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to create company'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Add Company</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Technology, Finance"
                />
              </div>

              <div>
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  value={formData.headquarters}
                  onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                  placeholder="e.g., Bangalore, India"
                />
              </div>
            </div>

            <div>
              <Label>Locations</Label>
              {formData.locations.map((location, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={location}
                    onChange={(e) => updateLocation(index, e.target.value)}
                    placeholder="e.g., Bangalore"
                  />
                  {formData.locations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLocation(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLocation} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Details */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="difficulty">Interview Difficulty *</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPackage">Min Package (LPA)</Label>
                <Input
                  id="minPackage"
                  type="number"
                  value={formData.averagePackage.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    averagePackage: { ...prev.averagePackage, min: parseInt(e.target.value) }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="maxPackage">Max Package (LPA)</Label>
                <Input
                  id="maxPackage"
                  type="number"
                  value={formData.averagePackage.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    averagePackage: { ...prev.averagePackage, max: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isHiring"
                checked={formData.isHiring}
                onChange={(e) => setFormData(prev => ({ ...prev, isHiring: e.target.checked }))}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <Label htmlFor="isHiring" className="cursor-pointer">
                Currently Hiring
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Linked DSA Problems */}
        <Card>
          <CardHeader>
            <CardTitle>Linked DSA Problems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search DSA Problems</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search by title or problem number..."
                  value={dsaSearch}
                  onChange={(e) => searchDSAProblems(e.target.value)}
                />
              </div>
            </div>

            {dsaSearchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                {dsaSearchResults.map(problem => (
                  <div
                    key={problem._id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                    onClick={() => toggleDSAProblem(problem)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDSA.some(p => p.problemId === problem._id)}
                      onChange={() => toggleDSAProblem(problem)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-xs font-mono bg-primary/10 px-2 py-0.5 rounded">
                      #{problem.problemNumber}
                    </span>
                    <span className="flex-1">{problem.title}</span>
                    <span className="text-xs text-muted-foreground">{problem.difficulty}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>Selected Problems ({selectedDSA.length})</Label>
              {selectedDSA.map((item, index) => (
                <div key={item.problemId || index} className="border rounded p-3 mt-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">#{item.problemNumber}</span>
                      <span className="font-medium ml-2">{item.title}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDSAProblem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <select
                        value={item.frequency}
                        onChange={(e) => updateDSAField(index, 'frequency', e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Very High">Very High</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Round</Label>
                      <Input
                        className="h-8"
                        value={item.round}
                        onChange={(e) => updateDSAField(index, 'round', e.target.value)}
                        placeholder="Technical Round 1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Linked Dev Problems */}
        <Card>
          <CardHeader>
            <CardTitle>Linked Development Problems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search Development Problems</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search by title..."
                  value={devSearch}
                  onChange={(e) => searchDevProblems(e.target.value)}
                />
              </div>
            </div>

            {devSearchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                {devSearchResults.map(problem => (
                  <div
                    key={problem._id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                    onClick={() => toggleDevProblem(problem)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDev.some(p => p.problemId === problem._id)}
                      onChange={() => toggleDevProblem(problem)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span className="flex-1">{problem.title}</span>
                    <span className="text-xs text-muted-foreground">{problem.difficulty}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>Selected Problems ({selectedDev.length})</Label>
              {selectedDev.map((item, index) => (
                <div key={item.problemId || index} className="border rounded p-3 mt-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{item.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDevProblem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <select
                        value={item.frequency}
                        onChange={(e) => updateDevField(index, 'frequency', e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Very High">Very High</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Round</Label>
                      <Input
                        className="h-8"
                        value={item.round}
                        onChange={(e) => updateDevField(index, 'round', e.target.value)}
                        placeholder="Technical Round 2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interview Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions (PYQs)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviewQuestions.map((q, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between mb-2">
                  <Label>Question {index + 1}</Label>
                  {interviewQuestions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <Textarea
                  placeholder="Enter the interview question..."
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  rows={3}
                  className="mb-2"
                />

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                      className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="HR">HR</option>
                      <option value="System Design">System Design</option>
                      <option value="Aptitude">Aptitude</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Difficulty</Label>
                    <select
                      value={q.difficulty}
                      onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                      className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Round</Label>
                    <Input
                      className="h-8"
                      value={q.round}
                      onChange={(e) => updateQuestion(index, 'round', e.target.value)}
                      placeholder="Round 1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Sample Answer (Optional)</Label>
                  <Textarea
                    placeholder="Sample answer or tips for answering..."
                    value={q.answer}
                    onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Company'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/companies')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { X, Plus, Search, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Very Hard']
const ROUND_TYPES = [
  'aptitude', 'coding', 'technical-interview', 'behavioral-interview',
  'hr-interview', 'system-design', 'assignment', 'group-discussion',
]

export default function EditCompany() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
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
    founded: null as number | null,
    roles: [] as string[],
    difficulty: 'Medium',
    averagePackage: { min: 0, max: 0, currency: 'INR' },
    interviewTips: [''],
    isHiring: true,
    isActive: true
  })

  const [hiringPipeline, setHiringPipeline] = useState<any[]>([])
  const [dsaSearch, setDsaSearch] = useState('')
  const [dsaSearchResults, setDsaSearchResults] = useState<any[]>([])
  const [selectedDSA, setSelectedDSA] = useState<any[]>([])
  const [originalDSA, setOriginalDSA] = useState<any[]>([]) // Track original links with linkIds
  const [devSearch, setDevSearch] = useState('')
  const [devSearchResults, setDevSearchResults] = useState<any[]>([])
  const [selectedDev, setSelectedDev] = useState<any[]>([])
  const [originalDev, setOriginalDev] = useState<any[]>([]) // Track original links with linkIds
  const [interviewQuestions, setInterviewQuestions] = useState<Array<{
    questionId?: string
    question: string
    type: string
    difficulty: string
    round: string
  }>>([
    { question: '', type: 'Technical', difficulty: 'Medium', round: '' }
  ])
  const [originalQuestions, setOriginalQuestions] = useState<any[]>([]) // Track original questions with IDs
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchCompanyData()
  }, [companyId])

  const fetchCompanyData = async () => {
    try {
      setLoading(true)
      const response = await apiService.companies.getById(companyId)
      
      if (response.success) {
        const company = response.data
        
        // Populate form data
        setFormData({
          name: company.name || '',
          slug: company.slug || '',
          logo: company.logo || '',
          website: company.website || '',
          description: company.description || '',
          industry: company.industry || '',
          headquarters: company.headquarters || '',
          locations: company.locations?.length ? company.locations : [''],
          employeeCount: company.employeeCount || '',
          founded: company.founded || null,
          roles: company.roles || [],
          difficulty: company.difficulty || 'Medium',
          averagePackage: company.averagePackage || { min: 0, max: 0, currency: 'INR' },
          interviewTips: company.interviewTips?.length ? company.interviewTips : [''],
          isHiring: company.isHiring !== undefined ? company.isHiring : true,
          isActive: company.isActive !== undefined ? company.isActive : true
        })

        setHiringPipeline(company.hiringPipeline || [])
        
        // Populate linked problems and track original links with linkIds
        if (company.linkedDSAProblems?.length) {
          const dsaProblems = company.linkedDSAProblems.map((p: any) => ({
            linkId: p._id, // Store the link ID for unlinking
            problemId: p.problem?._id || p.problem,
            title: p.problem?.title || 'Unknown',
            problemNumber: p.problem?.problemNumber,
            frequency: p.frequency || 'Medium',
            round: p.role || '',
            notes: p.notes || ''
          }))
          setSelectedDSA(dsaProblems)
          setOriginalDSA(dsaProblems) // Store original for comparison
        }

        if (company.linkedDevProblems?.length) {
          const devProblems = company.linkedDevProblems.map((p: any) => ({
            linkId: p._id, // Store the link ID for unlinking
            problemId: p.problem?._id || p.problem,
            title: p.problem?.title || 'Unknown',
            frequency: p.frequency || 'Medium',
            round: p.role || '',
            notes: p.notes || ''
          }))
          setSelectedDev(devProblems)
          setOriginalDev(devProblems) // Store original for comparison
        }

        if (company.interviewQuestions?.length) {
          const questions = company.interviewQuestions.map((q: any) => ({
            questionId: q._id, // Store the question ID for removal
            question: q.question || '',
            type: q.type || 'Technical',
            difficulty: q.difficulty || 'Medium',
            round: q.role || ''
          }))
          setInterviewQuestions(questions)
          setOriginalQuestions(questions) // Store original for comparison
        }
      }
    } catch (error) {
      console.error('Error fetching company:', error)
      alert('Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }))
  }

  const addLocation = () => {
    setFormData(prev => ({ ...prev, locations: [...prev.locations, ''] }))
  }

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...formData.locations]
    newLocations[index] = value
    setFormData(prev => ({ ...prev, locations: newLocations }))
  }

  const removeLocation = (index: number) => {
    setFormData(prev => ({ ...prev, locations: prev.locations.filter((_, i) => i !== index) }))
  }

  const addRole = () => {
    if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
      setFormData(prev => ({ ...prev, roles: [...prev.roles, newRole.trim()] }))
      setNewRole('')
    }
  }

  const removeRole = (index: number) => {
    setFormData(prev => ({ ...prev, roles: prev.roles.filter((_, i) => i !== index) }))
  }

  const addInterviewTip = () => {
    setFormData(prev => ({ ...prev, interviewTips: [...prev.interviewTips, ''] }))
  }

  const updateInterviewTip = (index: number, value: string) => {
    const newTips = [...formData.interviewTips]
    newTips[index] = value
    setFormData(prev => ({ ...prev, interviewTips: newTips }))
  }

  const removeInterviewTip = (index: number) => {
    setFormData(prev => ({ ...prev, interviewTips: prev.interviewTips.filter((_, i) => i !== index) }))
  }

  const addHiringRound = () => {
    setHiringPipeline([...hiringPipeline, {
      roundNumber: hiringPipeline.length + 1,
      roundName: '',
      roundType: 'coding',
      description: '',
      duration: '',
      passingCriteria: { minimumScore: 0, description: '' }
    }])
  }

  const updateHiringRound = (index: number, field: string, value: any) => {
    const newPipeline = [...hiringPipeline]
    if (field.startsWith('passingCriteria.')) {
      const criteriaField = field.split('.')[1]
      newPipeline[index].passingCriteria[criteriaField] = value
    } else {
      newPipeline[index][field] = value
    }
    setHiringPipeline(newPipeline)
  }

  const removeHiringRound = (index: number) => {
    setHiringPipeline(hiringPipeline.filter((_, i) => i !== index))
  }

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
        setDsaSearchResults(filtered.slice(0, 20))
      }
    } catch (error) {
      console.error('Error searching DSA problems:', error)
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
        notes: '',
        linkId: undefined // New problems don't have linkId yet
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
        setDevSearchResults(filtered.slice(0, 20))
      }
    } catch (error) {
      console.error('Error searching Dev problems:', error)
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
        notes: '',
        linkId: undefined // New problems don't have linkId yet
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

  const addQuestion = () => {
    setInterviewQuestions([...interviewQuestions, {
      question: '',
      type: 'Technical',
      difficulty: 'Medium',
      round: ''
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
    setSaving(true)

    try {
      const companyData = {
        ...formData,
        locations: formData.locations.filter(l => l.trim()),
        interviewTips: formData.interviewTips.filter(t => t.trim()),
        hiringPipeline: hiringPipeline
      }

      // Update company basic data
      const response = await apiService.companies.update(companyId, companyData)
      
      if (!response.success) {
        alert('Failed to update company: ' + response.message)
        setSaving(false)
        return
      }

      // Sync DSA Problems
      // Find problems to unlink (in original but not in selected)
      const dsaToUnlink = originalDSA.filter(original => 
        !selectedDSA.some(selected => selected.problemId === original.problemId)
      )
      for (const dsa of dsaToUnlink) {
        if (dsa.linkId) {
          await apiService.companies.unlinkDSA(companyId, dsa.linkId)
        }
      }

      // Find problems to link (in selected but not in original, or metadata changed)
      for (const dsa of selectedDSA) {
        const original = originalDSA.find(o => o.problemId === dsa.problemId)
        const isNew = !original
        const metadataChanged = original && (
          original.frequency !== dsa.frequency ||
          original.round !== dsa.round ||
          original.notes !== dsa.notes
        )

        if (isNew) {
          // Link new problem
          await apiService.companies.linkDSA(companyId, {
            problemId: dsa.problemId,
            frequency: dsa.frequency,
            role: dsa.round,
            notes: dsa.notes
          })
        } else if (metadataChanged && original.linkId) {
          // Unlink and relink to update metadata
          await apiService.companies.unlinkDSA(companyId, original.linkId)
          await apiService.companies.linkDSA(companyId, {
            problemId: dsa.problemId,
            frequency: dsa.frequency,
            role: dsa.round,
            notes: dsa.notes
          })
        }
      }

      // Sync Dev Problems (same logic as DSA)
      const devToUnlink = originalDev.filter(original => 
        !selectedDev.some(selected => selected.problemId === original.problemId)
      )
      for (const dev of devToUnlink) {
        if (dev.linkId) {
          await apiService.companies.unlinkDev(companyId, dev.linkId)
        }
      }

      for (const dev of selectedDev) {
        const original = originalDev.find(o => o.problemId === dev.problemId)
        const isNew = !original
        const metadataChanged = original && (
          original.frequency !== dev.frequency ||
          original.round !== dev.round ||
          original.notes !== dev.notes
        )

        if (isNew) {
          await apiService.companies.linkDev(companyId, {
            problemId: dev.problemId,
            frequency: dev.frequency,
            role: dev.round,
            notes: dev.notes
          })
        } else if (metadataChanged && original.linkId) {
          await apiService.companies.unlinkDev(companyId, original.linkId)
          await apiService.companies.linkDev(companyId, {
            problemId: dev.problemId,
            frequency: dev.frequency,
            role: dev.round,
            notes: dev.notes
          })
        }
      }

      // Sync Interview Questions
      // Remove questions that are no longer in the list
      const questionsToRemove = originalQuestions.filter(original => 
        !interviewQuestions.some(current => 
          current.questionId === original.questionId && 
          current.question === original.question
        )
      )
      for (const q of questionsToRemove) {
        if (q.questionId) {
          try {
            await apiService.companies.removeInterviewQuestion(companyId, q.questionId)
          } catch (error) {
            console.error('Error removing question:', error)
          }
        }
      }

      // Add new questions or re-add changed questions
      for (const q of interviewQuestions) {
        if (!q.question.trim()) continue
        
        const original = originalQuestions.find(o => o.questionId === q.questionId)
        const isNew = !original
        const questionChanged = original && (
          original.question !== q.question ||
          original.type !== q.type ||
          original.difficulty !== q.difficulty ||
          original.round !== q.round
        )

        if (isNew || questionChanged) {
          // If changed, remove old one first
          if (questionChanged && original.questionId) {
            try {
              await apiService.companies.removeInterviewQuestion(companyId, original.questionId)
            } catch (error) {
              console.error('Error removing old question:', error)
            }
          }
          // Add the question
          await apiService.companies.addInterviewQuestion(companyId, {
            question: q.question,
            type: q.type,
            difficulty: q.difficulty,
            role: q.round
          })
        }
      }

      alert('Company updated successfully with all linked data!')
      router.push('/admin/companies')
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to update company'))
    } finally {
      setSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Edit Company</h1>
      <p className="text-muted-foreground mb-8">Update company information</p>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium">Basic Info</span>
          </div>
          <div className="w-16 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              2
            </div>
            <span className="font-medium">Problems & Questions</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <>
            {/* Same Step 1 content as add page - Basic Info, Roles, Hiring Details, Interview Tips, Hiring Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input id="logo" value={formData.logo} onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={formData.industry} onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input id="headquarters" value={formData.headquarters} onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input id="employeeCount" value={formData.employeeCount} onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input id="founded" type="number" value={formData.founded || ''} onChange={(e) => setFormData(prev => ({ ...prev, founded: parseInt(e.target.value) || null }))} />
                  </div>
                </div>
                <div>
                  <Label>Locations</Label>
                  {formData.locations.map((location, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input value={location} onChange={(e) => updateLocation(index, e.target.value)} />
                      {formData.locations.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeLocation(index)}>
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

            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Role</Label>
                  <div className="flex gap-2">
                    <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole() }}} />
                    <Button type="button" onClick={addRole}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
                {formData.roles.length > 0 && (
                  <div>
                    <Label>Added Roles ({formData.roles.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.roles.map((role, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm">
                          <span>{role}</span>
                          <button type="button" onClick={() => removeRole(index)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="difficulty">Interview Difficulty *</Label>
                  <select id="difficulty" value={formData.difficulty} onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" required>
                    {DIFFICULTIES.map(diff => (<option key={diff} value={diff}>{diff}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPackage">Min Package (LPA)</Label>
                    <Input id="minPackage" type="number" value={formData.averagePackage.min} onChange={(e) => setFormData(prev => ({ ...prev, averagePackage: { ...prev.averagePackage, min: parseInt(e.target.value) }}))} />
                  </div>
                  <div>
                    <Label htmlFor="maxPackage">Max Package (LPA)</Label>
                    <Input id="maxPackage" type="number" value={formData.averagePackage.max} onChange={(e) => setFormData(prev => ({ ...prev, averagePackage: { ...prev.averagePackage, max: parseInt(e.target.value) }}))} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isHiring" checked={formData.isHiring} onChange={(e) => setFormData(prev => ({ ...prev, isHiring: e.target.checked }))} className="h-4 w-4 rounded" />
                    <Label htmlFor="isHiring" className="cursor-pointer">Currently Hiring</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 rounded" />
                    <Label htmlFor="isActive" className="cursor-pointer">Active (Visible to users)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={nextStep}>
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
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
                          className="h-4 w-4 rounded"
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
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDSAProblem(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Frequency</Label>
                          <select value={item.frequency} onChange={(e) => updateDSAField(index, 'frequency', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                            <option value="Very High">Very High</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Role</Label>
                          <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={item.round || ''} onChange={(e) => updateDSAField(index, 'round', e.target.value)}>
                            <option value="">Select Role</option>
                            {formData.roles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
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
                          className="h-4 w-4 rounded"
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
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDevProblem(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Frequency</Label>
                          <select value={item.frequency} onChange={(e) => updateDevField(index, 'frequency', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                            <option value="Very High">Very High</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Role</Label>
                          <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={item.round || ''} onChange={(e) => updateDevField(index, 'round', e.target.value)}>
                            <option value="">Select Role</option>
                            {formData.roles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
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
                  <div key={index} className="border rounded p-3 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-xs">Question {index + 1}</Label>
                      {interviewQuestions.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="Enter the interview question..."
                      rows={2}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select value={q.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                          <option value="Technical">Technical</option>
                          <option value="Behavioral">Behavioral</option>
                          <option value="HR">HR</option>
                          <option value="System Design">System Design</option>
                          <option value="Aptitude">Aptitude</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Difficulty</Label>
                        <select value={q.difficulty} onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Role</Label>
                        <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={q.round || ''} onChange={(e) => updateQuestion(index, 'round', e.target.value)}>
                          <option value="">Select Role</option>
                          {formData.roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Updating...' : 'Update Company'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/companies')}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

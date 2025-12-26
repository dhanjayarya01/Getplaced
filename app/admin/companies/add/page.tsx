"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { X, Plus, ChevronLeft, ChevronRight, Trash2, Save } from "lucide-react"

// Types
interface Round {
  roundNumber: number
  roundName: string
  roundType: string
  description: string
  duration: string
  passingCriteria: { minimumScore: number, description: string }
}

interface Question {
  question: string
  type: string
  difficulty: string
  roundNumber: number | null
  answer: string
  tips: string[]
}

interface LinkedProblem {
  problem: string
  title: string
  frequency: string
  roundNumber: number | null
  notes: string
}

interface Role {
  roleName: string
  description: string
  hiringPipeline: Round[]
  linkedDSAProblems: LinkedProblem[]
  linkedDevProblems: LinkedProblem[]
  interviewQuestions: Question[]
}

interface Pattern {
  name: string
  category: string
  description: string
  frequency: string
  examples: string[]
  tips: string[]
}

// Constants
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Very Hard']
const FREQUENCY_OPTIONS = ['Very High', 'High', 'Medium', 'Low']
const ROUND_TYPES = [
  'aptitude', 'coding', 'technical-interview', 'behavioral-interview',
  'hr-interview', 'system-design', 'assignment', 'group-discussion',
  'online-assessment', 'machine-coding',
]
const QUESTION_TYPES = ['Technical', 'Behavioral', 'HR', 'System Design', 'Aptitude']
const PATTERN_CATEGORIES = ['DSA', 'System Design', 'Behavioral', 'Other']
const EDUCATION_LEVELS = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'Any Graduate', 'Any Post Graduate']
const WORK_MODES = ['Remote', 'Hybrid', 'On-site']

export default function AddCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Basic, 2: Roles, 3: Patterns

  // ==================== STATE ====================

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    website: '',
    description: '',
    industry: '',
    headquarters: '',
    locations: [''],
    employeeCount: '', // ADDED
    founded: '',       // ADDED
    difficulty: 'Medium',
    averagePackage: { min: 0, max: 0, currency: 'INR' },
    requirements: [''], // ADDED
    techStack: [''],    // ADDED
    benefits: [''],
    interviewTips: [''], // ADDED
    
    // Eligibility
    eligibilityCriteria: {
      minCGPA: '',
      minPercentage: '',
      educationLevel: 'Any Graduate',
      allowedBranches: [''],
      maxBacklogs: '',
      yearOfPassing: [''],
      ageLimit: '',
    },

    // Hiring Details
    hiringFreshers: false, // ADDED
    experienceRequired: { min: 0, max: 5 }, // ADDED
    workModes: [], // ADDED
    remoteMinExperience: 0, // ADDED

    isHiring: true,
    isActive: true,
    isPremium: false
  })

  // Roles Data
  const [rolesData, setRolesData] = useState<Role[]>([])
  const [activeRoleIndex, setActiveRoleIndex] = useState(0)

  // Patterns Data
  const [patterns, setPatterns] = useState<Pattern[]>([])

  // Problem Linking State
  const [dsaSearch, setDsaSearch] = useState('')
  const [devSearch, setDevSearch] = useState('')
  const [dsaSearchResults, setDsaSearchResults] = useState<any[]>([])
  const [devSearchResults, setDevSearchResults] = useState<any[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)

  // ==================== HELPERS ====================

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  // ==================== BASIC INFO HANDLERS ====================

  const handleBasicChange = (field: string, value: any) => {
    setFormData(prev => {
      const updates: any = { [field]: value }
      if (field === 'name') updates.slug = generateSlug(value)
      return { ...prev, ...updates }
    })
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    // @ts-ignore
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const handleArrayChange = (field: string, index: number, value: string) => {
    // @ts-ignore
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: string) => {
    // @ts-ignore
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeArrayItem = (field: string, index: number) => {
    // @ts-ignore
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  // Nested Array Helpers (for allowedBranches, yearOfPassing)
  const handleNestedArrayChange = (parent: string, field: string, index: number, value: any) => {
    // @ts-ignore
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [parent]: {
        // @ts-ignore
        ...prev[parent],
        // @ts-ignore
        [field]: prev[parent][field].map((item: any, i: number) => i === index ? value : item)
      }
    }))
  }

  const addNestedArrayItem = (parent: string, field: string) => {
    // @ts-ignore
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [parent]: {
        // @ts-ignore
        ...prev[parent],
        // @ts-ignore
        [field]: [...prev[parent][field], '']
      }
    }))
  }

  const removeNestedArrayItem = (parent: string, field: string, index: number) => {
    // @ts-ignore
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [parent]: {
        // @ts-ignore
        ...prev[parent],
        // @ts-ignore
        [field]: prev[parent][field].filter((_, i) => i !== index)
      }
    }))
  }


  const toggleWorkMode = (mode: string) => {
    setFormData(prev => {
      // @ts-ignore
      const modes = prev.workModes.includes(mode)
        // @ts-ignore
        ? prev.workModes.filter(m => m !== mode)
        // @ts-ignore
        : [...prev.workModes, mode]
      return { ...prev, workModes: modes }
    })
  }

  // ==================== ROLES HANDLERS ====================

  const addRole = () => {
    setRolesData([
      ...rolesData,
      {
        roleName: 'New Role',
        description: '',
        hiringPipeline: [],
        linkedDSAProblems: [],
        linkedDevProblems: [],
        interviewQuestions: []
      }
    ])
    setActiveRoleIndex(rolesData.length)
  }

  const removeRole = (index: number) => {
    const newRoles = rolesData.filter((_, i) => i !== index)
    setRolesData(newRoles)
    if (activeRoleIndex >= newRoles.length) {
      setActiveRoleIndex(Math.max(0, newRoles.length - 1))
    }
  }

  const updateRole = (index: number, field: string, value: any) => {
    setRolesData(prev => prev.map((role, i) => i === index ? { ...role, [field]: value } : role))
  }

  // Round Handlers
  const addRound = (roleIndex: number) => {
    const updatedRoles = [...rolesData]
    updatedRoles[roleIndex].hiringPipeline.push({
      roundNumber: updatedRoles[roleIndex].hiringPipeline.length + 1,
      roundName: '',
      roundType: 'coding',
      description: '',
      duration: '',
      passingCriteria: { minimumScore: 0, description: '' }
    })
    setRolesData(updatedRoles)
  }

  const updateRound = (roleIndex: number, roundIndex: number, field: string, value: any) => {
    const updatedRoles = [...rolesData]
    if (field.startsWith('passingCriteria.')) {
      const subField = field.split('.')[1]
      // @ts-ignore
      updatedRoles[roleIndex].hiringPipeline[roundIndex].passingCriteria[subField] = value
    } else {
      // @ts-ignore
      updatedRoles[roleIndex].hiringPipeline[roundIndex][field] = value
    }
    setRolesData(updatedRoles)
  }

  const removeRound = (roleIndex: number, roundIndex: number) => {
    const updatedRoles = [...rolesData]
    updatedRoles[roleIndex].hiringPipeline.splice(roundIndex, 1)
    updatedRoles[roleIndex].hiringPipeline.forEach((r, i) => r.roundNumber = i + 1)
    setRolesData(updatedRoles)
  }

  // Question Handlers
  const addQuestion = (roleIndex: number) => {
    const updatedRoles = [...rolesData]
    updatedRoles[roleIndex].interviewQuestions.push({
      question: '',
      type: 'Technical',
      difficulty: 'Medium',
      roundNumber: null,
      answer: '',
      tips: []
    })
    setRolesData(updatedRoles)
  }

  const updateQuestion = (roleIndex: number, qIndex: number, field: string, value: any) => {
    const updatedRoles = [...rolesData]
    // @ts-ignore
    updatedRoles[roleIndex].interviewQuestions[qIndex][field] = value
    setRolesData(updatedRoles)
  }

  const removeQuestion = (roleIndex: number, qIndex: number) => {
    const updatedRoles = [...rolesData]
    updatedRoles[roleIndex].interviewQuestions.splice(qIndex, 1)
    setRolesData(updatedRoles)
  }

  // ==================== PROBLEM LINKING HANDLERS ====================

  const searchDSA = async () => {
    if (!dsaSearch.trim()) return
    setLoadingSearch(true)
    try {
      const res = await apiService.dsa.getAll({ search: dsaSearch, limit: 5 })
      setDsaSearchResults(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSearch(false)
    }
  }

  const searchDev = async () => {
    if (!devSearch.trim()) return
    setLoadingSearch(true)
    try {
      const res = await apiService.development.getAll({ search: devSearch, limit: 5 })
      setDevSearchResults(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSearch(false)
    }
  }

  const addProblemToRole = (roleIndex: number, type: 'linkedDSAProblems'|'linkedDevProblems', problem: any) => {
    const updatedRoles = [...rolesData]
    if (updatedRoles[roleIndex][type].some((p: any) => p.problem === problem._id)) {
      alert('Problem already linked to this role')
      return
    }

    // Auto-select round if only one exists
    const roleRounds = updatedRoles[roleIndex].hiringPipeline
    const defaultRound = roleRounds.length > 0 ? roleRounds[0].roundNumber : null

    updatedRoles[roleIndex][type].push({
      problem: problem._id,
      title: problem.title,
      frequency: 'Medium',
      roundNumber: defaultRound,
      notes: ''
    })
    setRolesData(updatedRoles)
    
    if (type === 'linkedDSAProblems') {
      setDsaSearch('')
      setDsaSearchResults([])
    } else {
      setDevSearch('')
      setDevSearchResults([])
    }
  }

  const removeProblemFromRole = (roleIndex: number, type: 'linkedDSAProblems'|'linkedDevProblems', linkIndex: number) => {
    const updatedRoles = [...rolesData]
    updatedRoles[roleIndex][type].splice(linkIndex, 1)
    setRolesData(updatedRoles)
  }

  const updateProblemInRole = (roleIndex: number, type: 'linkedDSAProblems'|'linkedDevProblems', linkIndex: number, field: string, value: any) => {
    const updatedRoles = [...rolesData]
    // @ts-ignore
    updatedRoles[roleIndex][type][linkIndex][field] = value
    setRolesData(updatedRoles)
  }

  // ==================== PATTERNS HANDLERS ====================

  const addPattern = () => {
    setPatterns([...patterns, {
      name: '',
      category: 'DSA',
      description: '',
      frequency: 'Medium',
      examples: [],
      tips: []
    }])
  }

  const removePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index))
  }

  const updatePattern = (index: number, field: string, value: any) => {
    setPatterns(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const updatePatternArray = (idx: number, field: 'examples'|'tips', itemIdx: number, val: string) => {
    setPatterns(prev => prev.map((p, i) => {
      if (i !== idx) return p
      const arr = [...p[field]]
      arr[itemIdx] = val
      return { ...p, [field]: arr }
    }))
  }

  const addPatternArrayItem = (idx: number, field: 'examples'|'tips') => {
    setPatterns(prev => prev.map((p, i) => {
      if (i !== idx) return p
      return { ...p, [field]: [...p[field], ''] }
    }))
  }

  const removePatternArrayItem = (idx: number, field: 'examples'|'tips', itemIdx: number) => {
    setPatterns(prev => prev.map((p, i) => {
      if (i !== idx) return p
      const arr =  p[field].filter((_, ii) => ii !== itemIdx)
      return { ...p, [field]: arr }
    }))
  }

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Clean arrays
      const cleanLocations = formData.locations.filter(l => l.trim())
      const cleanRequirements = formData.requirements.filter(r => r.trim())
      const cleanTechStack = formData.techStack.filter(r => r.trim())
      const cleanBenefits = formData.benefits.filter(b => b.trim())
      const cleanTips = formData.interviewTips.filter(t => t.trim())
      const cleanBranches = formData.eligibilityCriteria.allowedBranches.filter(b => b.trim())
      // @ts-ignore
      const cleanPassingYears = formData.eligibilityCriteria.yearOfPassing.filter(y => y && !isNaN(Number(y))).map(Number)

      const payload = {
        ...formData,
        founded: Number(formData.founded) || undefined,
        locations: cleanLocations,
        requirements: cleanRequirements,
        techStack: cleanTechStack,
        benefits: cleanBenefits,
        interviewTips: cleanTips,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          minCGPA: Number(formData.eligibilityCriteria.minCGPA) || undefined,
          minPercentage: Number(formData.eligibilityCriteria.minPercentage) || undefined,
          maxBacklogs: Number(formData.eligibilityCriteria.maxBacklogs) || undefined,
          ageLimit: Number(formData.eligibilityCriteria.ageLimit) || undefined,
          allowedBranches: cleanBranches,
          yearOfPassing: cleanPassingYears,
        },
        rolesData,
        patterns
      }

      await apiService.companies.create(payload)
      router.push('/admin/companies')
    } catch (error: any) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold">Add New Company</h1>
           <p className="text-muted-foreground">Complete comprehensive company profile</p>
        </div>
        <div className="flex gap-2">
           <Button variant={formData.isActive ? "default" : "outline"} onClick={() => handleBasicChange('isActive', !formData.isActive)}>
             {formData.isActive ? 'Active' : 'Inactive'}
           </Button>
           <Button variant={formData.isHiring ? "default" : "outline"} onClick={() => handleBasicChange('isHiring', !formData.isHiring)}>
             {formData.isHiring ? 'Hiring' : 'Not Hiring'}
           </Button>
        </div>
      </div>

      {/* STEPS TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setStep(1)}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${step === 1 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
        >
          1. Company Details
        </button>
        <button
          onClick={() => setStep(2)}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${step === 2 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
        >
          2. Roles & Pipeline
        </button>
        <button
          onClick={() => setStep(3)}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${step === 3 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
        >
          3. Interview Patterns
        </button>
      </div>

      {/* STEP 1: BASIC INFO */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          
          {/* 1.1 Core Info */}
          <Card>
            <CardHeader><CardTitle>Core Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input value={formData.name} onChange={e => handleBasicChange('name', e.target.value)} placeholder="e.g. Google" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={formData.slug} onChange={e => handleBasicChange('slug', e.target.value)} placeholder="google" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={formData.website} onChange={e => handleBasicChange('website', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={formData.logo} onChange={e => handleBasicChange('logo', e.target.value)} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => handleBasicChange('description', e.target.value)} className="h-24" />
              </div>
              <div className="space-y-2">
                 <Label>Employee Count</Label>
                 <Input value={formData.employeeCount} onChange={e => handleBasicChange('employeeCount', e.target.value)} placeholder="e.g. 10,000+" />
              </div>
              <div className="space-y-2">
                 <Label>Founded Year</Label>
                 <Input type="number" value={formData.founded} onChange={e => handleBasicChange('founded', e.target.value)} placeholder="1998" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={formData.industry} onChange={e => handleBasicChange('industry', e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label>Headquarters</Label>
                 <Input value={formData.headquarters} onChange={e => handleBasicChange('headquarters', e.target.value)} placeholder="City, Country" />
              </div>
            </CardContent>
          </Card>

          {/* 1.2 Eligibility & Work Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Eligibility */}
             <Card>
                <CardHeader><CardTitle>Eligibility Criteria</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                         <Label className="text-xs">Min CGPA</Label>
                         <Input type="number" step="0.1" value={formData.eligibilityCriteria.minCGPA} onChange={e => handleNestedChange('eligibilityCriteria', 'minCGPA', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-xs">Min Percentage</Label>
                         <Input type="number" step="1" value={formData.eligibilityCriteria.minPercentage} onChange={e => handleNestedChange('eligibilityCriteria', 'minPercentage', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-xs">Max Backlogs</Label>
                         <Input type="number" value={formData.eligibilityCriteria.maxBacklogs} onChange={e => handleNestedChange('eligibilityCriteria', 'maxBacklogs', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-xs">Age Limit</Label>
                         <Input type="number" value={formData.eligibilityCriteria.ageLimit} onChange={e => handleNestedChange('eligibilityCriteria', 'ageLimit', e.target.value)} />
                      </div>
                   </div>
                   
                   <div className="space-y-1">
                      <Label className="text-xs">Education Level</Label>
                      <select 
                         className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                         value={formData.eligibilityCriteria.educationLevel}
                         onChange={e => handleNestedChange('eligibilityCriteria', 'educationLevel', e.target.value)}
                      >
                         {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                   </div>

                   <div className="space-y-1">
                      <Label className="text-xs">Allowed Branches</Label>
                      {formData.eligibilityCriteria.allowedBranches.map((br, i) => (
                         <div key={i} className="flex gap-2 mb-1">
                            <Input className="h-8" value={br} onChange={e => handleNestedArrayChange('eligibilityCriteria', 'allowedBranches', i, e.target.value)} />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNestedArrayItem('eligibilityCriteria', 'allowedBranches', i)}><X className="h-3 w-3"/></Button>
                         </div>
                      ))}
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addNestedArrayItem('eligibilityCriteria', 'allowedBranches')}><Plus className="h-3 w-3 mr-1"/> Add Branch</Button>
                   </div>

                   <div className="space-y-1">
                      <Label className="text-xs">Batch (Passing Years)</Label>
                      {formData.eligibilityCriteria.yearOfPassing.map((yr, i) => (
                         <div key={i} className="flex gap-2 mb-1">
                            <Input type="number" className="h-8" value={yr} onChange={e => handleNestedArrayChange('eligibilityCriteria', 'yearOfPassing', i, e.target.value)} placeholder="YYYY" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNestedArrayItem('eligibilityCriteria', 'yearOfPassing', i)}><X className="h-3 w-3"/></Button>
                         </div>
                      ))}
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addNestedArrayItem('eligibilityCriteria', 'yearOfPassing')}><Plus className="h-3 w-3 mr-1"/> Add Year</Button>
                   </div>
                </CardContent>
             </Card>

             {/* Work & Hiring */}
             <div className="space-y-6">
                <Card>
                   <CardHeader><CardTitle>Hiring & Work Mode</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2 border p-3 rounded">
                         <input type="checkbox" id="hiringFreshers" checked={formData.hiringFreshers} onChange={e => handleBasicChange('hiringFreshers', e.target.checked)} className="h-4 w-4" />
                         <Label htmlFor="hiringFreshers">Hiring Freshers?</Label>
                      </div>

                      <div className="space-y-2">
                         <Label>Experience Required (Years)</Label>
                         <div className="flex gap-2">
                            <Input type="number" placeholder="Min" value={formData.experienceRequired.min} onChange={e => handleNestedChange('experienceRequired', 'min', e.target.value)} />
                            <Input type="number" placeholder="Max" value={formData.experienceRequired.max} onChange={e => handleNestedChange('experienceRequired', 'max', e.target.value)} />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <Label>Work Modes</Label>
                         <div className="flex flex-wrap gap-2">
                            {WORK_MODES.map(mode => (
                               <Button
                                  key={mode}
                                  type="button"
                                  size="sm"
                                  variant={
                                     // @ts-ignore
                                     formData.workModes.includes(mode) ? "default" : "outline"
                                  } 
                                  onClick={() => toggleWorkMode(mode)}
                               >
                                  {mode}
                               </Button>
                            ))}
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <Label>Difficulty</Label>
                         <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.difficulty}
                            onChange={e => handleBasicChange('difficulty', e.target.value)}
                         >
                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>
                      
                      <div className="space-y-2">
                         <Label>Package (LPA)</Label>
                         <div className="flex gap-2">
                            <Input type="number" placeholder="Min" value={formData.averagePackage.min} onChange={e => handlePackageChange('min', e.target.value)} />
                            <Input type="number" placeholder="Max" value={formData.averagePackage.max} onChange={e => handlePackageChange('max', e.target.value)} />
                         </div>
                      </div>
                   </CardContent>
                </Card>
             </div>
          </div>

          {/* 1.3 Tech Stack, Requirements, Benefits, Tips */}
          <Card>
             <CardHeader><CardTitle>Requirements & Stack</CardTitle></CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Tech Stack</Label>
                  {formData.techStack.map((tech, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={tech} onChange={e => handleArrayChange('techStack', i, e.target.value)} placeholder="e.g. React" />
                      <Button variant="ghost" size="icon" onClick={() => removeArrayItem('techStack', i)}><X className="h-4 w-4"/></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('techStack')}><Plus className="h-4 w-4 mr-2"/> Add Tech</Button>
                </div>

                <div>
                  <Label className="mb-2 block">Job Requirements</Label>
                  {formData.requirements.map((req, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={req} onChange={e => handleArrayChange('requirements', i, e.target.value)} placeholder="e.g. 3+ years experience" />
                      <Button variant="ghost" size="icon" onClick={() => removeArrayItem('requirements', i)}><X className="h-4 w-4"/></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('requirements')}><Plus className="h-4 w-4 mr-2"/> Add Requirement</Button>
                </div>

                <div>
                  <Label className="mb-2 block">Benefits & Perks</Label>
                  {formData.benefits.map((b, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={b} onChange={e => handleArrayChange('benefits', i, e.target.value)} placeholder="e.g. Health Insurance" />
                      <Button variant="ghost" size="icon" onClick={() => removeArrayItem('benefits', i)}><X className="h-4 w-4"/></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('benefits')}><Plus className="h-4 w-4 mr-2"/> Add Benefit</Button>
                </div>

                <div>
                  <Label className="mb-2 block">Interview Tips</Label>
                  {formData.interviewTips.map((tip, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={tip} onChange={e => handleArrayChange('interviewTips', i, e.target.value)} placeholder="e.g. Focus on DS" />
                      <Button variant="ghost" size="icon" onClick={() => removeArrayItem('interviewTips', i)}><X className="h-4 w-4"/></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('interviewTips')}><Plus className="h-4 w-4 mr-2"/> Add Tip</Button>
                </div>
             </CardContent>
          </Card>

          {/* 1.4 Details (Locations) */}
          <Card>
            <CardHeader><CardTitle>Locations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.locations.map((loc, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={loc} onChange={e => handleArrayChange('locations', i, e.target.value)} placeholder="e.g. Bangalore" />
                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem('locations', i)}><X className="h-4 w-4"/></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addArrayItem('locations')}><Plus className="h-4 w-4 mr-2"/> Add Location</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Next: Roles <ChevronRight className="ml-2 h-4 w-4"/></Button>
          </div>
        </div>
      )}

      {/* STEP 2: ROLES */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Job Roles</h2>
             <Button onClick={addRole}><Plus className="mr-2 h-4 w-4"/> Add New Role</Button>
           </div>

           {rolesData.length === 0 ? (
             <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
               No job roles added. Click "Add New Role" to get started.
             </div>
           ) : (
             <div className="flex gap-6 items-start">
                {/* Role Sidebar */}
                <div className="w-1/4 space-y-2">
                  {rolesData.map((role, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveRoleIndex(idx)}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${activeRoleIndex === idx ? 'bg-secondary border-primary' : 'bg-card'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">{role.roleName || 'Untitled Role'}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeRole(idx) }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Role Editor */}
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Edit Role: {rolesData[activeRoleIndex]?.roleName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Role Name</Label>
                      <Input 
                        value={rolesData[activeRoleIndex].roleName} 
                        onChange={e => updateRole(activeRoleIndex, 'roleName', e.target.value)} 
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={rolesData[activeRoleIndex].description} 
                        onChange={e => updateRole(activeRoleIndex, 'description', e.target.value)} 
                      />
                    </div>

                    {/* Hiring Pipeline Block */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3 flex justify-between items-center">
                        Hiring Pipeline
                        <Button size="sm" variant="outline" onClick={() => addRound(activeRoleIndex)}><Plus className="h-3 w-3 mr-1"/> Add Round</Button>
                      </h3>
                      <div className="space-y-3">
                        {rolesData[activeRoleIndex].hiringPipeline.map((round: any, rIdx: number) => (
                           <Card key={rIdx} className="bg-muted/40">
                             <CardContent className="p-3 grid grid-cols-2 gap-3">
                                <div className="col-span-2 flex justify-between">
                                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">Round {round.roundNumber}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRound(activeRoleIndex, rIdx)}><X className="h-3 w-3"/></Button>
                                </div>
                                <div>
                                  <Label className="text-xs">Round Name</Label>
                                  <Input className="h-8" value={round.roundName} onChange={e => updateRound(activeRoleIndex, rIdx, 'roundName', e.target.value)} />
                                </div>
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <select 
                                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                    value={round.roundType}
                                    onChange={e => updateRound(activeRoleIndex, rIdx, 'roundType', e.target.value)}
                                  >
                                    {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">Description</Label>
                                  <Textarea className="h-16" value={round.description} onChange={e => updateRound(activeRoleIndex, rIdx, 'description', e.target.value)} />
                                </div>
                             </CardContent>
                           </Card>
                        ))}
                      </div>
                    </div>

                    {/* Interview Questions Block */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3 flex justify-between items-center">
                        Interview Questions
                        <Button size="sm" variant="outline" onClick={() => addQuestion(activeRoleIndex)}><Plus className="h-3 w-3 mr-1"/> Add Question</Button>
                      </h3>
                      <div className="space-y-3">
                        {rolesData[activeRoleIndex].interviewQuestions.map((q: any, qIdx: number) => (
                           <div key={qIdx} className="border p-3 rounded-md bg-card">
                              <div className="flex gap-3 mb-2">
                                <Textarea 
                                  className="flex-1" 
                                  placeholder="Question text..." 
                                  value={q.question} 
                                  onChange={e => updateQuestion(activeRoleIndex, qIdx, 'question', e.target.value)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(activeRoleIndex, qIdx)}><X className="h-4 w-4"/></Button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                 <select 
                                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                    value={q.type}
                                    onChange={e => updateQuestion(activeRoleIndex, qIdx, 'type', e.target.value)}
                                 >
                                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                                 <select 
                                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                    value={q.difficulty}
                                    onChange={e => updateQuestion(activeRoleIndex, qIdx, 'difficulty', e.target.value)}
                                 >
                                    {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                                 </select>
                                 <select 
                                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                    value={q.roundNumber || ''}
                                    onChange={e => updateQuestion(activeRoleIndex, qIdx, 'roundNumber', Number(e.target.value))}
                                 >
                                    <option value="">No Associated Round</option>
                                    {rolesData[activeRoleIndex].hiringPipeline.map((r: any) => (
                                      <option key={r.roundNumber} value={r.roundNumber}>Round {r.roundNumber}: {r.roundName}</option>
                                    ))}
                                 </select>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Linked Problems Block */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Linked Problems (DSA & Dev)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* DSA PROBLEMS */}
                        <div className="border rounded-md p-3">
                           <h4 className="font-medium mb-2 text-sm">DSA Problems</h4>
                           <div className="flex gap-2 mb-2">
                             <Input 
                               placeholder="Search DSA..." 
                               value={dsaSearch}
                               onChange={(e) => setDsaSearch(e.target.value)}
                               className="h-8 text-sm"
                             />
                             <Button size="sm" onClick={searchDSA} disabled={loadingSearch} variant="secondary">
                               {loadingSearch ? '...' : 'Search'}
                             </Button>
                           </div>
                           
                           {/* Search Results */}
                           {dsaSearchResults.length > 0 && (
                             <div className="mb-3 max-h-40 overflow-y-auto border rounded bg-background p-2">
                               <p className="text-xs text-muted-foreground mb-1">Search Results:</p>
                               {dsaSearchResults.map((prob) => (
                                 <div key={prob._id} className="flex justify-between items-center text-sm p-1 hover:bg-muted cursor-pointer group">
                                    <span className="truncate flex-1">{prob.title}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addProblemToRole(activeRoleIndex, 'linkedDSAProblems', prob)}>
                                      <Plus className="h-3 w-3"/>
                                    </Button>
                                 </div>
                               ))}
                             </div>
                           )}

                           {/* Linked List */}
                           <div className="space-y-2 mt-2">
                             {rolesData[activeRoleIndex].linkedDSAProblems.map((link, lIdx) => (
                               <div key={lIdx} className="bg-muted/30 p-2 rounded text-sm border">
                                  <div className="flex justify-between font-medium">
                                    <span>{link.title || 'Unknown Problem'}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeProblemFromRole(activeRoleIndex, 'linkedDSAProblems', lIdx)}>
                                      <X className="h-3 w-3"/>
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                     <select 
                                        className="h-7 w-full rounded border bg-background px-1 text-xs"
                                        value={link.roundNumber || ''}
                                        onChange={(e) => updateProblemInRole(activeRoleIndex, 'linkedDSAProblems', lIdx, 'roundNumber', Number(e.target.value))}
                                     >
                                        <option value="">Select Round</option>
                                        {rolesData[activeRoleIndex].hiringPipeline.map((r: any) => (
                                          <option key={r.roundNumber} value={r.roundNumber}>Round {r.roundNumber}</option>
                                        ))}
                                     </select>
                                     <select 
                                        className="h-7 w-full rounded border bg-background px-1 text-xs"
                                        value={link.frequency}
                                        onChange={(e) => updateProblemInRole(activeRoleIndex, 'linkedDSAProblems', lIdx, 'frequency', e.target.value)}
                                     >
                                        {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                     </select>
                                  </div>
                               </div>
                             ))}
                             {rolesData[activeRoleIndex].linkedDSAProblems.length === 0 && (
                               <p className="text-xs text-muted-foreground text-center py-2">No problems linked</p>
                             )}
                           </div>
                        </div>

                        {/* DEV PROBLEMS */}
                        <div className="border rounded-md p-3">
                           <h4 className="font-medium mb-2 text-sm">Development Problems</h4>
                           <div className="flex gap-2 mb-2">
                             <Input 
                               placeholder="Search Dev..." 
                               value={devSearch}
                               onChange={(e) => setDevSearch(e.target.value)}
                               className="h-8 text-sm"
                             />
                             <Button size="sm" onClick={searchDev} disabled={loadingSearch} variant="secondary">
                               {loadingSearch ? '...' : 'Search'}
                             </Button>
                           </div>

                           {/* Search Results */}
                           {devSearchResults.length > 0 && (
                             <div className="mb-3 max-h-40 overflow-y-auto border rounded bg-background p-2">
                               <p className="text-xs text-muted-foreground mb-1">Search Results:</p>
                               {devSearchResults.map((prob) => (
                                 <div key={prob._id} className="flex justify-between items-center text-sm p-1 hover:bg-muted cursor-pointer group">
                                    <span className="truncate flex-1">{prob.title}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addProblemToRole(activeRoleIndex, 'linkedDevProblems', prob)}>
                                      <Plus className="h-3 w-3"/>
                                    </Button>
                                 </div>
                               ))}
                             </div>
                           )}

                           {/* Linked List */}
                           <div className="space-y-2 mt-2">
                             {rolesData[activeRoleIndex].linkedDevProblems.map((link, lIdx) => (
                               <div key={lIdx} className="bg-muted/30 p-2 rounded text-sm border">
                                  <div className="flex justify-between font-medium">
                                    <span>{link.title || 'Unknown Problem'}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeProblemFromRole(activeRoleIndex, 'linkedDevProblems', lIdx)}>
                                      <X className="h-3 w-3"/>
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                     <select 
                                        className="h-7 w-full rounded border bg-background px-1 text-xs"
                                        value={link.roundNumber || ''}
                                        onChange={(e) => updateProblemInRole(activeRoleIndex, 'linkedDevProblems', lIdx, 'roundNumber', Number(e.target.value))}
                                     >
                                        <option value="">Select Round</option>
                                        {rolesData[activeRoleIndex].hiringPipeline.map((r: any) => (
                                          <option key={r.roundNumber} value={r.roundNumber}>Round {r.roundNumber}</option>
                                        ))}
                                     </select>
                                     <select 
                                        className="h-7 w-full rounded border bg-background px-1 text-xs"
                                        value={link.frequency}
                                        onChange={(e) => updateProblemInRole(activeRoleIndex, 'linkedDevProblems', lIdx, 'frequency', e.target.value)}
                                     >
                                        {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                     </select>
                                  </div>
                               </div>
                             ))}
                             {rolesData[activeRoleIndex].linkedDevProblems.length === 0 && (
                               <p className="text-xs text-muted-foreground text-center py-2">No problems linked</p>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
             </div>
           )}

           <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 h-4 w-4"/> Basic Info</Button>
              <Button onClick={() => setStep(3)}>Next: Patterns <ChevronRight className="ml-2 h-4 w-4"/></Button>
           </div>
        </div>
      )}

      {/* STEP 3: PATTERNS */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Common Interview Patterns</h2>
             <Button onClick={addPattern}><Plus className="mr-2 h-4 w-4"/> Add Pattern</Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {patterns.map((pattern, idx) => (
               <Card key={idx}>
                 <CardHeader className="py-3 bg-muted/20 flex flex-row justify-between items-center space-y-0">
                    <span className="font-semibold">Pattern #{idx+1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removePattern(idx)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                 </CardHeader>
                 <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input value={pattern.name} onChange={e => updatePattern(idx, 'name', e.target.value)} placeholder="e.g. Slidng Window" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-xs">Category</Label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={pattern.category}
                            onChange={e => updatePattern(idx, 'category', e.target.value)}
                          >
                             {PATTERN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Description</Label>
                       <Textarea className="h-20" value={pattern.description} onChange={e => updatePattern(idx, 'description', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Examples</Label>
                       {pattern.examples.map((ex: string, i: number) => (
                         <div key={i} className="flex gap-1 mb-1">
                           <Input className="h-7 text-xs" value={ex} onChange={e => updatePatternArray(idx, 'examples', i, e.target.value)} />
                           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePatternArrayItem(idx, 'examples', i)}><X className="h-3 w-3"/></Button>
                         </div>
                       ))}
                       <Button size="sm" variant="outline" className="h-6 text-xs w-full" onClick={() => addPatternArrayItem(idx, 'examples')}><Plus className="h-3 w-3 mr-1"/> Add Example</Button>
                    </div>
                 </CardContent>
               </Card>
             ))}
           </div>

           <div className="flex justify-between pt-4 border-t sticky bottom-0 bg-background p-4 border-t shadow-up">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-2 h-4 w-4"/> Roles</Button>
              <Button size="lg" onClick={handleSubmit} disabled={loading} className="min-w-[200px]">
                 {loading ? 'Creating...' : (
                   <>
                     <Save className="mr-2 h-4 w-4" /> Create Company
                   </>
                 )}
              </Button>
           </div>
        </div>
      )}

    </div>
  )
}

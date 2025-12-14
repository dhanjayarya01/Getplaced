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
import { X, Plus, FileJson } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
      cpp: '',
      c: ''
    },
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    solution: {
      code: '',
      language: 'javascript',
      timeComplexity: '',
      spaceComplexity: '',
      explanation: ''
    },
    // Execution Metadata
    functionName: '',
    parameters: [] as Array<{ name: string; cType: string; sizeParam?: string }>,
    returnType: {
      cType: 'int',
      sizeParam: ''
    },
    // Java Metadata
    javaMetadata: {
      functionName: '',
      parameters: [] as Array<{ name: string; type: string }>,
      returnType: { type: 'int' }
    },
    // Python Metadata
    pythonMetadata: {
        functionName: '',
        parameters: [] as Array<{ name: string; type: string }>,
        returnType: { type: 'int' }
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

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      
      // Basic validation or mapping could be done here if needed
      // Currently assuming the JSON structure matches the formData structure or needs minimal mapping
      
      const newFormData = { ...formData, ...parsed }
      
      // Ensure arrays are preserved even if missing in JSON
      newFormData.dataStructures = parsed.dataStructures || []
      newFormData.patterns = parsed.patterns || []
      newFormData.companies = parsed.companies || []
      newFormData.constraints = parsed.constraints || ['']
      newFormData.examples = parsed.examples || [{ input: '', output: '', explanation: '' }]
      newFormData.testCases = parsed.testCases || [{ input: '', expectedOutput: '', isHidden: false }]
      newFormData.parameters = parsed.parameters || []
      
      // Deep merge metadata objects if partial
      if(parsed.starterCode) newFormData.starterCode = { ...formData.starterCode, ...parsed.starterCode }
      if(parsed.solution) newFormData.solution = { ...formData.solution, ...parsed.solution }
      if(parsed.returnType) newFormData.returnType = { ...formData.returnType, ...parsed.returnType }
      if(parsed.javaMetadata) newFormData.javaMetadata = { ...formData.javaMetadata, ...parsed.javaMetadata }
      if(parsed.pythonMetadata) newFormData.pythonMetadata = { ...formData.pythonMetadata, ...parsed.pythonMetadata }
      
      setFormData(newFormData)
      setIsImportOpen(false)
      setJsonInput('')
      alert('Imported successfully!')
    } catch (e) {
      alert('Invalid JSON')
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add DSA Problem</h1>
        <Button onClick={() => setIsImportOpen(true)} variant="outline">
          <FileJson className="w-4 h-4 mr-2" />
          Import JSON
        </Button>
      </div>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Problem JSON</DialogTitle>
            <DialogDescription>
              Paste the full JSON object for the problem here. This will overwrite current form data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea 
              className="font-mono text-xs h-[400px]" 
              placeholder='{ "title": "...", "description": "..." }'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={handleJsonImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        constraints: prev.constraints.filter((_, i) => i !== index)
                      }))
                    }}
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

        {/* Execution Metadata - C/C++ */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Metadata (C/C++)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="bg-muted p-3 rounded-md mb-4 text-sm text-muted-foreground">
                <p>This metadata is used to auto-generate the driver code for C and C++.</p>
            </div>
            <div>
              <Label htmlFor="functionName">Function Name</Label>
              <Input
                id="functionName"
                value={formData.functionName}
                onChange={(e) => setFormData(prev => ({ ...prev, functionName: e.target.value }))}
                placeholder="e.g., twoSum"
              />
            </div>

            <div>
              <Label>Parameters</Label>
              <div className="space-y-2">
                {formData.parameters.map((param, index) => (
                  <div key={index} className="border p-3 rounded-md space-y-2 relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => {
                          const newParams = formData.parameters.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, parameters: newParams }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={param.name}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          placeholder="nums"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">C Type</Label>
                        <Input
                          value={param.cType}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].cType = e.target.value;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          placeholder="Type (e.g., int, int*, struct ListNode*)"
                          className="h-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Size Param (optional)</Label>
                      <Input
                        value={param.sizeParam || ''}
                        onChange={(e) => {
                          const newParams = [...formData.parameters];
                          newParams[index].sizeParam = e.target.value;
                          setFormData(prev => ({ ...prev, parameters: newParams }));
                        }}
                        placeholder="numsSize"
                        className="h-8"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    parameters: [...prev.parameters, { name: '', cType: 'int', sizeParam: '' }] 
                  }))}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Return C Type</Label>
                 <Input
                    value={formData.returnType.cType}
                    onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        returnType: { ...prev.returnType, cType: e.target.value } 
                    }))}
                    placeholder="Return Type (e.g., int, void, struct ListNode*)"
                  />
              </div>
              <div>
                <Label>Return Size Param</Label>
                <Input
                  value={formData.returnType.sizeParam}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    returnType: { ...prev.returnType, sizeParam: e.target.value } 
                  }))}
                  placeholder="returnSize"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution Metadata - Java */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Metadata (Java)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="bg-muted p-3 rounded-md mb-4 text-sm text-muted-foreground">
                <p>Specific metadata for generating Java wrappers. Uses standard Java types.</p>
            </div>
            <div>
              <Label>Function Name</Label>
              <Input
                value={formData.javaMetadata.functionName}
                onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    javaMetadata: { ...prev.javaMetadata, functionName: e.target.value } 
                }))}
                placeholder="e.g., twoSum"
              />
            </div>
            <div>
              <Label>Parameters</Label>
               <div className="space-y-2">
                {formData.javaMetadata.parameters.map((param, index) => (
                   <div key={index} className="border p-3 rounded-md grid grid-cols-2 gap-2 relative">
                      <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => {
                          const newParams = formData.javaMetadata.parameters.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, javaMetadata: { ...prev.javaMetadata, parameters: newParams } }));
                      }}><X className="w-3 h-3" /></Button>
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input value={param.name} onChange={(e) => {
                            const newParams = [...formData.javaMetadata.parameters];
                            newParams[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, javaMetadata: { ...prev.javaMetadata, parameters: newParams } }));
                            }} placeholder="Name" className="h-8"/>
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Input
                            value={param.type}
                            onChange={(e) => {
                                const newParams = [...formData.javaMetadata.parameters];
                                newParams[index].type = e.target.value;
                                setFormData(prev => ({ ...prev, javaMetadata: { ...prev.javaMetadata, parameters: newParams } }));
                            }}
                            placeholder="Type (e.g., int, ListNode)" 
                            className="h-8"
                        />
                      </div>
                   </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    javaMetadata: { ...prev.javaMetadata, parameters: [...prev.javaMetadata.parameters, { name: '', type: 'int' }] } 
                  }))}><Plus className="w-4 h-4 mr-2" />Add Parameter</Button>
              </div>
            </div>
             <div>
                <Label>Return Type</Label>
                 <Input
                    value={formData.javaMetadata.returnType.type}
                    onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        javaMetadata: { ...prev.javaMetadata, returnType: { type: e.target.value } } 
                    }))}
                    placeholder="Return Type (e.g., int, ListNode)"
                  />
            </div>
          </CardContent>
        </Card>

        {/* Execution Metadata - Python */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Metadata (Python)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-md mb-4 text-sm text-muted-foreground">
                <p>Specific metadata for generating Python wrappers. Uses Python type hints.</p>
            </div>
            <div>
              <Label>Function Name</Label>
              <Input
                value={formData.pythonMetadata.functionName}
                onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pythonMetadata: { ...prev.pythonMetadata, functionName: e.target.value } 
                }))}
                placeholder="e.g., twoSum"
              />
            </div>
            <div>
              <Label>Parameters</Label>
               <div className="space-y-2">
                {formData.pythonMetadata.parameters.map((param, index) => (
                   <div key={index} className="border p-3 rounded-md grid grid-cols-2 gap-2 relative">
                      <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => {
                          const newParams = formData.pythonMetadata.parameters.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, pythonMetadata: { ...prev.pythonMetadata, parameters: newParams } }));
                      }}><X className="w-3 h-3" /></Button>
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input value={param.name} onChange={(e) => {
                            const newParams = [...formData.pythonMetadata.parameters];
                            newParams[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, pythonMetadata: { ...prev.pythonMetadata, parameters: newParams } }));
                            }} placeholder="Name" className="h-8"/>
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                         <Input
                            value={param.type}
                            onChange={(e) => {
                                const newParams = [...formData.pythonMetadata.parameters];
                                newParams[index].type = e.target.value;
                                setFormData(prev => ({ ...prev, pythonMetadata: { ...prev.pythonMetadata, parameters: newParams } }));
                            }}
                            placeholder="Type (e.g., int, Optional[ListNode])"
                            className="h-8"
                          />
                      </div>
                   </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    pythonMetadata: { ...prev.pythonMetadata, parameters: [...prev.pythonMetadata.parameters, { name: '', type: 'int' }] } 
                  }))}><Plus className="w-4 h-4 mr-2" />Add Parameter</Button>
              </div>
            </div>
             <div>
                <Label>Return Type</Label>
                <Input
                    value={formData.pythonMetadata.returnType.type}
                    onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pythonMetadata: { ...prev.pythonMetadata, returnType: { type: e.target.value } } 
                    }))}
                    placeholder="Return Type (e.g., int, Optional[ListNode])"
                  />
            </div>
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

            <div>
              <Label htmlFor="starterCodeC">C</Label>
              <Textarea
                id="starterCodeC"
                value={formData.starterCode.c || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  starterCode: { ...prev.starterCode, c: e.target.value }
                }))}
                rows={6}
                placeholder="#include <stdio.h>&#10;&#10;void solution() {&#10;    // Write your solution here&#10;}"
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

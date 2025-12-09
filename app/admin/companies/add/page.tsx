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
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"

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
    isHiring: true,
    hiringPipeline: [
      {
        roundNumber: 1,
        roundName: 'Aptitude Test',
        roundType: 'aptitude',
        description: '',
        duration: '60 minutes',
        passingCriteria: {
          minimumScore: 70,
          description: ''
        }
      }
    ],
    roles: [
      {
        title: '',
        level: 'Entry',
        packageRange: { min: 0, max: 0 },
        requirements: {
          experience: '',
          skills: [''],
          education: ''
        }
      }
    ],
    benefits: [''],
    interviewTips: ['']
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.companies.create(formData)
      if (response.success) {
        alert('Company created successfully!')
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
              <Checkbox
                id="isHiring"
                checked={formData.isHiring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHiring: checked as boolean }))}
              />
              <Label htmlFor="isHiring" className="cursor-pointer">
                Currently Hiring
              </Label>
            </div>
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

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Globe } from "lucide-react"

interface CompanyFiltersProps {
  filters: {
    hiringFreshers: boolean
    workMode: string
    experience: number
    minPackage: number
  }
  setFilters: (filters: any) => void
  onClear: () => void
}

export function CompanyFilters({ filters, setFilters, onClear }: CompanyFiltersProps) {
  const toggleWorkMode = (mode: string) => {
    setFilters((prev: any) => ({
      ...prev,
      workMode: prev.workMode === mode ? '' : mode
    }))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClear} className="h-auto p-0 text-muted-foreground hover:text-primary">
                Clear all
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fresher Hiring */}
        <div className="flex items-center space-x-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
          <input 
            type="checkbox" 
            id="hiringFreshers" 
            checked={filters.hiringFreshers} 
            onChange={(e) => setFilters((prev: any) => ({ ...prev, hiringFreshers: e.target.checked }))} 
            className="h-4 w-4 rounded text-green-600 focus:ring-green-500" 
          />
          <Label htmlFor="hiringFreshers" className="cursor-pointer font-medium text-green-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Hiring Freshers
          </Label>
        </div>

        {/* Experience */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Max Experience (Years)</Label>
            <Input 
                type="number" 
                min="0" 
                max="30"
                value={filters.experience || ''} 
                onChange={(e) => setFilters((prev: any) => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                placeholder="e.g. 2"
            />
            <p className="text-xs text-muted-foreground">Find jobs suitable for {filters.experience || 0} years exp.</p>
        </div>

        {/* Work Mode */}
        <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Work Mode
            </Label>
            <div className="flex flex-wrap gap-2">
                {['Remote', 'Hybrid', 'On-site'].map(mode => (
                    <Badge 
                        key={mode}
                        variant={filters.workMode === mode ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleWorkMode(mode)}
                    >
                        {mode}
                    </Badge>
                ))}
            </div>
        </div>

        {/* Salary */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Min Salary (LPA)</Label>
            <Input 
                type="number" 
                min="0" 
                value={filters.minPackage || ''} 
                onChange={(e) => setFilters((prev: any) => ({ ...prev, minPackage: parseInt(e.target.value) || 0 }))}
                placeholder="e.g. 10"
            />
        </div>
      </CardContent>
    </Card>
  )
}

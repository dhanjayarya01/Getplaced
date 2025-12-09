"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Building2 } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await apiService.companies.getAll({ limit: 100 })
      if (response.success) {
        setCompanies(response.data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500'
      case 'Medium': return 'text-yellow-500'
      case 'Hard': return 'text-red-500'
      case 'Very Hard': return 'text-purple-500'
      default: return ''
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading companies...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Link href="/admin/companies/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Package Range</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Hiring</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No companies found. Add your first company!
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded" />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getDifficultyColor(company.difficulty)}>
                      {company.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    {company.averagePackage?.min && company.averagePackage?.max
                      ? `₹${company.averagePackage.min}-${company.averagePackage.max} LPA`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {company.locations?.slice(0, 2).join(', ')}
                    {company.locations?.length > 2 && ` +${company.locations.length - 2}`}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${
                      company.isHiring ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {company.isHiring ? 'Hiring' : 'Not Hiring'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/companies/edit/${company._id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

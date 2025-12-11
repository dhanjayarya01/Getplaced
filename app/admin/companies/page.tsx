"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Building2, Trash2, Power } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  const handleToggleActive = async (companyId: string, currentStatus: boolean) => {
    try {
      await apiService.companies.update(companyId, { isActive: !currentStatus })
      setCompanies(companies.map(c => 
        c._id === companyId ? { ...c, isActive: !currentStatus } : c
      ))
    } catch (error) {
      console.error('Error toggling company status:', error)
      alert('Failed to toggle company status')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await apiService.companies.delete(deleteId)
      setCompanies(companies.filter(c => c._id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company')
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(company._id, company.isActive)}
                        title={company.isActive ? 'Deactivate (Hide)' : 'Activate (Show)'}
                      >
                        <Power className={`w-4 h-4 ${company.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                      </Button>
                      <Link href={`/admin/companies/edit/${company._id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(company._id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

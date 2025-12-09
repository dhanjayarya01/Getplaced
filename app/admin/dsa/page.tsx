"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
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

export default function DSAAdminPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const response = await apiService.dsa.getAll({ limit: 100 })
      if (response.success) {
        setProblems(response.data)
      }
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await apiService.dsa.delete(deleteId)
      setProblems(problems.filter(p => p._id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting problem:', error)
      alert('Failed to delete problem')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500'
      case 'Medium': return 'text-yellow-500'
      case 'Hard': return 'text-red-500'
      default: return ''
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading problems...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DSA Problems</h1>
        <Link href="/admin/dsa/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Data Structures</TableHead>
              <TableHead>Patterns</TableHead>
              <TableHead>Companies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No problems found. Add your first problem!
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => (
                <TableRow key={problem._id}>
                  <TableCell className="font-medium">{problem.title}</TableCell>
                  <TableCell>
                    <span className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.dataStructures?.slice(0, 2).map((ds: string) => (
                        <span key={ds} className="text-xs bg-accent px-2 py-1 rounded">
                          {ds}
                        </span>
                      ))}
                      {problem.dataStructures?.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{problem.dataStructures.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.patterns?.slice(0, 2).map((p: string) => (
                        <span key={p} className="text-xs bg-accent px-2 py-1 rounded">
                          {p}
                        </span>
                      ))}
                      {problem.patterns?.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{problem.patterns.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {problem.companies?.slice(0, 2).join(', ')}
                    {problem.companies?.length > 2 && ` +${problem.companies.length - 2}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/dsa/edit/${problem._id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(problem._id)}
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
              This action cannot be undone. This will permanently delete the problem.
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

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api"
import { InterviewFormModal } from "@/components/admin/mock-interviews/interview-form-modal"

export default function AdminMockInterviewsPage() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const response = await apiService.admin.mockInterviews.getAll()
      setInterviews(response.data || [])
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedInterview) {
        await apiService.admin.mockInterviews.update(selectedInterview._id, data)
      } else {
        await apiService.admin.mockInterviews.create(data)
      }
      fetchInterviews()
      setFormOpen(false)
      setSelectedInterview(null)
    } catch (error) {
      console.error("Failed to save:", error)
      throw error
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await apiService.admin.mockInterviews.toggleActive(id)
      fetchInterviews()
    } catch (error) {
      console.error("Failed to toggle active:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return
    
    try {
      await apiService.admin.mockInterviews.delete(id)
      fetchInterviews()
    } catch (error) {
      console.error("Failed to delete interview:", error)
    }
  }

  const handleEdit = (interview: any) => {
    setSelectedInterview(interview)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedInterview(null)
    setFormOpen(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mock Interviews</h1>
          <p className="text-muted-foreground">Manage interview templates</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Interview
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Icon</th>
                <th className="text-left p-4 font-medium">Title</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Duration</th>
                <th className="text-left p-4 font-medium">Stages</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    No interviews found. Create your first interview template!
                  </td>
                </tr>
              ) : (
                interviews.map((interview: any) => (
                  <tr key={interview._id} className="border-b hover:bg-secondary/50">
                    <td className="p-4 text-2xl">
                      {interview.image ? (
                        <img src={interview.image} alt={interview.title} className="w-8 h-8 object-contain rounded-md" />
                      ) : (
                        interview.icon
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{interview.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {interview.description}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        interview.codingType 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {interview.codingType ? 'Coding' : 'Behavioral'}
                      </span>
                    </td>
                    <td className="p-4">{interview.duration} min</td>
                    <td className="p-4">
                      {interview.interviewStages?.length || 0} stages
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        interview.isActive 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-Red-500/10 text-red-500'
                      }`}>
                        {interview.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleActive(interview._id)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(interview)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(interview._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InterviewFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedInterview(null)
        }}
        interview={selectedInterview}
        onSave={handleSave}
      />
    </div>
  )
}

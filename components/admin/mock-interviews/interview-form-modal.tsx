"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Stage {
  stage: number
  stageName: string
  difficulty: string
  strictness: number
  duration: number
  topics: string[]
}

interface InterviewFormData {
  title: string
  icon: string
  image?: string
  description: string
  codingType: boolean
  duration: number
  interviewStages: Stage[]
  tags: string[]
  companies: string[]
}

interface InterviewFormModalProps {
  open: boolean
  onClose: () => void
  interview?: any
  onSave: (data: InterviewFormData) => Promise<void>
}

export function InterviewFormModal({ open, onClose, interview, onSave }: InterviewFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InterviewFormData>({
    title: interview?.title || "",
    icon: interview?.icon || "🎤",
    image: interview?.image || "",
    description: interview?.description || "",
    codingType: interview?.codingType || false,
    duration: interview?.duration || 60,
    interviewStages: interview?.interviewStages || [
      {
        stage: 1,
        stageName: "Introduction",
        difficulty: "Easy",
        strictness: 3,
        duration: 5,
        topics: [],
      },
    ],
    tags: interview?.tags || [],
    companies: interview?.companies || [],
  })
  
  const [topicInput, setTopicInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [companyInput, setCompanyInput] = useState("")
  const [useImage, setUseImage] = useState(!!interview?.image)
  const [uploadingImage, setUploadingImage] = useState(false)

  const PREDEFINED_EMOJIS = [
    '🎤', '💻', '🧠', '⚙️', '📊', '📈', '🗣️', '🤝', 
    '🚀', '🎯', '🧩', '⚡', '💡', '🔥', '🛡️', '📱', 
    '🌐', '🛠️', '📝', '👔'
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const uploadData = new FormData()
      uploadData.append('image', file)
      
      const { apiService } = await import('@/lib/api')
      const response = await apiService.admin.mockInterviews.uploadImage(uploadData)
      
      if (response.success) {
        setFormData(prev => ({ ...prev, image: response.imageUrl, icon: "" }))
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddStage = () => {
    const newStage: Stage = {
      stage: formData.interviewStages.length + 1,
      stageName: "",
      difficulty: "Medium",
      strictness: 5,
      duration: 10,
      topics: [],
    }
    setFormData({ ...formData, interviewStages: [...formData.interviewStages, newStage] })
  }

  const handleRemoveStage = (index: number) => {
    const stages = formData.interviewStages.filter((_, i) => i !== index)
    // Renumber stages
    const renumbered = stages.map((s, i) => ({ ...s, stage: i + 1 }))
    setFormData({ ...formData, interviewStages: renumbered })
  }

  const handleStageChange = (index: number, field: keyof Stage, value: any) => {
    const stages = [...formData.interviewStages]
    stages[index] = { ...stages[index], [field]: value }
    setFormData({ ...formData, interviewStages: stages })
  }

  const handleAddTopic = (stageIndex: number) => {
    if (!topicInput.trim()) return
    const stages = [...formData.interviewStages]
    stages[stageIndex].topics = [...stages[stageIndex].topics, topicInput.trim()]
    setFormData({ ...formData, interviewStages: stages })
    setTopicInput("")
  }

  const handleRemoveTopic = (stageIndex: number, topicIndex: number) => {
    const stages = [...formData.interviewStages]
    stages[stageIndex].topics = stages[stageIndex].topics.filter((_, i) => i !== topicIndex)
    setFormData({ ...formData, interviewStages: stages })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Calculate total duration
      const totalDuration = formData.interviewStages.reduce((sum, stage) => sum + stage.duration, 0)
      await onSave({ ...formData, duration: totalDuration })
      onClose()
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{interview ? "Edit" : "Create"} Mock Interview</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title (lowercase, unique)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.toLowerCase() })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="google-sde-technical"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Visual Identity</label>
                <div className="flex items-center gap-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => setUseImage(false)}
                    className={!useImage ? "text-primary font-bold" : "text-muted-foreground"}
                  >
                    Icon
                  </button>
                  <span>|</span>
                  <button 
                    type="button" 
                    onClick={() => setUseImage(true)}
                    className={useImage ? "text-primary font-bold" : "text-muted-foreground"}
                  >
                    Image
                  </button>
                </div>
              </div>

              {!useImage ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl p-3 border rounded-lg bg-secondary/10 flex items-center justify-center min-w-[60px] min-h-[60px]">
                      {formData.icon}
                    </div>
                    <p className="text-xs text-muted-foreground">Select an icon from below</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 bg-secondary/10 p-3 rounded-lg">
                    {PREDEFINED_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji, image: "" })}
                        className={`text-2xl p-2 rounded hover:bg-secondary transition-colors flex items-center justify-center ${
                          formData.icon === emoji ? 'bg-primary/20 ring-1 ring-primary' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <span className="text-xs text-blue-500">Uploading...</span>}
                  {formData.image && (
                    <div className="mt-2 p-2 border rounded bg-secondary/20 inline-block w-16 h-16">
                      <img src={formData.image} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.codingType}
                onChange={(e) => setFormData({ ...formData, codingType: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Coding Interview</span>
            </label>
          </div>

          {/* Stages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Interview Stages</h3>
              <Button type="button" onClick={handleAddStage} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </div>

            <div className="space-y-4">
              {formData.interviewStages.map((stage, index) => (
                <div key={index} className="p-4 border rounded-lg bg-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Stage {stage.stage}</span>
                    {formData.interviewStages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Stage Name</label>
                      <input
                        type="text"
                        value={stage.stageName}
                        onChange={(e) => handleStageChange(index, "stageName", e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                        placeholder="Technical Round"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Difficulty</label>
                      <select
                        value={stage.difficulty}
                        onChange={(e) => handleStageChange(index, "difficulty", e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Strictness (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={stage.strictness}
                        onChange={(e) => handleStageChange(index, "strictness", parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={stage.duration}
                        onChange={(e) => handleStageChange(index, "duration", parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium mb-1">Topics</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTopic(index)
                          }
                        }}
                        className="flex-1 px-2 py-1 text-sm border rounded"
                        placeholder="Add topic..."
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddTopic(index)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stage.topics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="px-2 py-1 bg-primary/10 text-primary rounded text-xs flex items-center gap-1"
                        >
                          {topic}
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(index, topicIndex)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : interview ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

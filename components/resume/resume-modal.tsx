"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Resume {
  _id: string
  resumeUrl: string
  createdAt: string
  parsedData: any
}

export function ResumeModal() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'list' | 'upload' | 'detail' | 'pdf'>('upload')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      fetchResumes()
    }
  }, [open])

  const fetchResumes = async () => {
    try {
      const response = await apiService.resume.get()
      if (response.success && response.data) {
        setResumes([response.data]) // Backend returns single latest resume
        setView('list')
      } else {
        setView('upload')
      }
    } catch (err) {
      setView('upload')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please select a valid PDF file")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("resume", file)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await apiService.resume.upload(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log('=== RESUME UPLOAD RESPONSE ===')
      console.log('Full Response:', response)
      console.log('Raw Text:', response.data?.rawText)
      console.log('Cleaned Text:', response.data?.cleanedText)
      console.log('Parsed Data:', response.data?.parsedData)
      console.log('==============================')

      if (response.success) {
        await fetchResumes()
        setFile(null)
        setUploadProgress(0)
      } else {
        throw new Error(response.message || "Upload failed")
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload resume. Please try again.")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleViewDetail = (resume: Resume) => {
    setSelectedResume(resume)
    setView('detail')
  }

  const handleViewPDF = (resume: Resume) => {
    setSelectedResume(resume)
    setView('pdf')
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full gap-2" variant={resumes.length > 0 ? "default" : "outline"}>
        <FileText className="h-4 w-4" />
        {resumes.length > 0 ? 'Resume' : 'Upload Resume'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-primary" />
              {view === 'list' ? 'My Resumes' : view === 'detail' ? 'Resume Analysis' : view === 'pdf' ? 'Resume Preview' : 'Upload Resume'}
            </DialogTitle>
          </DialogHeader>

          {/* List View */}
          {view === 'list' && (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{resume.parsedData?.name || 'Resume'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(resume.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(resume)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              ))}

              <Button
                onClick={() => setView('upload')}
                variant="outline"
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload New Resume
              </Button>
            </div>
          )}

          {/* Upload View */}
          {view === 'upload' && (
            <div className="space-y-4">
              {!file ? (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-secondary/20">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-1">Drop your resume here</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      or click to browse (PDF only, max 5MB)
                    </p>
                    <Button variant="outline" size="sm" disabled={uploading}>
                      Choose File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading and analyzing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload & Analyze
                      </>
                    )}
                  </Button>
                </div>
              )}

              {resumes.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setView('list')}
                  className="w-full"
                >
                  ← Back to Resumes
                </Button>
              )}
            </div>
          )}

          {/* Detail View */}
          {view === 'detail' && selectedResume && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Resume Analytics</p>
                  <p className="text-xs">
                    Uploaded {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedResume.parsedData.name && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <p className="font-semibold">{selectedResume.parsedData.name}</p>
                  </div>
                )}

                {selectedResume.parsedData.totalExperienceYears !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Experience</label>
                    <p className="font-semibold">{selectedResume.parsedData.totalExperienceYears} years</p>
                  </div>
                )}

                {selectedResume.parsedData.skills && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[...selectedResume.parsedData.skills.languages, ...selectedResume.parsedData.skills.frameworks, ...selectedResume.parsedData.skills.tools]
                        .slice(0, 10)
                        .map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {selectedResume.parsedData.strengthAreas && selectedResume.parsedData.strengthAreas.length > 0 && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <h4 className="font-semibold text-green-600 mb-1 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {selectedResume.parsedData.strengthAreas.map((strength: string, idx: number) => (
                        <li key={idx} className="text-xs">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedResume.parsedData.potentialGaps && selectedResume.parsedData.potentialGaps.length > 0 && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                    <h4 className="font-semibold text-yellow-600 mb-1 flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Improvement Areas
                    </h4>
                    <ul className="space-y-1">
                      {selectedResume.parsedData.potentialGaps.map((gap: string, idx: number) => (
                        <li key={idx} className="text-xs">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setView('list')}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewPDF(selectedResume)}
                  className="flex-1"
                >
                  View PDF
                </Button>
              </div>
            </div>
          )}

          {/* PDF View */}
          {view === 'pdf' && selectedResume && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                <iframe  
                  src={selectedResume.resumeUrl}
                  className="w-full h-full border-0"
                  title="Resume PDF Preview"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setView('detail')}
                  className="flex-1"
                >
                  ← Back to Analysis
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.open(selectedResume.resumeUrl, '_blank')}
                  className="flex-1"
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

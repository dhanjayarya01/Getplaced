import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Sparkles, Check, AlertCircle, Loader2 } from "lucide-react"
import { ResumeModal } from "@/components/resume/resume-modal"
import { apiService } from "@/lib/api"

export function ResumeSection() {
  const [resumeData, setResumeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchResume = async () => {
    try {
      const response = await apiService.resume.get()
      if (response.success && response.data) {
        setResumeData(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch resume:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResume()
  }, [])

  return (
    <div className="space-y-6 sticky top-24">
      {/* Resume Builder Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Resume Builder</h3>
            <p className="text-sm text-muted-foreground">Create ATS-friendly resume</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full bg-primary/50 text-primary-foreground opacity-70 cursor-not-allowed hover:bg-primary/50" 
            title="Coming Soon"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
          <ResumeModal>
            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Upload Existing
            </Button>
          </ResumeModal>
        </div>
      </div>

      {/* Resume Analysis Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Resume Analysis</h3>

        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Analyzing...</span>
          </div>
        ) : resumeData?.parsedData ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Experience</span>
                <span className="text-sm font-medium text-primary">{resumeData.parsedData.totalExperienceYears || 0} years</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {resumeData.parsedData.strengthAreas?.slice(0, 3).map((strength: string, i: number) => (
                <div key={`s-${i}`} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{strength}</span>
                </div>
              ))}
              {resumeData.parsedData.potentialGaps?.slice(0, 2).map((gap: string, i: number) => (
                <div key={`g-${i}`} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{gap}</span>
                </div>
              ))}
            </div>
            
            <ResumeModal>
              <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                View Full Analysis
              </Button>
            </ResumeModal>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">No resume uploaded yet</p>
            <ResumeModal>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Upload Resume to Analyze
              </Button>
            </ResumeModal>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Your Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">Companies</div>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="text-2xl font-bold text-accent">45</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">8</div>
            <div className="text-xs text-muted-foreground">Mocks</div>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-xs text-muted-foreground">Ready</div>
          </div>
        </div>
      </div>
    </div>
  )
}

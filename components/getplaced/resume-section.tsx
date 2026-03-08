"use client"

import { Button } from "@/components/ui/button"
import { FileText, Upload, Sparkles, Check, AlertCircle } from "lucide-react"
import { ResumeModal } from "@/components/resume/resume-modal"

export function ResumeSection() {
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
          <Button className="w-full bg-primary text-primary-foreground">
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

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">ATS Score</span>
              <span className="text-sm font-medium text-primary">78%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Clear contact information</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Proper section headings</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>Add more quantifiable achievements</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>Include relevant keywords</span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
          View Full Analysis
        </Button>
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

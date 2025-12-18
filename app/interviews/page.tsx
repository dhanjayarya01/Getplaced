import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { InterviewHero } from "@/components/interviews/interview-hero"
import { InterviewTypes } from "@/components/interviews/interview-types"
import { InterviewSchedule } from "@/components/interviews/interview-schedule"
import { InterviewHistory } from "@/components/interviews/interview-history"
import { ResumeModal } from "@/components/resume/resume-modal"

export default function InterviewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <InterviewHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <InterviewTypes />
          <div className="grid lg:grid-cols-2 gap-8 mt-12">
            <InterviewSchedule />
            <InterviewHistory resumeButton={<ResumeModal />} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

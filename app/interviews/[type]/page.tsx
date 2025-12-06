import { Navbar } from "@/components/navbar"
import { InterviewRoom } from "@/components/interviews/interview-room"

export default async function InterviewRoomPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <InterviewRoom interviewType={type} />
      </div>
    </main>
  )
}

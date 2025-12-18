"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { VapiProvider } from "@/components/interviews/vapi-provider"
import { VoiceInterviewLayout } from "@/components/interviews/voice-interview-layout"
import { CodingInterviewLayout } from "@/components/interviews/coding-interview-layout"
import { apiService } from "@/lib/api"

export default function InterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [interview, setInterview] = useState<any>(null)
  const [systemPrompt, setSystemPrompt] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
  }, [params.sessionId])

  const fetchSession = async () => {
    try {
      const response = await apiService.interviewSessions.getById(params.sessionId as string)
      setSession(response.data)
      
      // Store systemPrompt if available
      if (response.data.systemPrompt) {
        setSystemPrompt(response.data.systemPrompt)
        console.log('System prompt loaded from session:', response.data.systemPrompt.substring(0, 200) + '...')
      }
      
      // Fetch interview details
      const interviewResponse = await apiService.mockInterviews.getById(params.id as string)
      setInterview(interviewResponse.data)
    } catch (error) {
      console.error("Failed to fetch session:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading session...</div>
  }

  if (!session || !interview) {
    return <div className="flex items-center justify-center min-h-screen">Session not found</div>
  }

  return (
    <VapiProvider>
      {interview.codingType ? (
        <CodingInterviewLayout session={session} interview={interview} systemPrompt={systemPrompt} />
      ) : (
        <VoiceInterviewLayout session={session} interview={interview} systemPrompt={systemPrompt} />
      )}
    </VapiProvider>
  )
}

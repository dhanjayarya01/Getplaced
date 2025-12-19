"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, X } from "lucide-react"
import { useVapi } from "./vapi-provider"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { DSAProblemView } from "@/components/dsa/dsa-problem-view"

interface CodingInterviewLayoutProps {
  session: any
  interview: any
  systemPrompt?: string
}

export function CodingInterviewLayout({ session, interview, systemPrompt }: CodingInterviewLayoutProps) {
  const router = useRouter()
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute } = useVapi()
  const [isAvatarHidden, setIsAvatarHidden] = useState(false)

  useEffect(() => {
    // Use the backend-generated system prompt if available
    const prompt = systemPrompt || `You are conducting a ${interview.title} coding interview.
Stage: ${interview.interviewStages.find((s: any) => s.stage === session.currentStage)?.stageName}
Topics: ${interview.interviewStages.find((s: any) => s.stage === session.currentStage)?.topics.join(", ")}
Guide the candidate through the coding problem.`
    
    console.log('Using system prompt:', prompt.substring(0, 200) + '...')
    
    // Auto-start VAPI call with voice and language preferences
    if (prompt && !isCallActive) {
      const voiceId = (session as any).voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel - default
      const language = (session as any).language || 'English'
      startCall(prompt, voiceId, language).catch(err => console.error("Failed to start VAPI:", err))
    }
  }, [systemPrompt])

  const handleEndInterview = async () => {
    // Extract score from transcript before ending
    let extractedScore = 7 // Default fallback
    
    // Look for score patterns in AI messages
    const aiMessages = transcript.filter(t => t.role === "assistant")
    for (const msg of aiMessages.reverse()) {
      const scoreMatch = msg.content.match(/score[:\s]+(\d+(?:\.\d+)?)\s*(?:out of|\/|\s*tenths?\s*)\s*(?:10)?/i) ||
                        msg.content.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*10/i) ||
                        msg.content.match(/your score[:\s,]+(\d+(?:\.\d+)?)/i)
      
      if (scoreMatch) {
        extractedScore = parseFloat(scoreMatch[1])
        console.log("Extracted score from transcript:", extractedScore)
        break
      }
    }
    
    await endCall()
    
    try {
      console.log("Saving interview with score:", extractedScore)
      await apiService.interviewSessions.updateScore(session._id, {
        stage: session.currentStage,
        score: extractedScore,
        feedback: `Interview completed with score ${extractedScore}/10`
      })
      router.push("/interviews")
    } catch (error) {
      console.error("Failed to update score:", error)
      alert("Failed to save interview progress. Please try again.")
    }
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* DSA Problem View - Full Screen */}
      <div className="h-full w-full">
        <DSAProblemView problemId="mock-problem" />
      </div>

      {/* Interview Avatars Overlay - Top Right */}
      {!isAvatarHidden && (
        <div className="fixed top-4 right-4 bg-card border rounded-xl shadow-2xl z-50 w-80">
          <div className="p-4">
            {/* Header with hide button */}
            <div className="flex items-center justify-between mb-3">
              <div className={`px-2 py-1 rounded-full text-xs ${
                isCallActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}>
                {isCallActive ? "● Live Interview" : "● Offline"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAvatarHidden(true)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* AI Avatar */}
            <div className="flex items-center gap-3 mb-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">AI Interviewer</h3>
                <p className="text-xs text-muted-foreground">Listening...</p>
              </div>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-3 mb-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                😊
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">You</h3>
                <p className="text-xs text-muted-foreground">
                  {isMuted ? "Muted" : "Active"}
                </p>
              </div>
            </div>

            {/* Transcript Preview */}
            <div className="mb-3 p-3 bg-secondary/20 rounded-lg max-h-32 overflow-y-auto">
              <h4 className="text-xs font-semibold mb-2">Recent Conversation</h4>
              {transcript.slice(-3).map((item, index) => (
                <div key={index} className="text-xs mb-1">
                  <span className="font-medium">{item.role === "assistant" ? "AI: " : "You: "}</span>
                  <span className="text-muted-foreground line-clamp-1">{item.content}</span>
                </div>
              ))}
              {transcript.length === 0 && (
                <p className="text-xs text-muted-foreground">No conversation yet...</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "default" : "outline"}
                size="sm"
                onClick={toggleMute}
                className="flex-1"
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndInterview}
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Show Avatars Button (when hidden) */}
      {isAvatarHidden && (
        <Button
          onClick={() => setIsAvatarHidden(false)}
          className="fixed top-4 right-4 z-50"
          size="sm"
        >
          Show Interview Panel
        </Button>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import { useVapi } from "./vapi-provider"
import { apiService } from "@/lib/api"

interface VoiceInterviewLayoutProps {
  session: any
  interview: any
  systemPrompt?: string
}

export function VoiceInterviewLayout({ session, interview, systemPrompt }: VoiceInterviewLayoutProps) {
  const router = useRouter()
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute } = useVapi()

  useEffect(() => {
    // Use the backend-generated system prompt if available
    const stage = interview.interviewStages.find((s: any) => s.stage === session.currentStage)
    const prompt = systemPrompt || `You are conducting a ${interview.title} interview.
Stage: ${stage?.stageName}
Focus: ${stage?.topics.join(", ")}
Be ${stage?.strictness >= 7 ? "strict" : "supportive"}.`
    
    console.log('Using system prompt:', prompt.substring(0, 200) + '...')
    
    // Auto-start call only if not already active
    const initCall = async () => {
      if (prompt && !isCallActive) {
        try {
          await startCall(prompt)
          console.log("VAPI call started successfully")
        } catch (error) {
          console.error("Failed to start VAPI call:", error)
        }
      }
    }
    
    initCall()
  }, [systemPrompt, interview, session])

  const generatePrompt = () => {
    const stage = interview.interviewStages.find((s: any) => s.stage === session.currentStage)
    return `You are conducting a ${interview.title} interview.
Stage: ${stage?.stageName}
Focus: ${stage?.topics.join(", ")}
Be ${stage?.strictness >= 7 ? "strict" : "supportive"}.`
  }

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
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversation */}
      <div className="w-96 border-r flex flex-col bg-card">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold capitalize">{interview.title.replace(/-/g, " ")}</h2>
            <div className={`px-2 py-1 rounded-full text-xs ${
              isCallActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            }`}>
              {isCallActive ? "● Live" : "● Offline"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Stage {session.currentStage}: {interview.interviewStages[session.currentStage - 1]?.stageName}
          </p>
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transcript.map((item, index) => (
            <div key={index} className={`${
              item.role === "assistant" ? "text-left" : "text-right"
            }`}>
              <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                item.role === "assistant" 
                  ? "bg-primary/10 text-foreground" 
                  : "bg-accent text-accent-foreground"
              }`}>
                <p className="text-xs font-semibold mb-1">
                  {item.role === "assistant" ? "Tanya (AI)" : "You"}
                </p>
                <p className="text-sm">{item.content}</p>
              </div>
            </div>
          ))}
          {transcript.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <p>Waiting for conversation to start...</p>
              <p className="text-xs mt-2">Tanya will greet you shortly</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant={isMuted ? "default" : "outline"}
              onClick={toggleMute}
              className="flex-1"
            >
              {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndInterview}
              className="flex-1"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {isMuted ? "Microphone is muted" : "Speaking..."}
          </p>
        </div>
      </div>

      {/* Main Content - Avatars */}
      <div className="flex-1 grid grid-cols-2 gap-8 p-8">
        {/* AI Avatar - Tanya */}
        <div className="flex flex-col items-center justify-center bg-card rounded-xl border p-8">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-8xl mb-4 animate-pulse">
            🤖
          </div>
          <h2 className="text-2xl font-bold">Tanya</h2>
          <p className="text-muted-foreground">AI Interviewer</p>
          <div className="mt-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {isCallActive ? "Listening..." : "Waiting..."}
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex flex-col items-center justify-center bg-card rounded-xl border p-8">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-8xl mb-4">
            😊
          </div>
          <h2 className="text-2xl font-bold">You</h2>
          <p className="text-muted-foreground">Candidate</p>
          <div className="mt-4 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
            {isMuted ? "Muted" : "Active"}
          </div>
        </div>
      </div>
    </div>
  )
}

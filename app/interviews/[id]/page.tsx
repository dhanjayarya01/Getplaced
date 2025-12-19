"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Clock, Target, Zap } from "lucide-react"
import { apiService } from "@/lib/api"

export default function InterviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState("")
  const [strictness, setStrictness] = useState(5)
  const [language, setLanguage] = useState("English")
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM") // Rachel - default

  useEffect(() => {
    fetchInterview()
  }, [params.id])

  const fetchInterview = async () => {
    try {
      const response = await apiService.mockInterviews.getById(params.id as string)
      setInterview(response.data)
      setDifficulty(response.data.interviewStages[0]?.difficulty || "Medium")
      setStrictness(response.data.interviewStages[0]?.strictness || 5)
    } catch (error) {
      console.error("Failed to fetch interview:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = async () => {
    try {
      console.log('🔍 STARTING INTERVIEW WITH:', {
        interviewId: params.id,
        difficulty,
        strictness,
        language,
        voiceId
      })

      const response = await apiService.interviewSessions.start({
        interviewId: params.id as string,
        difficulty,
        strictness,
        language,
        voiceId,
      })

      console.log('✅ SESSION STARTED:', response.data)

      if (response.success) {
        router.push(`/interviews/${params.id}/session/${response.data.sessionId}`)
      }
    } catch (error) {
      console.error("Failed to start interview:", error)
      alert("Failed to start interview. Please try again.")
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!interview) {
    return <div className="p-8 text-center">Interview not found</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-xl border p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{interview.icon}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold capitalize mb-2">
                {interview.title.replace(/-/g, " ")}
              </h1>
              <p className="text-muted-foreground mb-4">{interview.description}</p>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  interview.codingType 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {interview.codingType ? '💻 Coding' : '🗣️ Behavioral'}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {interview.duration} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Interview Settings</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Strictness: <span className="text-primary">{strictness}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={strictness}
                onChange={(e) => setStrictness(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">🌍 Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">🎙️ Voice Model</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <optgroup label="Female Voices">
                  <option value="21m00Tcm4TlvDq8ikWAM">Rachel - Warm & Clear (Default)</option>
                  <option value="EXAVITQu4vr4xnSDxMaL">Bella - Sweet</option>
                  <option value="AZnzlk1XvdvUeBnXmlld">Domi - Strong</option>
                  <option value="XB0fDUnXU5powFXDhCwa">Charlotte - Seductive</option>
                  <option value="Xb7hH8MSUJpSbSDYk0k2">Alice - Confident News</option>
                </optgroup>
                <optgroup label="Male Voices">
                  <option value="pNInz6obpgDQGcFmaJgB">Adam - Deep Professional</option>
                  <option value="ErXwobaYiN019PkySvjV">Antoni - Friendly Young</option>
                  <option value="VR6AewLTigWG4xSOukaG">Arnold - Crisp Clear</option>
                  <option value="pqHfZKP75CvOlQylNhV4">Bill - Strong Documentary</option>
                  <option value="nPczCjzI2devNBz1zQrb">Brian - Deep Rich</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Interview Stages</h2>
          <div className="space-y-3">
            {interview.interviewStages.map((stage: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-secondary/20 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {stage.stage}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{stage.stageName}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {stage.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Strictness: {stage.strictness}/10
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stage.duration} min
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {stage.topics.map((topic: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartInterview}
          size="lg"
          className="w-full"
        >
          <Play className="h-5 w-5 mr-2" />
          Start Interview
        </Button>
      </div>
    </div>
  )
}

"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { vapiService } from "@/lib/vapi"

interface VapiContextType {
  isCallActive: boolean
  isMuted: boolean
  transcript: { role: string; content: string }[]
  startCall: (systemPrompt: string) => Promise<void>
  endCall: () => Promise<void>
  toggleMute: () => void
}

const VapiContext = createContext<VapiContextType | null>(null)

export function VapiProvider({ children }: { children: ReactNode }) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([])

  const startCall = useCallback(async (systemPrompt: string) => {
    try {
      await vapiService.startCall(systemPrompt, (message) => {
        if (message.type === 'transcript') {
          setTranscript(prev => [
            ...prev,
            {
              role: message.role,
              content: message.transcript
            }
          ])
        }
      })
      setIsCallActive(true)
    } catch (error) {
      console.error('Failed to start call:', error)
      throw error
    }
  }, [])

  const endCall = useCallback(async () => {
    try {
      await vapiService.endCall()
      setIsCallActive(false)
    } catch (error) {
      console.error('Failed to end call:', error)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const newMutedState = vapiService.toggleMute()
    setIsMuted(newMutedState ?? false)
  }, [])

  return (
    <VapiContext.Provider
      value={{
        isCallActive,
        isMuted,
        transcript,
        startCall,
        endCall,
        toggleMute,
      }}
    >
      {children}
    </VapiContext.Provider>
  )
}

export function useVapi() {
  const context = useContext(VapiContext)
  if (!context) {
    throw new Error('useVapi must be used within VapiProvider')
  }
  return context
}

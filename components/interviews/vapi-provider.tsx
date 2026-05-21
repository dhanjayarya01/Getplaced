"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { vapiService } from "@/lib/vapi"

interface VapiContextType {
  isCallActive: boolean
  isMuted: boolean
  transcript: { role: string; content: string }[]
  startCall: (systemPrompt: string, voiceId?: string, language?: string, onFunctionCall?: (name: string, args: any) => any, additionalFunctions?: any[]) => Promise<void>
  endCall: () => Promise<void>
  toggleMute: () => void
  hasSpoken: boolean
}

const VapiContext = createContext<VapiContextType | null>(null)

export function VapiProvider({ children }: { children: ReactNode }) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([])
  const [hasSpoken, setHasSpoken] = useState(false)

  const startCall = useCallback(async (systemPrompt: string, voiceId?: string, language?: string, onFunctionCall?: (name: string, args: any) => any, additionalFunctions?: any[]) => {
    try {
      setHasSpoken(false)
      await vapiService.startCall(systemPrompt, voiceId, language, async (message: any) => {
        // Log all messages for debugging
        // console.log('📥 VAPI Provider received:', message)
        
        if (message.type === 'transcript') {
          setTranscript(prev => [
            ...prev,
            {
              role: message.role,
              content: message.transcript
            }
          ])
          if (message.role === 'assistant') {
            setHasSpoken(true)
          }
        }
        
        // Mark as spoken as soon as model starts generating or assistant speaks
        if (message.type === 'model-output' || message.type === 'speech-update' || message.type === 'voice-input') {
          setHasSpoken(true)
        }
        
        // Handle VAPI function calls — SDK may send either 'function-call' or 'tool-calls'
        const isFunctionCall = message.type === 'function-call'
        const isToolCalls = message.type === 'tool-calls' && message.toolCalls?.length > 0

        if ((isFunctionCall || isToolCalls) && onFunctionCall) {
          let functionName: string
          let functionArgs: any
          let toolCallId: string

          if (isFunctionCall) {
            // Shape: { type: 'function-call', functionCallId, functionCall: { name, parameters } }
            functionName = message.functionCall?.name
            functionArgs = message.functionCall?.parameters ?? message.functionCall?.arguments
            toolCallId = message.functionCallId || message.id || ''
            console.log('🔧 function-call received:', functionName, functionArgs)
          } else {
            // Shape: { type: 'tool-calls', toolCalls: [{ id, function: { name, arguments } }] }
            const toolCall = message.toolCalls[0]
            functionName = toolCall.function?.name || toolCall.name
            functionArgs = toolCall.function?.arguments || toolCall.arguments || toolCall.parameters
            toolCallId = toolCall.id || ''
            console.log('🔧 tool-calls received:', functionName, functionArgs)
          }

          // Parse arguments if they are a JSON string
          let parsedArgs: any = {}
          try {
            parsedArgs = typeof functionArgs === 'string'
              ? JSON.parse(functionArgs)
              : (functionArgs ?? {})
          } catch (e) {
            console.error('❌ Failed to parse function args:', functionArgs, e)
          }

          console.log('✅ Calling function:', functionName, 'with args:', parsedArgs)

          // Call the function handler and send result back
          onFunctionCall(functionName, parsedArgs).then((result: any) => {
            if (result) {
              console.log('📤 Function returned result, sending back to VAPI...')
              vapiService.sendToolResult(toolCallId, result)
            }
          }).catch((error: any) => {
            console.error('❌ Function call error:', error)
          })
        }
      }, additionalFunctions)
      setIsCallActive(true)
      console.log('VAPI call started successfully')
    } catch (error) {
      console.error('Failed to start VAPI call:', error)
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
        hasSpoken,
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

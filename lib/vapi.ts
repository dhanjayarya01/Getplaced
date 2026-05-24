// VAPI Service for voice interviews
import Vapi from '@vapi-ai/web'

class VapiService {
    private vapi: Vapi | null = null
    private isCallActive = false
    private currentMessageHandler: ((message: any) => void) | null = null
    private processedToolCallIds = new Set<string>()

    constructor() {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
        console.log('🔑 VAPI Key loaded:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET')
        this.vapi = new Vapi(apiKey)
    }

    async startCall(
        systemPrompt: string,
        voiceId?: string,
        language?: string,
        onMessage?: (message: any) => void,
        additionalFunctions?: any[]
    ) {
        if (!this.vapi) throw new Error('VAPI not initialized')

        const languageMap: { [key: string]: string } = {
            'English': 'en', 'Hindi': 'hi', 'Spanish': 'es', 'French': 'fr', 'German': 'de'
        }
        const transcriptionLanguage = languageMap[language || 'English'] || 'en'
        const elevenLabsModel = language && language !== 'English' ? 'eleven_multilingual_v2' : undefined

        console.log('VAPI Configuration:', { language, transcriptionLanguage, voiceId })

        // Default functions (always included)
        const defaultFunctions = [
            {
                name: 'submitFeedback',
                description: 'Submit the final interview feedback and score after verbally giving feedback.',
                parameters: {
                    type: 'object',
                    properties: {
                        score: { type: 'number', description: 'Score from 0-10' },
                        areasGoodIn: {
                            type: 'array',
                            items: { type: 'string' },
                            description: '2-3 things the candidate did well'
                        },
                        areasToWorkOn: {
                            type: 'array',
                            items: { type: 'string' },
                            description: '2 areas for improvement'
                        }
                    },
                    required: ['score', 'areasGoodIn', 'areasToWorkOn']
                }
            }
        ]

        const functions = [...defaultFunctions, ...(additionalFunctions || [])]

        try {
            await this.vapi.start({
                model: {
                    provider: 'openai',
                    model: 'gpt-4',
                    messages: [{ role: 'system', content: systemPrompt }],
                    functions,
                } as any,
                voice: {
                    provider: '11labs',
                    voiceId: voiceId || '21m00Tcm4TlvDq8ikWAM',
                    ...(elevenLabsModel && { model: elevenLabsModel })
                },
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-3',
                    language: transcriptionLanguage as any
                },
                maxDurationSeconds: 1800,
                silenceTimeoutSeconds: 300,
                backgroundSound: 'office',
                responseDelaySeconds: 0.4,
                firstMessageMode: 'assistant-speaks-first-with-model-generated-message',
                endCallMessage: 'Interview session ended. Thank you!',
            } as any)

            this.isCallActive = true

            // Remove stale listeners from previous calls
            if (this.currentMessageHandler) {
                this.vapi.off('message', this.currentMessageHandler)
                this.currentMessageHandler = null
            }
            this.processedToolCallIds.clear()

            this.currentMessageHandler = (message: any) => {
                // Only log function/tool events — suppress model-output, speech-update, etc.
                if (message.type === 'function-call' || message.type === 'tool-calls') {
                    console.log('🔧 [VAPI TOOL CALL]', JSON.stringify(message, null, 2))
                }

                // Dedup guard
                if (message.type === 'tool-calls' && message.toolCalls?.length > 0) {
                    const callId = message.toolCalls[0]?.id
                    if (callId && this.processedToolCallIds.has(callId)) {
                        console.warn('⚠️ Duplicate tool-call ignored:', callId)
                        return
                    }
                    if (callId) this.processedToolCallIds.add(callId)
                }

                if (onMessage) onMessage(message)
            }

            this.vapi.on('message', this.currentMessageHandler)
            this.vapi.on('call-end', () => {
                this.isCallActive = false
                this.processedToolCallIds.clear()
            })

            console.log('✅ VAPI Call started successfully')
            return { success: true }
        } catch (error: any) {
            console.error('❌ VAPI Call failed:', error)
            throw new Error(`VAPI Error: ${error?.message || 'Unknown error'}`)
        }
    }

    async endCall() {
        if (!this.vapi) return
        try {
            await this.vapi.stop()
            this.isCallActive = false
            console.log('VAPI call ended')
        } catch (error) {
            console.error('Error ending VAPI call:', error)
        }
    }

    toggleMute() {
        if (!this.vapi) return
        this.vapi.setMuted(!this.vapi.isMuted())
        return !this.vapi.isMuted()
    }

    isMuted() { return this.vapi?.isMuted() || false }
    isActive() { return this.isCallActive }

    on(event: string, callback: (data: any) => void) {
        if (!this.vapi) return
        this.vapi.on(event as any, callback)
    }

    off(event: string, callback: (data: any) => void) {
        if (!this.vapi) return
        this.vapi.off(event as any, callback)
    }

    // Inject content into the active VAPI conversation as a user message.
    // Using role 'user' because VAPI reliably processes it — 'system' may be ignored.
    // The message is prefixed so the AI knows it's a system-injected update, not speech.
    injectSystemMessage(content: string) {
        if (!this.vapi) return
        try {
            this.vapi.send({
                type: 'add-message',
                message: {
                    role: 'user',
                    content: `[SYSTEM] ${content}`
                }
            } as any)
        } catch (e) {
            console.warn('⚠️ injectSystemMessage failed:', e)
        }
    }

    // VAPI uses two event types depending on SDK version / config:
    //   'function-call' → expects tool-call-result
    //   'tool-calls'    → expects add-message with role 'tool'
    sendToolResult(toolCallId: string, result: any, messageType?: string) {
        if (!this.vapi) {
            console.error('❌ sendToolResult: VAPI not initialized')
            return
        }

        try {
            const resultStr = typeof result === 'string' ? result : JSON.stringify(result)
            console.log('📤 sendToolResult → toolCallId:', toolCallId, '| result:', resultStr.substring(0, 120))

            // Format 1: tool-call-result (for function-call events)
            try {
                this.vapi.send({
                    type: 'tool-call-result',
                    toolCallId,
                    result: resultStr
                } as any)
                console.log('✅ Sent tool-call-result')
            } catch (e) {
                console.warn('⚠️ tool-call-result send failed:', e)
            }

            // Format 2: add-message (for tool-calls events)
            try {
                this.vapi.send({
                    type: 'add-message',
                    message: {
                        role: 'tool',
                        tool_call_id: toolCallId,
                        toolCallId: toolCallId,
                        content: resultStr
                    }
                } as any)
                console.log('✅ Sent add-message tool result')
            } catch (e) {
                console.warn('⚠️ add-message send failed:', e)
            }

            // GUARANTEE THE AI SEES IT: Push it directly as a system message!
            // If VAPI drops the tool result or fails to parse it, this ensures the AI still gets the payload.
            try {
                this.vapi.send({
                    type: 'add-message',
                    message: {
                        role: 'system',
                        content: `[SYSTEM ALERT: Tool Execution Result]\nThe requested tool returned this data:\n${resultStr}`
                    }
                } as any)
                console.log('✅ Injected tool result as system message to guarantee visibility')
            } catch (e) {
                console.warn('⚠️ inject system message failed:', e)
            }
        } catch (error) {
            console.error('❌ sendToolResult failed:', error)
        }
    }

}

export const vapiService = new VapiService()

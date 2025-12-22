// VAPI Service for voice interviews
import Vapi from '@vapi-ai/web'

class VapiService {
    private vapi: Vapi | null = null
    private isCallActive = false

    constructor() {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
        console.log('🔑 VAPI Key loaded:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET')
        this.vapi = new Vapi(apiKey)
    }

    // Start call with system prompt, optional voice, and optional language
    async startCall(systemPrompt: string, voiceId?: string, language?: string, onMessage?: (message: any) => void, additionalFunctions?: any[]) {
        if (!this.vapi) throw new Error('VAPI not initialized')

        // Map language names to Deepgram language codes
        const languageMap: { [key: string]: string } = {
            'English': 'en',
            'Hindi': 'hi',
            'Spanish': 'es',
            'French': 'fr',
            'German': 'de'
        }

        const transcriptionLanguage = languageMap[language || 'English'] || 'en'

        console.log('VAPI Configuration:', {
            language,
            transcriptionLanguage,
            voiceId
        })

        try {
            // For Hindi, we need ElevenLabs multilingual model
            const elevenLabsModel = language && language !== 'English' ? 'eleven_multilingual_v2' : undefined

            // Default functions
            const defaultFunctions = [
                {
                    name: 'submitFeedback',
                    description: 'Submit the final interview feedback and score. Call this AFTER verbally giving feedback to the candidate.',
                    parameters: {
                        type: 'object',
                        properties: {
                            score: {
                                type: 'number',
                                description: 'Score from 0-10'
                            },
                            areasGoodIn: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of 2-3 things the candidate did well'
                            },
                            areasToWorkOn: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of 2 areas for improvement'
                            }
                        },
                        required: ['score', 'areasGoodIn', 'areasToWorkOn']
                    }
                }
            ]

            // Merge additional functions
            const functions = [...defaultFunctions, ...(additionalFunctions || [])]

            await this.vapi.start({
                model: {
                    provider: 'openai',
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        }
                    ],
                    // Add function calling
                    functions: functions
                } as any, // Bypass TypeScript for function calling
                voice: {
                    provider: '11labs',
                    voiceId: voiceId || '21m00Tcm4TlvDq8ikWAM',
                    ...(elevenLabsModel && { model: elevenLabsModel }) // Add model only for non-English
                },
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-3', // Latest model for better accuracy
                    language: transcriptionLanguage as any
                }
            })

            this.isCallActive = true

            // Listen to ALL messages with debugging
            this.vapi.on('message', (message: any) => {
                // Log only non-transcript messages to avoid clutter, or log everything if needed
                if (message.type !== 'transcript') {
                    console.log('📨 VAPI Message:', message.type, message)
                }

                // Forward all messages to custom handler
                if (onMessage) {
                    onMessage(message)
                }
            })

            // Listen to call end
            this.vapi.on('call-end', () => {
                this.isCallActive = false
            })

            console.log('✅ VAPI Call started successfully')
            return { success: true }
        } catch (error: any) {
            console.error('❌ VAPI Call failed:', error)
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                response: error?.response,
                data: error?.response?.data
            })
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
    }

    isMuted() {
        return this.vapi?.isMuted() || false
    }

    // Get call status
    isActive() {
        return this.isCallActive
    }

    // Set event listeners
    on(event: string, callback: (data: any) => void) {
        if (!this.vapi) return
        this.vapi.on(event as any, callback)
    }

    // Remove event listeners
    off(event: string, callback: (data: any) => void) {
        if (!this.vapi) return
        this.vapi.off(event as any, callback)
    }

    // Send tool result back to VAPI
    sendToolResult(toolCallId: string, result: any) {
        if (!this.vapi) {
            console.error('VAPI not initialized')
            return
        }

        try {
            // VAPI Web SDK: inject the function result as a system message
            // Client-side VAPI doesn't support direct function-call responses
            // We need to add it as a message that the AI can see
            console.log('📤 Injecting tool result into conversation:', { toolCallId, result })

            // Parse the result if it's a JSON string
            let resultData = result
            try {
                resultData = typeof result === 'string' ? JSON.parse(result) : result
            } catch (e) {
                // If not JSON, use as-is
            }

            // Inject as a system message containing the function result
            this.vapi.send({
                type: 'add-message',
                message: {
                    role: 'system',
                    content: `Function call result for ${toolCallId}:\n${resultData.message || JSON.stringify(resultData)}`
                }
            })

            console.log('✅ Tool result injected successfully')
        } catch (error) {
            console.error('Error sending tool result:', error)
        }
    }
}

export const vapiService = new VapiService()

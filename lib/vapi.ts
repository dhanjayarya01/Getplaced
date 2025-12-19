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
    async startCall(systemPrompt: string, voiceId?: string, language?: string, onMessage?: (message: any) => void) {
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
                    functions: [
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
                console.log('📨 VAPI Message:', message.type || 'unknown', message)

                if (onMessage) {
                    onMessage(message)
                }
            })

            // Listen to call end
            this.vapi.on('call-end', () => {
                this.isCallActive = false
            })

            return { success: true }
        } catch (error: any) {
            console.error('VAPI start call error:', error)
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                response: error?.response,
                data: error?.response?.data
            })
            throw new Error(`VAPI Error: ${error?.message || 'Unknown error'}`)
        }
    }

    // End call
    async endCall() {
        if (!this.vapi || !this.isCallActive) return

        try {
            await this.vapi.stop()
            this.isCallActive = false
        } catch (error) {
            console.error('VAPI end call error:', error)
            throw error
        }
    }

    // Toggle mute
    toggleMute() {
        if (!this.vapi) return

        const isMuted = this.vapi.isMuted()
        this.vapi.setMuted(!isMuted)
        return !isMuted
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
}

export const vapiService = new VapiService()

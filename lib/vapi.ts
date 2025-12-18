// VAPI Service for voice interviews
import Vapi from '@vapi-ai/web'

class VapiService {
    private vapi: Vapi | null = null
    private isCallActive = false

    constructor() {
        this.vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '')
    }

    // Start call with system prompt
    async startCall(systemPrompt: string, onMessage?: (message: any) => void) {
        if (!this.vapi) throw new Error('VAPI not initialized')

        try {
            await this.vapi.start({
                model: {
                    provider: 'openai',
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        }
                    ]
                },
                voice: {
                    provider: '11labs',
                    voiceId: 'paula' // Professional female voice
                }
            })

            this.isCallActive = true

            // Listen to messages
            if (onMessage) {
                this.vapi.on('message', onMessage)
            }

            // Listen to call end
            this.vapi.on('call-end', () => {
                this.isCallActive = false
            })

            return { success: true }
        } catch (error) {
            console.error('VAPI start call error:', error)
            throw error
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

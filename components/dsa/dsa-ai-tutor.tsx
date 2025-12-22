"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Mic, MicOff, X, User, Minimize2 } from 'lucide-react'
import { useVapi } from "@/components/interviews/vapi-provider"
import { Input } from "@/components/ui/input"

interface DSAAiTutorProps {
  problem: any
  code: string
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'c'
  onClose: () => void
  onCodeChange: (newCode: string) => void
}

export function DSAAiTutor({ problem, code, language, onClose, onCodeChange }: DSAAiTutorProps) {
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute } = useVapi()
  const [isStarting, setIsStarting] = useState(false)
  const [voiceLanguage, setVoiceLanguage] = useState<'English' | 'Hindi'>('English')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript])

  const handleStartSession = async () => {
    setIsStarting(true)
    const systemPrompt = `You are Tanya, a friendly and expert DSA coding tutor.

CURRENT PROBLEM:
"${problem.title}" - ${problem.difficulty} Level
Language: ${language.toUpperCase()}

YOUR GREETING (FIRST MESSAGE):
Start EVERY new session with:
"Hi! I'm Tanya, your coding tutor. ${voiceLanguage === 'Hindi' ? 'Main aapki madad karne ke liye yahan hoon' : 'I\'m here to help you'}. ${voiceLanguage === 'Hindi' ? 'Kya aapko problem samajh mein aa gaya, ya main pehle explain karun?' : 'Do you understand the problem, or would you like me to explain it first?'}"

YOUR TOOLS:
1. readCode - See what user has written in editor
2. writeCode - Write code directly into their editor

CRITICAL RULES - FOLLOW STRICTLY:

RULE 1: ALWAYS CALL readCode FIRST
- Before giving ANY feedback, hints, or solutions, you MUST call readCode
- Even if user says "help me", first call readCode to see what they have
- Do NOT ask them to describe their code - just call readCode and see it yourself

RULE 2: ALWAYS START WITH PATTERN
- When explaining approach or solution, ALWAYS begin with: "This is a [PATTERN NAME] problem"
- Examples: "Two Pointer", "Sliding Window", "Dynamic Programming", "Binary Search", "BFS/DFS"
- Explain WHY this pattern applies to this problem
- Then discuss data structures needed for this pattern

RULE 3: STEP-BY-STEP TEACHING
After calling readCode and identifying pattern:

A) IF SMALL MISTAKE (syntax, minor logic error):
   - Call writeCode with corrected version
   - Explain: "I fixed [specific issue]. ${voiceLanguage === 'Hindi' ? 'Yeh galti thi, ab theek hai' : 'Here is what I changed'}"

B) IF WRONG APPROACH OR NO CODE:
   MANDATORY ORDER:
   1. PATTERN: "${voiceLanguage === 'Hindi' ? 'Yeh ek [Pattern Name] problem hai' : 'This is a [Pattern Name] problem'}"
   2. WHY: "${voiceLanguage === 'Hindi' ? 'Kyunki yahaan humein [input] se [goal] chaiye' : 'Because we need to [goal] from [input]'}"
   3. DATA STRUCTURE: "${voiceLanguage === 'Hindi' ? 'Is pattern ke liye hum [DS] use karte hain kyunki [reason]' : 'For this pattern we use [DS] because [reason]'}"
   4. APPROACH: "${voiceLanguage === 'Hindi' ? 'Socho aise: [step-by-step]' : 'Think about it like this: [step-by-step]'}"
   5. THEN call writeCode with solution
   6. WALKTHROUGH: Explain line by line with example flow

LANGUAGE STYLE:
- English: Friendly, conversational, use "you", "let's", "we"
- Hindi (Hinglish): Mix Hindi and English naturally, use Roman script, conversational like speaking to a friend
  ${voiceLanguage === 'Hindi' ? `Examples:
  - "Dekho yeh ek Two Pointer pattern hai"
  - "Samjhe? Humein do pointers chahiye - ek start pe, ek end pe"
  - "Pehle HashMap banao, phir loop chalao"
  - "Agar confusion hai toh batao, main code likh deti hoon"
  - Use: "samajh", "dekho", "chaliye", "karte hain", "milega", "hoga", "theek hai", "koi baat nahi"
  - Mix freely: "Array ko traverse karte hue", "Time complexity O(n) hogi", "Edge case handle karna padega"
  ` : ''}

EXAMPLE CONVERSATION (Hindi):
User: "Mujhe samajh nahi aa raha"
You: "Koi baat nahi! Pehle main aapka code dekhti hoon."
[Calls readCode]
You: "Theek hai, maine dekha. Yeh ek TWO POINTER pattern ka problem hai. Kyunki humein array mein do numbers dhundne hain jo target sum dete hain. Is pattern ke liye hum HashMap use karte hain kyunki O(1) mein lookup milta hai. Socho aise: jab hum har number dekhte hain, toh check karte hain ki (target - current number) pehle dekha hai kya? Agar haan, toh pair mil gaya! Samjhe? Ab main code likhti hoon."
[Calls writeCode]
You: "Maine code likh diya. Dekhiye kaise kaam karta hai:
- Pehle ek HashMap banaya stored numbers ke liye
- Loop mein har number ke liye check kiya: kya (target - num) map mein hai?
- Agar hai toh indices return kar diye
- Example: [7, 11, 2, 15] aur target 9
  - 7 dekha, map mein dala
  - 11 dekha, map mein dala
  - 2 dekha, check kiya: kya (9-2=7) map mein hai? HAAN! Return [0, 2]
Samajh mein aaya?"

REMEMBER:
1. ALWAYS call readCode before feedback
2. ALWAYS start with PATTERN name and explanation  
3. Use more Hindi words in Hindi mode (less English mixing)
4. Explain WHY pattern applies, not just WHAT to do`

    const additionalFunctions = [
        {
            name: "readCode",
            description: `MANDATORY FUNCTION - CALL THIS FIRST! Before ANY feedback, hints, or solutions, you MUST call this to read the user's code from the editor. This returns their current ${language} code. Never ask user what their code is - ALWAYS call this function to see it yourself. Call this immediately when conversation starts or when user asks for help.`,
            parameters: { 
                type: "object", 
                properties: {},
                required: []
            }
        },
        {
            name: "writeCode",
            description: `Use this to write code directly into the user's editor. When providing a solution, use this function to insert complete ${language} code automatically.`,
            parameters: {
                type: "object",
                properties: {
                    code: {
                        type: "string",
                        description: `The complete ${language} code to write into the editor`
                    }
                },
                required: ["code"]
            }
        }
    ]

        const handleFunctionCall = async (name: string, args: any) => {
            console.log('🔧 DSA AI Tutor - Function called:', name, args)
            
            if (name === 'readCode') {
                console.log("👀 AI Tutor reading code...")
                const codePreview = code.trim() || "// No code written yet"
                const result = JSON.stringify({
                    language: language,
                    code: codePreview,
                    lineCount: code.split('\n').length,
                    isEmpty: !code.trim(),
                    message: code.trim() 
                        ? `User's current ${language} code (${code.split('\n').length} lines):\n\n${codePreview}` 
                        : `User hasn't written any code yet.`
                })
                console.log('✅ Returning code to AI:', result)
                return result
            }
            
            if (name === 'writeCode') {
                console.log("✍️ AI Tutor writing code to editor...")
                const newCode = args.code || args.codeContent || ""
                if (newCode) {
                    // Update the code in the editor
                    onCodeChange(newCode)
                    console.log('✅ Code written to editor successfully')
                    return JSON.stringify({
                        success: true,
                        message: `Successfully wrote ${newCode.split('\n').length} lines of ${language} code to your editor.`
                    })
                } else {
                    console.error('❌ No code provided to write')
                    return JSON.stringify({
                        success: false,
                        message: "No code was provided to write."
                    })
                }
            }
        }

    try {
      // startCall expects: (systemPrompt, voiceId?, language?, onFunctionCall?, additionalFunctions?)
      const voiceId = 'EXAVITQu4vr4xnSDxMaL' // Bella - Sweet voice
      // Pass full language name, not code - VAPI service maps it internally
      const languageName = voiceLanguage // 'Hindi' or 'English'
      
      await startCall(
        systemPrompt,
        voiceId,
        languageName,
        handleFunctionCall,
        additionalFunctions
      )
    } catch (error) {
      console.error('Failed to start AI Tutor', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndSession = async () => {
    if (isCallActive) {
      endCall()
    }
  }

  const handleClose = async () => {
    if (isCallActive) {
      await endCall()
    }
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="w-5 h-5 text-primary" />
            AI Tutor
          </div>
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-md font-medium">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="h-8 w-8"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="h-8 w-8"
            title="Close & End Session"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content - Hidden when minimized */}
      {!isMinimized && (
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {!isCallActive ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-full">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">AI Coding Tutor</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Get personalized guidance as you solve "{problem.title}". I can read your code, provide hints, write solutions, and explain step-by-step!
              </p>
            </div>

            {/* Language Selection */}
            <div className="flex flex-col items-center gap-3 pt-4">
              <p className="text-xs text-muted-foreground">Select your preferred language:</p>
              <div className="flex gap-2">
                <Button
                  variant={voiceLanguage === 'English' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVoiceLanguage('English')}
                  disabled={isCallActive}
                >
                  English
                </Button>
                <Button
                  variant={voiceLanguage === 'Hindi' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVoiceLanguage('Hindi')}
                  disabled={isCallActive}
                >
                  Hindi (Hinglish)
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleStartSession} 
              disabled={isStarting || isCallActive}
              size="lg"
              className="mt-4"
            >
              {isStarting ? 'Starting...' : 'Start AI Tutor Session'}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Conversation View */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {transcript.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Voice conversation will appear here...
                  </div>
                ) : (
                  <>
                    {transcript.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          entry.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-full ${ entry.role === 'user' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                        }`}>
                          {entry.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className={`flex-1 p-3 rounded-lg ${
                            entry.role === 'user'
                              ? 'bg-blue-500/10 text-right'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{entry.content}</p>
                        </div>
                      </div>
                    ))}
                    {/* Invisible element for auto-scroll */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Controls */}
            <div className="border-t border-border p-4 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className="shrink-0"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSession}
                  className="w-full"
                >
                  End Session
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

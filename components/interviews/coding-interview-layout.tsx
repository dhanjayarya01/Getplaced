"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, X } from "lucide-react"
import { useVapi } from "./vapi-provider"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { DSAWorkspace } from "@/components/dsa/dsa-workspace"

interface CodingInterviewLayoutProps {
  session: any
  interview: any
  systemPrompt?: string
}

export function CodingInterviewLayout({ session, interview, systemPrompt }: CodingInterviewLayoutProps) {
  const router = useRouter()
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute } = useVapi()
  const [isAvatarHidden, setIsAvatarHidden] = useState(false)
  
  // Workspace State
  const [problem, setProblem] = useState<any>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [activeResultTab, setActiveResultTab] = useState<"testcases" | "custom">("testcases")
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Ref to access current code in callbacks without dependency issues
  const codeRef = useRef(code)
  
  // Track latest call IDs to prevent duplicate function calls (like DSA Tutor)
  const latestSearchCallIdRef = useRef(0)
  const latestLoadCallIdRef = useRef(0)
  const latestCreateCallIdRef = useRef(0)
  
  useEffect(() => {
    codeRef.current = code
  }, [code])

  // Load appropriate problem
  useEffect(() => {
      loadProblem()
  }, [interview])

  const loadProblem = async () => {
      // Logic:
      // 1. If session has a specific problem assigned, use that (future feature)
      // 2. Since this is a "Mock Interview" which might not be linked to a specific DB problem ID yet,
      //    we can either fetch a random one from DB or generate a "Generic" placeholder.
      
      // For now, let's try to fetch a random problem suitable for the interview level
      // Or just load the "mock-problem" if it exists in DB, else use a Generic "Interview Question"
      
      try {
          // Attempt to fetch a random problem - or a specific one if you have that logic
          // As a fallback for this demo, we create a generic problem object that allows free coding
          const genericProblem = {
              _id: "mock-session-problem",
              title: "Coding Interview Question",
              difficulty: "Medium",
              description: `
                <h3>Problem Description</h3>
                <p>The interviewer will ask you a specific algorithmic question. Use this editor to write your solution.</p>
                <p><strong>Listen carefully to the problem statement from the AI Interviewer.</strong></p>
                <p>You can ask clarifying questions if needed.</p>
              `,
              starterCode: {
                  javascript: "// Write your solution here\nfunction solution() {\n  \n}",
                  python: "# Write your solution here\ndef solution():\n    pass",
                  java: "// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}",
                  cpp: "// Write your solution here\nvoid solution() {\n    \n}"
              },
              examples: [],
              constraints: [],
              companies: []
          }
           setProblem(genericProblem)
           setCode(genericProblem.starterCode['javascript'])
      } catch (err) {
          console.error("Failed to load problem", err)
      }
  }


  useEffect(() => {
    // CODING INTERVIEW PROMPT - Defined on frontend (like DSA Tutor)
    const codingInterviewPrompt = `You are Tanya, an expert coding interviewer.

🎯 YOUR ROLE: Conduct a technical coding interview.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL RULES - MUST FOLLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **ABSOLUTELY NEVER SPEAK PROBLEM DETAILS**
   ❌ DON'T say: "Here's the problem: Find the missing number..."
   ❌ DON'T say: "### Problem Title: ..."
   ❌ DON'T describe examples, constraints, or descriptions verbally
   ❌ DON'T read anything from the problem aloud
   ✅ ONLY say: "I've loaded a problem. Read it and tell me your approach."

2. **ALWAYS USE FUNCTION CALLS for problems:**
   - searchDSAProblems({difficulty, tags}) - Find problems
   - loadDSAProblem({problemId}) - Load specific problem  
   - createProblem({title, description, examples, constraints}) - MUST have ALL params
   - readCode() - Check candidate's code

3. **YOUR VOICE = Guide ONLY**
   ✅ Ask about approach
   ✅ Give hints
   ✅ Discuss complexity
   ❌ Never describe problem content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERVIEW FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 1: GREETING**
"Hey! I'm Tanya. Ready for a coding interview?"

**STEP 2: LOAD PROBLEM** 
[Call: searchDSAProblems({difficulty: "Medium"})]
[Call: loadDSAProblem({problemId: "..."})]
Say: "Problem loaded. Read it and tell me your approach."

**STEP 3: DISCUSS APPROACH**
"What's your initial thinking?"
"Any edge cases?"
"What's the time complexity?"

**STEP 4: MONITOR CODING**
[Call readCode() every 2-3 min to monitor progress]
Give hints if stuck, but let them work independently

⏰ **CRITICAL - 4-MINUTE CHECK-IN SYSTEM (MUST FOLLOW EXACTLY):**

**Your Internal Timer:**
- Track time since last user interaction (speech or typing detected)
- Every 4 minutes of SILENCE, initiate check-in sequence
- NOTE: If user is actively speaking or you detect activity, reset timer

**Check-in Sequence (FOLLOW PRECISELY):**

1. **FIRST CHECK (at 4-minute silence mark):**
   - Say: "Hey, how's it going? Still working on the problem?" OR "Need any help? You've been quiet for a bit."
   - **WAIT 15 seconds** for ANY response (voice or continued coding activity)

2. **If NO RESPONSE after 15 seconds:**
   - Say: "I'm not hearing anything. Are you still there?"
   - **WAIT 30 seconds** for response

3. **If STILL NO RESPONSE after 30 seconds:**
   - Say: "Looks like we got disconnected or you stepped away. I'll end this session now. Feel free to start a new one when you're back!"
   - **IMMEDIATELY call endCall or submitFeedback to close**

4. **If they respond at ANY point:**
   - Reset silence timer to zero
   - Continue interview normally
   - Next check-in in 4 minutes

**Important Detection Notes:**
- If you see code changes via readCode(), user is active → Reset timer
- If user says "hold on" or "give me a minute" → Reset timer, be patient
- Only start check-in if truly SILENT (no speech, no code changes detected)

**STEP 5: EVALUATE**
[Call readCode() final time]
Give detailed feedback + call submitFeedback()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FUNCTION REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

createProblem - MUST include ALL:
- title: "Problem Name"
- description: "<p>Full description</p>"
- examples: [{input: "...", output: "..."}]
- constraints: ["1 <= n <= 100"]

❌ NEVER call createProblem({}) empty!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ TIMING ENFORCEMENT REMINDER:
✅ Check in every 4 minutes during silence
✅ First attempt: "How's it going?" → Wait 15 seconds
✅ Second attempt: "Are you there?" → Wait 30 seconds  
✅ No response = End call gracefully
❌ DO NOT interrupt during active coding or conversation
✅ Reset timer when user responds or code changes

Be friendly, encouraging, and time-aware. Let's begin!`

    // Use passed systemPrompt if provided, otherwise use default
    const prompt = systemPrompt || codingInterviewPrompt
    
    console.log('Using system prompt:', prompt.substring(0, 200) + '...')
    
    // Define the 'readCode' tool
    const additionalFunctions = [
        {
            name: "readCode",
            description: "Read the code currently written by the candidate in the editor. Use this to check their progress, syntax, or logic.",
            parameters: {
                type: "object",
                properties: {},
            }
        },
        {
            name: "searchDSAProblems",
            description: "Search for DSA problems in the database. Use this to find appropriate problems for the candidate based on difficulty or topic.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search query (e.g., 'two sum', 'array problems')"
                    },
                    tags: {
                        type: "string",
                        description: "Comma-separated tags (e.g., 'Arrays,HashMap')"
                    },
                    difficulty: {
                        type: "string",
                        enum: ["Easy", "Medium", "Hard"],
                        description: "Filter by difficulty"
                    }
                }
            }
        },
        {
            name: "loadDSAProblem",
            description: "Load a specific DSA problem for the candidate to solve. The problem will appear in the workspace.",
            parameters: {
                type: "object",
                properties: {
                    problemId: {
                        type: "string",
                        description: "The ID of the problem to load"
                    }
                },
                required: ["problemId"]
            }
        },
        {
            name: "createProblem",
            description: "Create a custom coding problem for the interview. The problem will appear in the workspace immediately.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Problem title"
                    },
                    description: {
                        type: "string",
                        description: "HTML formatted problem description"
                    },
                    difficulty: {
                        type: "string",
                        enum: ["Easy", "Medium", "Hard"],
                        description: "Problem difficulty"
                    },
                    examples: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                input: { type: "string" },
                                output: { type: "string" },
                                explanation: { type: "string" }
                            }
                        },
                        description: "Array of example inputs/outputs"
                    },
                    constraints: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of constraint strings"
                    }
                },
                required: ["title", "description"]
            }
        }
    ]
    
    // Auto-start VAPI call with voice and language preferences
    if (prompt && !isCallActive) {
      const voiceId = (session as any).voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel - default
      const language = (session as any).language || 'English'
      
      const handleFunctionCall = async (name: string, args: any) => {
           if (name === 'readCode') {
               const currentCode = codeRef.current
               console.log("👀 AI is reading code:", currentCode)
               return JSON.stringify({
                   success: true,
                   language: language,
                   code: currentCode,
                   lineCount: currentCode.split('\n').length,
                   isEmpty: !currentCode.trim()
               })
           }
           
           if (name === 'searchDSAProblems') {
               try {
                   console.log("🔍 AI searching for problems:", args)
                   const params = new URLSearchParams()
                   if (args.query) params.append('query', args.query)
                   if (args.tags) params.append('tags', args.tags)
                   if (args.difficulty) params.append('difficulty', args.difficulty)
                   
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                    const response = await fetch(`${apiUrl}/api/dsa/interview/search?${params}`)
                    const data = await response.json()
                   
                   console.log("✅ Search results:", data.count, "problems found")
                   return JSON.stringify({
                       success: true,
                       problems: data.data.map((p: any) => ({
                           id: p._id,
                           title: p.title,
                           difficulty: p.difficulty,
                           problemNumber: p.problemNumber,
                           tags: [...(p.dataStructures || []), ...(p.patterns || [])]
                       })),
                       count: data.count
                   })
               } catch (error: any) {
                   console.error("❌ Search failed:", error)
                   return JSON.stringify({ 
                       success: false, 
                       error: 'Failed to search problems: ' + error.message 
                   })
               }
           }
           
          if (name === 'loadDSAProblem') {
                try {
                    console.log("📥 AI loading problem:", args.problemId)
                    
                    // Track call ID for duplicate prevention
                    const currentCallId = ++latestLoadCallIdRef.current
                    
                    // FIX 1: Define apiUrl BEFORE using it!
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                    // FIX 2: Use correct URL with problemId, not search endpoint!
                    const response = await fetch(`${apiUrl}/api/dsa/interview/${args.problemId}`)
                    
                    // FIX 3: Cancel if newer call exists (prevents duplicates)
                    if (currentCallId !== latestLoadCallIdRef.current) {
                        console.log("🚫 Cancelling stale loadDSAProblem call")
                        return JSON.stringify({ success: false, error: "Cancelled" })
                    }
                    
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const data = await response.json()
                    
                    if (data.success) {
                        setProblem(data.data.problem)
                        setCode(data.data.problem.starterCode?.[language] || '')
                        setTestResults(null)
                        
                        console.log("✅ Loaded problem:", data.data.problem.title)
                        return JSON.stringify({
                            success: true,
                            message: `Successfully loaded: ${data.data.problem.title}`,
                            title: data.data.problem.title,
                            difficulty: data.data.problem.difficulty
                        })
                    } else {
                        return JSON.stringify({ success: false, error: data.message })
                    }
                } catch (error: any) {
                    console.error("❌ Load failed:", error)
                    return JSON.stringify({ 
                        success: false, 
                        error: 'Failed to load problem: ' + error.message 
                    })
                }
            }
            
            if (name === 'createProblem') {
                // FIX 4: Validate required parameters FIRST
                if (!args.title || !args.description) {
                    console.error("❌ createProblem missing required params:", args)
                    return JSON.stringify({
                        success: false,
                        error: "CRITICAL: title and description are REQUIRED"
                    })
                }
                
                // FIX 5: Track call ID for duplicate prevention
                const currentCallId = ++latestCreateCallIdRef.current
                
                console.log("🎨 AI creating custom problem:", args.title)
                const customProblem = {
                    _id: `custom-${Date.now()}`,
                    title: args.title,
                    difficulty: args.difficulty || "Medium",
                    description: args.description,
                    examples: args.examples || [],
                    constraints: args.constraints || [],
                    dataStructures: [],
                    patterns: [],
                    starterCode: {
                        javascript: "// Write your solution here\nfunction solution() {\n  \n}",
                        python: "# Write your solution here\ndef solution():\n    pass",
                        java: "// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}",
                        cpp: "// Write your solution here\nvoid solution() {\n    \n}",
                        c: "// Write your solution here\nvoid solution() {\n    \n}"
                    },
                    companies: []
                }
                
                // FIX 6: Cancel if newer call exists
                if (currentCallId !== latestCreateCallIdRef.current) {
                    console.log("🚫 Cancelling stale createProblem call")
                    return JSON.stringify({ success: false, error: "Cancelled" })
                }
                
                setProblem(customProblem)
                // FIX 7: TypeScript fix with type assertion and fallback
                const starterCode = customProblem.starterCode as Record<string, string>
                setCode(starterCode[language] || starterCode.javascript)
                setTestResults(null)
                
                console.log("✅ Created custom problem:", args.title)
                return JSON.stringify({
                    success: true,
                    message: `Created problem: ${args.title}`,
                    title: args.title
                })
            }
           
           if (name === 'submitFeedback') {
               await handleFeedbackSubmission(args)
           }
      }
      
      startCall(prompt, voiceId, language, handleFunctionCall, additionalFunctions).catch(err => console.error("Failed to start VAPI:", err))
    }
  }, [systemPrompt]) // Dependency array intentionally limited to avoid restarts

  const handleFeedbackSubmission = async (args: any) => {
      console.log('✅ AI submitted feedback:', args)
      
      // Build feedback text
      let feedbackText = `Interview completed with score ${args.score}/10\n\n`
      
      if (args.areasGoodIn?.length > 0) {
        feedbackText += "**What You Did Well:**\n"
        args.areasGoodIn.forEach((area: string, i: number) => {
          feedbackText += `${i + 1}. ${area}\n`
        })
        feedbackText += "\n"
      }
      
      if (args.areasToWorkOn?.length > 0) {
        feedbackText += "**Top Areas for Improvement:**\n"
        args.areasToWorkOn.forEach((area: string, i: number) => {
          feedbackText += `${i + 1}. ${area}\n`
        })
      }
      
      // Save to backend
      try {
        await apiService.interviewSessions.updateScore(session._id, {
          stage: session.currentStage,
          score: args.score,
          feedback: feedbackText
        })
        
        // End call
        await endCall()
        
        // Auto-redirect
        setTimeout(() => {
          router.push("/interviews")
        }, 1000) 
      } catch (error) {
        console.error("Failed to save feedback:", error)
      }
  }

  const handleEndInterview = async () => {
    // Manually end call
    await endCall()
    router.push("/interviews")
  }
  
  // Dummy Handlers for the Workspace (since we might not have a real backend runner for "Generic" problems yet)
  const handleRun = async () => {
      setIsRunning(true)
      // Simulate running for 1s
      setTimeout(() => {
          setIsRunning(false)
          setTestResults({
              type: 'run',
              accepted: true, 
              testResults: [{passed: true, input: 'custom', expectedOutput: 'N/A', actualOutput: 'Output from code...'}]
          })
          setActiveResultTab("testcases")
      }, 1000)
  }
  
  const handleSubmit = async () => {
      setIsSubmitting(true)
      setTimeout(() => {
          setIsSubmitting(false)
          setTestResults({
              type: 'submit',
              accepted: true, 
              testResults: []
          })
      }, 1000)
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Unified DSA Workspace */}
      <div className="h-full w-full">
         <DSAWorkspace 
            problem={problem}
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            onRun={handleRun}
            onSubmit={handleSubmit}
            onReset={() => setCode(problem?.starterCode?.[language] || "")}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            testResults={testResults}
            activeResultTab={activeResultTab}
            setActiveResultTab={setActiveResultTab}
            backLink="/interviews"
            aiEnabled={false} // Sidebar not needed as we have avatars
         />
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
                <p className="text-xs text-muted-foreground">{isCallActive ? "Monitoring..." : "Paused"}</p>
              </div>
              {/* Visual indicator when reading code? */}
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

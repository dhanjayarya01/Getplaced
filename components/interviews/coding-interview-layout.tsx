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
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute, hasSpoken } = useVapi()
  const [isAvatarHidden, setIsAvatarHidden] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript])
  
  // Workspace State
  const [problem, setProblem] = useState<any>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [activeResultTab, setActiveResultTab] = useState<"testcases" | "custom">("testcases")
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const codeRef = useRef(code)
  const languageRef = useRef(language)  // always holds live language — avoids stale closure in readCode
  
  // Track latest call IDs to prevent duplicate function calls
  const latestLoadCallIdRef = useRef(0)
  const latestCreateCallIdRef = useRef(0)
  
  // Track problem loading state for UI feedback
  const [isLoadingProblem, setIsLoadingProblem] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)

  // Keep refs in sync with state
  useEffect(() => {
    codeRef.current = code
  }, [code])

  useEffect(() => {
    languageRef.current = language
  }, [language])

  // ── Auto-inject code into VAPI context on every change (debounced) ──
  // Instead of readCode() function (which VAPI routes to server webhook),
  // we push the code directly into VAPI's conversation as a system message.
  // The AI sees it immediately in its context with no function call needed.
  const codeInjectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!isCallActive) return   // only inject during active call
    if (codeInjectTimerRef.current) clearTimeout(codeInjectTimerRef.current)
    codeInjectTimerRef.current = setTimeout(() => {
      try {
        const currentCode = codeRef.current
        const currentLang = languageRef.current
        const snippet = currentCode.trim()
          ? `\n\n[CANDIDATE CODE UPDATE — ${currentLang}]\n\`\`\`${currentLang}\n${currentCode}\n\`\`\`\nThis is the candidate's current code. Use this for evaluation when asked.`
          : `\n\n[CANDIDATE CODE UPDATE]\nThe editor is currently empty — the candidate hasn't written code yet.`
        vapiService.injectSystemMessage(snippet)
        console.log('💉 Code auto-injected into VAPI context')
      } catch (e) {
        // Silently ignore injection errors — not critical
      }
    }, 2000)   // 2-second debounce — only inject after typing pauses
  }, [code, isCallActive])

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
    // CODING INTERVIEW PROMPT - fallback if backend doesn't provide one
    const codingInterviewPrompt = `You are Tanya, an expert coding interviewer.

🚨 ABSOLUTE RULES:
1. The problem is ALREADY loaded on the candidate's screen before this call started.
2. Do NOT call searchDSAProblems or loadDSAProblem — they are disabled.
3. ALWAYS call readCode() before giving any code feedback — never assume what they wrote.
4. Call submitFeedback() ONLY when the candidate explicitly says they are done AND you have finished giving verbal feedback. NEVER call it due to silence.
5. NEVER end the session just because there is silence — silence means the candidate is coding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: GREETING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Say: "Hey! Great to have you here — I'm Tanya, your coding interviewer today. I've already loaded a question on your screen — are you ready to dive in?"
Wait silently for confirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: EXPLAIN THE PROBLEM (when user says ready)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Say: "Perfect! So the problem on your screen is called [PROBLEM_TITLE_PLACEHOLDER].
Here's a quick summary: [PROBLEM_DESC_PLACEHOLDER].
[PROBLEM_EXAMPLE_PLACEHOLDER]
Take a moment to read it on screen. Walk me through your approach first, or jump straight into coding. Let me know when you're done!"

Then WAIT silently. Let them code. DO NOT speak unless spoken to during coding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: DURING CODING (SILENCE IS NORMAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Silence = candidate is coding. DO NOT interrupt.
Only check in after 5+ minutes of silence: "Hey, how's it going?"
NEVER call submitFeedback during coding. NEVER end the session automatically.

If candidate says "review my code" or "check my code" or "see my code":
→ Call readCode() to get their actual code
→ Give verbal feedback on what you see
→ Continue the session — do NOT call submitFeedback unless they say they're done

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: EVALUATE (when candidate says done)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Say: "Awesome! Let me take a look at your code."
Call readCode() — read what they actually wrote.
Give score/10, 2 strengths, 2 areas to improve verbally.
THEN call submitFeedback({ score, areasGoodIn, areasToWorkOn }).`

    // Use passed systemPrompt if provided, otherwise use default
    const basePrompt = systemPrompt || codingInterviewPrompt
    
    // ── spoken language & voice ─────────────────────────────────────────
    const spokenLanguage = (session as any).language || 'English'
    const voiceId = (session as any).voiceId || '21m00Tcm4TlvDq8ikWAM'

    // ── Only run once, when prompt is available and call isn't active ───
    if (basePrompt && !isCallActive) {

      // ─────────────────────────────────────────────────────────────────
      // STEP A: Pre-load a real problem from DB BEFORE starting VAPI.
      // This runs once and fully resolves before the call starts.
      // The problem is injected into the system prompt so the AI knows
      // it from the start — zero function calls needed for loading.
      // ─────────────────────────────────────────────────────────────────
      const preLoadAndStart = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

        // ── Derive difficulty from stage number ────────────────────────
        // Stage 1-2 → Easy, Stage 3-4 → Medium, Stage 5+ → Hard
        const stageNum = Number((session as any)?.currentStage) || 1
        const difficulty = stageNum <= 2 ? 'Easy' : stageNum <= 4 ? 'Medium' : 'Hard'
        console.log(`🎯 Stage ${stageNum} → difficulty: ${difficulty}`)

        let loadedProblem: any = null
        setIsLoadingProblem(true)

        // Helper: fetch full problem by ID
        const fetchFull = async (id: string) => {
          try {
            const r = await fetch(`${apiUrl}/api/dsa/interview/${encodeURIComponent(id)}`)
            if (!r.ok) return null
            const d = await r.json()
            return (d.success && d.data?.problem) ? d.data.problem : null
          } catch { return null }
        }

        // Helper: shuffle array randomly
        const shuffle = (arr: any[]) => arr
          .map(item => ({ item, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ item }) => item)

        // Try searches in order: exact difficulty → fallbacks
        const queries = [
          `difficulty=${encodeURIComponent(difficulty)}`,
          difficulty !== 'Easy' ? `difficulty=Easy` : `difficulty=Medium`,
          `difficulty=Hard`,
          `` // no filter — get anything
        ]

        for (const q of queries) {
          if (loadedProblem) break
          try {
            const r = await fetch(`${apiUrl}/api/dsa/interview/search${q ? '?' + q : ''}`)
            if (!r.ok) continue
            const d = await r.json()
            const list: any[] = Array.isArray(d.data) ? d.data : []
            if (list.length === 0) continue

            // ── RANDOM shuffle before picking — no more always-same problem
            const randomized = shuffle(list)
            for (const c of randomized.slice(0, 5)) {
              const full = await fetchFull(String(c._id))
              if (full) { loadedProblem = full; break }
            }
          } catch { /* try next query */ }
        }


        // Fallback: Two Sum
        if (!loadedProblem) {
          loadedProblem = {
            _id: `fallback-${Date.now()}`,
            title: 'Two Sum',
            difficulty,
            description: '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers that add up to target</em>. Each input has exactly one solution.</p>',
            examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }],
            constraints: ['2 <= nums.length <= 10^4', 'Only one valid answer exists'],
            starterCode: {
              javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  \n}',
              python: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    pass',
              java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
              cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    \n}',
              c: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}'
            },
            companies: []
          }
        }

        // ── Set problem in UI immediately ───────────────────────────────
        setProblem(loadedProblem)
        const sc: Record<string, string> = loadedProblem.starterCode || {}
        setCode(sc[language] || sc['javascript'] || '')
        setTestResults(null)
        setIsLoadingProblem(false)

        console.log('✅ Problem pre-loaded:', loadedProblem.title)

        // ── Build full plain-text problem context for the AI ──────────
        const plainDesc = String(loadedProblem.description || '')
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)
        const examplesText = (Array.isArray(loadedProblem.examples) ? loadedProblem.examples : [])
          .slice(0, 2)
          .map((ex: any, i: number) => `  Example ${i + 1}: Input = ${ex.input} → Output = ${ex.output}${ex.explanation ? ` (${ex.explanation})` : ''}`)
          .join('\n')
        const constraintsText = (Array.isArray(loadedProblem.constraints) ? loadedProblem.constraints : [])
          .slice(0, 3).join('; ')

        // ── ALWAYS APPEND problem context — never rely on placeholders ─
        // .replace() silently does nothing if backend prompt uses old format.
        // Appending guarantees the AI ALWAYS knows the problem, regardless
        // of session age or which backend version generated the prompt.
        const problemContext = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PRE-LOADED PROBLEM (Candidate's Screen)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${loadedProblem.title}
Difficulty: ${loadedProblem.difficulty || difficulty}
Description: ${plainDesc}
${examplesText ? 'Examples:\n' + examplesText : ''}
${constraintsText ? 'Constraints: ' + constraintsText : ''}

This problem is ALREADY showing on the candidate's screen.
You know exactly what it is — use this when introducing, explaining, or evaluating their solution.
Do NOT call any function to load or search for a problem.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

        // Also fill placeholders if they exist in the backend prompt (for new sessions)
        const prompt = basePrompt
          .replace('[PROBLEM_TITLE_PLACEHOLDER]', loadedProblem.title)
          .replace('[PROBLEM_DESC_PLACEHOLDER]', plainDesc)
          .replace('[PROBLEM_EXAMPLE_PLACEHOLDER]', examplesText || '')
          + problemContext

        console.log('✅ Problem context injected into prompt for:', loadedProblem.title)


        // ── Functions available to the AI ──────────────────────────────
        // readCode: uses codeRef.current (same pattern as dsa-ai-tutor.tsx)
        // Result is returned directly from client handler — no server webhook.
        const additionalFunctions = [
          {
            name: "readCode",
            description: "Read the code currently written by the candidate in the editor. ALWAYS call this before giving any code feedback.",
            parameters: { type: "object", properties: {}, required: [] }
          },
          {
            name: "createProblem",
            description: "Create a custom coding problem if the candidate requests a different one.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Problem title" },
                description: { type: "string", description: "HTML formatted problem description" },
                difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                examples: { type: "array", items: { type: "object", properties: { input: { type: "string" }, output: { type: "string" }, explanation: { type: "string" } } } },
                constraints: { type: "array", items: { type: "string" } }
              },
              required: ["title", "description"]
            }
          }
        ]

        // ── handleFunctionCall (no searchDSAProblems handler needed) ───
        const handleFunctionCall = async (name: string, args: any) => {

            if (name === 'readCode') {
                const currentCode = codeRef.current
                const currentLang = languageRef.current   // use ref — not stale closure
                const codePreview = currentCode.trim() || "// No code written yet"
                
                console.log("👀 AI is reading code (", currentLang, "):\n", currentCode.substring(0, 200))
                
                const result = JSON.stringify({
                    success: true,
                    language: currentLang,
                    code: codePreview,
                    lineCount: currentCode.split('\n').length,
                    isEmpty: !currentCode.trim(),
                    message: currentCode.trim() 
                        ? `Candidate's current ${currentLang} code (${currentCode.split('\n').length} lines):\n\n${codePreview}` 
                        : "The candidate hasn't written any code yet."
                })
                
                return result
            }

           // ── Guard: prevent repeat searchDSAProblems calls ──────────
           if (name === 'searchDSAProblems' && problemAlreadyLoading) {
               console.log('🚫 searchDSAProblems called again — problem already loading/loaded, ignoring')
               return JSON.stringify({
                   success: true,
                   problemLoaded: true,
                   alreadyLoading: true,
                   message: 'Problem is already loading or loaded. Stop calling this function. Read the speakNow text you already received and speak it now.'
               })
           }
           if (name === 'searchDSAProblems') {
               problemAlreadyLoading = true  // set guard immediately
           }

           
           // (searchDSAProblems removed — problem is pre-loaded before VAPI starts)
           

          if (name === 'loadDSAProblem') {
                try {
                    console.log("📥 AI loading problem:", args.problemId)
                    
                    const currentCallId = ++latestLoadCallIdRef.current
                    setIsLoadingProblem(true)
                    setLoadAttempt(prev => prev + 1)
                    
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                    const response = await fetch(`${apiUrl}/api/dsa/interview/${args.problemId}`)
                    
                    if (currentCallId !== latestLoadCallIdRef.current) {
                        console.log("🚫 Cancelling stale loadDSAProblem call")
                        setIsLoadingProblem(false)
                        return JSON.stringify({ success: false, error: "Cancelled" })
                    }
                    
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const data = await response.json()
                    
                    if (data.success) {
                        const p = data.data.problem
                        setProblem(p)
                        const starterCode = p.starterCode
                        setCode(starterCode?.[language] || starterCode?.javascript || '')
                        setTestResults(null)
                        setIsLoadingProblem(false)
                        
                        // Strip HTML tags so AI can read the description cleanly
                        const plainDescription = (p.description || '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .substring(0, 600)
                        
                        // Build examples text
                        const examplesText = (p.examples || []).slice(0, 2).map((ex: any, i: number) =>
                            `Example ${i+1}: Input = ${ex.input}, Output = ${ex.output}${ex.explanation ? `, Explanation: ${ex.explanation}` : ''}`
                        ).join(' | ')
                        
                        // Build constraints text
                        const constraintsText = (p.constraints || []).slice(0, 3).join('; ')
                        
                        console.log("✅ Loaded problem:", p.title)
                        return JSON.stringify({
                            success: true,
                            problemLoaded: true,
                            title: p.title,
                            difficulty: p.difficulty,
                            description: plainDescription,
                            examples: examplesText,
                            constraints: constraintsText,
                            topics: [...(p.dataStructures || []), ...(p.patterns || [])].slice(0, 3),
                            message: `Problem "${p.title}" is now displayed on the candidate's screen. You can now explain it verbally.`
                        })
                    } else {
                        setIsLoadingProblem(false)
                        return JSON.stringify({ success: false, error: data.message || 'Problem not found' })
                    }
                } catch (error: any) {
                    console.error("❌ Load failed:", error)
                    setIsLoadingProblem(false)
                    return JSON.stringify({ 
                        success: false, 
                        error: 'Failed to load problem: ' + error.message 
                    })
                }
            }
            
            if (name === 'createProblem') {
                if (!args.title || !args.description) {
                    console.error("❌ createProblem missing required params:", args)
                    return JSON.stringify({
                        success: false,
                        error: "CRITICAL: title and description are REQUIRED"
                    })
                }
                
                const currentCallId = ++latestCreateCallIdRef.current
                console.log("🎨 AI creating custom problem:", args.title)
                setIsLoadingProblem(true)
                
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
                
                if (currentCallId !== latestCreateCallIdRef.current) {
                    console.log("🚫 Cancelling stale createProblem call")
                    setIsLoadingProblem(false)
                    return JSON.stringify({ success: false, error: "Cancelled" })
                }
                
                setProblem(customProblem)
                const starterCode = customProblem.starterCode as Record<string, string>
                setCode(starterCode[language] || starterCode.javascript)
                setTestResults(null)
                setIsLoadingProblem(false)
                
                // Build plain text description for AI
                const plainDescription = (args.description || '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 600)
                
                const examplesText = (args.examples || []).slice(0, 2).map((ex: any, i: number) =>
                    `Example ${i+1}: Input = ${ex.input}, Output = ${ex.output}${ex.explanation ? `, Explanation: ${ex.explanation}` : ''}`
                ).join(' | ')
                
                console.log("✅ Created custom problem:", args.title)
                return JSON.stringify({
                    success: true,
                    problemLoaded: true,
                    title: args.title,
                    difficulty: args.difficulty || 'Medium',
                    description: plainDescription,
                    examples: examplesText,
                    constraints: (args.constraints || []).slice(0, 3).join('; '),
                    message: `Custom problem "${args.title}" is now displayed on screen. You can now explain it verbally.`
                })
            }
           
           if (name === 'submitFeedback') {
               await handleFeedbackSubmission(args)
               return JSON.stringify({ success: true, message: 'Feedback submitted and session ended.' })
           }

           // Catch-all: unknown function name
           console.warn('⚠️ Unknown function called:', name)
           return JSON.stringify({ success: false, error: `Unknown function: ${name}` })
      }

       // ── Start VAPI with the pre-loaded problem context ──────────────
       console.log('Using system prompt:', prompt.substring(0, 200) + '...')
       await startCall(prompt, voiceId, spokenLanguage, handleFunctionCall, additionalFunctions)
     }

      preLoadAndStart().catch(err => console.error('❌ preLoadAndStart failed:', err))
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
                <p className="text-xs text-muted-foreground">
                  {!isCallActive ? "Paused" : !hasSpoken ? "Preparing..." : "Monitoring..."}
                </p>
              </div>
            </div>

            {/* Problem Loading Indicator */}
            {isLoadingProblem && (
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-400">Loading problem...</p>
                  {loadAttempt > 1 && (
                    <p className="text-xs text-muted-foreground">Attempt {loadAttempt} of 5</p>
                  )}
                </div>
              </div>
            )}

            {/* Transcript Preview */}
            <div className="mb-3 p-3 bg-secondary/20 rounded-lg max-h-32 overflow-y-auto">
              <h4 className="text-xs font-semibold mb-2">Recent Conversation</h4>
              {transcript.slice(-3).map((item, index) => (
                <div key={index} className="text-xs mb-1">
                  <span className="font-medium">{item.role === "assistant" ? "AI: " : "You: "}</span>
                  <span className="text-muted-foreground line-clamp-1">{item.content}</span>
                </div>
              ))}
              
              {isCallActive && !hasSpoken && transcript.length === 0 && (
                <div className="text-xs mb-1 flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">AI: </span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-primary/50 rounded-full animate-bounce"></span>
                  </div>
                  <span>Connecting...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
              {!isCallActive && transcript.length === 0 && (
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

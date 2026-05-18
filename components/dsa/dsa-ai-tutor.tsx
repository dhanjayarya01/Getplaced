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
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute, hasSpoken } = useVapi()
  const [isStarting, setIsStarting] = useState(false)
  const [voiceLanguage, setVoiceLanguage] = useState<'English' | 'Hindi'>('English')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Use ref to always get the latest code value (fixes stale closure issue)
  const codeRef = useRef<string>(code)
  
  // Track last written code to prevent duplicate writes from VAPI
  const lastWrittenCodeRef = useRef<{code: string, timestamp: number} | null>(null)
  
  // Track the latest writeCode call ID to cancel outdated calls
  const latestWriteCallIdRef = useRef<number>(0)
  
  // Update ref whenever code changes
  useEffect(() => {
    codeRef.current = code
  }, [code])

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript])

  const handleStartSession = async () => {
    setIsStarting(true)
    const systemPrompt = `You are Tanya, a friendly and patient DSA coding tutor who teaches step-by-step.

CURRENT PROBLEM:
"${problem.title}" - ${problem.difficulty} Level
Language: ${language.toUpperCase()}

YOUR TOOLS:
1. readCode - ALWAYS use this to see user's current code before giving feedback
2. writeCode - Write code directly into their editor

🔊 🚨 CRITICAL: SPEAK FIRST - DO NOT WAIT!

AS SOON AS THE CALL CONNECTS, YOU MUST IMMEDIATELY START SPEAKING.
DO NOT WAIT for the user to say "Hello" or anything else.
Your VERY FIRST ACTION is to speak the greeting from STEP 1.
START TALKING RIGHT NOW!

🎯 CONVERSATION FLOW - FOLLOW THIS EXACT STRUCTURE:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: GREETING & ASK USER'S PREFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Start EVERY new session by greeting and ASKING user what they want:
${voiceLanguage === 'Hindi' 
  ? `"Hi! Main Tanya hoon, aapki coding tutor for '${problem.title}'.

Batao, main aapki kaise madad kar sakti hoon? Kya main aapka code review karu, ya problem explain karu, ya direct solution likh du?"`
  : `"Hi! I'm Tanya, your coding tutor for '${problem.title}'.

How can I help you today? Should I review your code, explain the problem step by step, or give you the direct solution?"`
}

⏸️ WAIT for user response and proceed based on their choice:

- If they want CODE REVIEW → Call readCode and review their work
- If they want PROBLEM EXPLANATION → Go to STEP 2 (Pattern teaching flow)
- If they want SOLUTION → Skip to STEP 6B (Write solution directly)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: PATTERN IDENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After user understands the problem, explain the pattern:
${voiceLanguage === 'Hindi'
  ? `"Accha! Toh yeh problem solve karne ke liye, yeh ek [PATTERN NAME] problem hai.

[Give pattern name: Two Pointer, Sliding Window, HashMap, Binary Search, DP, etc.]

Samjhe? Ab main batati hoon KI KYUN yeh pattern use karenge..."`
  : `"Great! So to solve this problem, this is a [PATTERN NAME] problem.

[Give pattern name: Two Pointer, Sliding Window, HashMap, Binary Search, DP, etc.]

Make sense so far? Now let me explain WHY we use this pattern..."`
}

⏸️ WAIT for user acknowledgment before continuing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: EXPLAIN WHY THIS PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${voiceLanguage === 'Hindi'
  ? `"Yeh pattern kyun use kar rahe hain? Kyunki:
- [Reason 1: What feature of the problem suggests this pattern]
- [Reason 2: What makes this pattern efficient here]

Is pattern ke liye hum [DATA STRUCTURE] use karte hain.

Samjhe yeh part? Koi doubt?"`
  : `"Why are we using this pattern? Because:
- [Reason 1: What feature of the problem suggests this pattern]
- [Reason 2: What makes this pattern efficient here]

For this pattern, we'll use [DATA STRUCTURE].

Does this part make sense? Any questions?"`
}

⏸️ WAIT for user response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: APPROACH & ALGORITHM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${voiceLanguage === 'Hindi'
  ? `"Chaliye ab approach samajhte hain step-by-step:

1. [Step 1 of algorithm]
2. [Step 2 of algorithm]
3. [Step 3 of algorithm]

Example ke saath: [Give a small example walkthrough]

Samjhe approach? Theek hai?"`
  : `"Let's understand the approach step-by-step:

1. [Step 1 of algorithm]
2. [Step 2 of algorithm]
3. [Step 3 of algorithm]

With an example: [Give a small example walkthrough]

Got the approach? Makes sense?"`
}

⏸️ WAIT for user response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: ASK IF USER WANTS TO TRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${voiceLanguage === 'Hindi'
  ? `"Ab aap khud try karna chahenge ise code karna? Ya main direct solution likh doon aur explain kar doon?

Agar aap khud try karna chahte ho, toh code likho main wait karti hoon. Jab ho jaye toh batana!

Agar nahi, toh main abhi solution likh kar explain karti hoon line by line."`
  : `"Now, would you like to try coding this yourself? Or should I write the solution and explain it to you?

If you want to try yourself, go ahead and write the code - I'll wait! Let me know when you're done.

If not, I'll write the solution now and explain it line by line."`
}

⏸️ WAIT for user decision.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6A: IF USER TRIES (User says YES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${voiceLanguage === 'Hindi'
  ? `"Bahut accha! Aap try karo, main wait karti hoon.

[WAIT - Don't say anything until user signals they're done]

Jab user says done/ready/check:
1. Call readCode to see their solution
2. Review:
   - Agar theek hai: 'Bilkul sahi! Perfect solution!'
   - Agar chhoti mistake: 'Almost perfect! Bas [issue] fix karna hai' → call writeCode with fix
   - Agar badi mistake: 'Good try! Par yahan [issue] hai. Chaliye main theek kar deti hoon' → call writeCode

Samjhe? Koi doubt?"`
  : `"Awesome! Go ahead and try, I'll wait.

[WAIT - Don't say anything until user signals they're done]

When user says done/ready/check:
1. Call readCode to see their solution
2. Review:
   - If correct: 'Perfect! Great job!'
   - If small mistake: 'Almost there! Just need to fix [issue]' → call writeCode with fix
   - If big mistake: 'Good attempt! But there's [issue]. Let me help you fix it' → call writeCode

Makes sense? Any questions?"`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6B: IF USER WANTS SOLUTION (User says NO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${voiceLanguage === 'Hindi'
  ? `"Koi baat nahi! Main abhi solution likh deti hoon.

[IMMEDIATELY call writeCode with complete solution - DON'T speak the code]

Accha, ab dekhiye maine kya likha:

Line 1-2: [Explain what these lines do and why - in words, NOT code]
Line 3-5: [Explain what these lines do and why - in words, NOT code]
Line 6-8: [Explain what these lines do and why - in words, NOT code]

Example ke saath dekho kaise kaam karta hai:
[Walk through with example input step by step - explain logic, NOT code syntax]

Time Complexity: [Explain]
Space Complexity: [Explain]

Samjha? Koi line confusing lagi? Poochho bina jhijhak ke!"`
  : `"No problem! Let me write the solution for you.

[IMMEDIATELY call writeCode with complete solution - DON'T speak the code]

Okay, now let me explain what I wrote:

Lines 1-2: [Explain what these lines do and why - in words, NOT code]
Lines 3-5: [Explain what these lines do and why - in words, NOT code]
Lines 6-8: [Explain what these lines do and why - in words, NOT code]

Let me walk through an example:
[Walk through with example input step by step - explain logic, NOT code syntax]

Time Complexity: [Explain]
Space Complexity: [Explain]

Does this make sense? Any line confusing? Feel free to ask!"`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7: HANDLE QUESTIONS & DOUBTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always be ready to:
- Answer questions about any step
- Re-explain confusing parts with different examples
- CALL readCode if user modified code and wants review
- Encourage: ${voiceLanguage === 'Hindi' ? '"Bilkul sahi approach! Keep going!"' : '"Great thinking! You\'re on the right track!"'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL RULES:

1. **NEVER SPEAK CODE OUT LOUD** - NEVER say code in your voice response. ONLY use writeCode function to insert code into editor. Then explain what you wrote, but DON'T read the code line by line in voice.

2. **ONLY CALL writeCode WHEN YOU HAVE CODE READY** - NEVER call writeCode unless you have the complete solution code prepared. If you don't have the code yet, DON'T call the function. Only call it when you're ready with the full solution.

3. **DIRECT SOLUTION REQUEST** - If user says "solution btado", "code likh do", "give solution", "just give me the answer" at ANY point, SKIP directly to STEP 6B. Don't ask if they want to try. Just call writeCode and explain.

4. **NEVER repeat from start** - If user says "hello" or "continue", DON'T restart. Continue from where you left off or ask "Kya doubt hai?" / "What's your question?"

5. **ALWAYS call readCode** before giving feedback on code. NEVER assume what they wrote.

6. **WAIT for user responses** - Don't rush through all steps at once. Go step by step with checkpoints.

7. **Natural conversation** - If user asks "why?", answer naturally. If they say "yes understood", move to next step. If they say "confused", re-explain differently.

7. **Retry on failure** - If readCode or writeCode fails, try again after 1 second. Tell user: ${voiceLanguage === 'Hindi' ? '"Ek second... thoda issue aya, dobara try karti hoon"' : '"One moment... let me try that again"'}

LANGUAGE STYLE:
${voiceLanguage === 'Hindi' 
  ? `- Natural Hinglish: Mix Hindi and English smoothly
- Use Hindi words: "samjhe", "dekho", "chaliye", "theek hai", "koi baat nahi", "bilkul", "accha"
- Mix technical terms: "HashMap use karenge", "Time complexity O(n) hogi"

- 🚨 🚨 🚨 ABSOLUTELY CRITICAL - NUMBERS MUST BE 100% ENGLISH 🚨 🚨 🚨
  
  YOU MUST NEVER, EVER USE HINDI NUMBERS IN ANY FORM:
  
  ❌ NEVER SAY THESE HINDI NUMBER WORDS:
  - ❌ "ek", "do", "teen", "char", "paanch/paach", "chhe", "saat", "aath", "nau", "das"
  - ❌ "gyarah", "barah", "terah", "chaudah", "pandrah"
  - ❌ "bees", "tees", "chaalees", "pachaas"
  - ❌ "sau" (hundred), "hazaar" (thousand)
  - ❌ Devanagari: "एक", "दो", "तीन", "पांच", "सौ", "हज़ार", etc.
  - ❌ "nahi" or "नहीं" for "no" - ALWAYS say "no" in English
  - ❌ "नो" - NEVER use this, say "no" in English
  
  ✅ ALWAYS SAY NUMBERS IN ENGLISH:
  - ✅ "1", "2", "3", "5", "10", "100", "1000" (digits or words)
  - ✅ "one", "two", "three", "five", "ten", "hundred", "thousand"
  - ✅ "Line 1", "Line 2", "Line 10" (NOT "Line ek")
  - ✅ "5 elements" (NOT "paach elements")
  - ✅ "no" for negative (NOT "नहीं" or "नो")
  
  EXAMPLES:
  - ✅ CORRECT: "Dekho Line 1 mein, humne ek variable declare kiya"
  - ❌ WRONG: "Dekho Line ek mein" or "Line एक mein"
  - ✅ CORRECT: "Array mein 5 elements hain"
  - ❌ WRONG: "Array mein paach elements hain"
  - ✅ CORRECT: "Time complexity O(n) hogi, jahan n is array length"
  - ❌ WRONG: "jahan n yeh array length hai"

- **SYMBOLS: Say them in WORDS, not sounds**
  - ">" = "greater than" (NOT symbol sound)
  - "<" = "less than"
  - "||" = "OR operator" or "double pipe"
  - "&&" = "AND operator"
  - "*" = "star" or "multiply"
  - "==" = "double equals"
  - "!=" = "not equals"
  - "[]" = "square brackets"
  - "{}" = "curly braces"
  - Example: Say "if a greater than b" NOT "if a > b"

- Casual, friendly tone like talking to a friend`
  : `- Friendly and encouraging
- Use: "makes sense?", "got it?", "let's", "awesome!", "great!"
- Explain technical terms simply
- Talk like a patient friend teaching, not a lecture`
}

Remember: You're a HUMAN tutor, not a robot. Be patient, encouraging, and conversational! 🎓`

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
            description: `⚠️ CRITICAL: Use this to write code directly into the user's editor. DO NOT CALL this function unless you have the complete ${language} solution code ready to send in the 'code' parameter. Only call when you're providing the actual solution.`,
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
            
            // Retry logic wrapper
            const retryOperation = async (operation: () => Promise<string>, operationName: string, maxRetries = 3): Promise<string> => {
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${operationName}`)
                        const result = await operation()
                        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`)
                        return result
                    } catch (error) {
                        console.error(`❌ ${operationName} failed on attempt ${attempt}:`, error)
                        
                        if (attempt < maxRetries) {
                            console.log(`⏳ Waiting 1 second before retry...`)
                            await new Promise(resolve => setTimeout(resolve, 1000))
                        } else {
                            // Final failure
                            console.error(`💥 ${operationName} failed after ${maxRetries} attempts`)
                            return JSON.stringify({
                                success: false,
                                error: true,
                                message: `Failed to ${operationName} after ${maxRetries} attempts. ${voiceLanguage === 'Hindi' ? 'Kuch technical issue aa gaya hai.' : 'There seems to be a technical issue.'}`
                            })
                        }
                    }
                }
                return JSON.stringify({ success: false, error: true, message: 'Unknown error' })
            }
            
            if (name === 'readCode') {
                return await retryOperation(async () => {
                    console.log("👀 AI Tutor reading code...")
                    // IMPORTANT: Use codeRef.current to get the LATEST code value
                    const currentCode = codeRef.current
                    const codePreview = currentCode.trim() || "// No code written yet"
                    
                    const result = JSON.stringify({
                        language: language,
                        code: codePreview,
                        lineCount: currentCode.split('\n').length,
                        isEmpty: !currentCode.trim(),
                        message: currentCode.trim() 
                            ? `User's current ${language} code (${currentCode.split('\n').length} lines):\n\n${codePreview}` 
                            : `User hasn't written any code yet.`
                    })
                    console.log('✅ Code read successfully')
                    return result
                }, 'readCode', 3)
            }
            
            if (name === 'writeCode') {
                // Generate unique call ID and mark as latest
                const thisCallId = ++latestWriteCallIdRef.current
                console.log(`📞 writeCode call #${thisCallId} initiated`)
                
                return await retryOperation(async () => {
                    // Check if this is still the latest call
                    if (thisCallId !== latestWriteCallIdRef.current) {
                        console.log(`❌ Call #${thisCallId} cancelled (superseded by call #${latestWriteCallIdRef.current})`)
                        return JSON.stringify({
                            success: false,
                            message: 'Call cancelled - newer request received'
                        })
                    }
                    
                    console.log(`✍️ Processing call #${thisCallId}...`)
                    console.log('🔍 Full args object:', args)
                    console.log('🔍 args.code:', args.code)
                    console.log('🔍 args.codeContent:', args.codeContent)
                    console.log('🔍 typeof args:', typeof args)
                    console.log('🔍 Object.keys(args):', Object.keys(args))
                    console.log('🔍 JSON.stringify(args):', JSON.stringify(args))
                    
                    const newCode = args.code || args.codeContent || ""
                    
                    if (!newCode) {
                        console.error('❌ No code parameter received from VAPI')
                        // Don't throw - return error message directly to stop retries
                        // This is a VAPI parameter issue, not a transient error
                        return JSON.stringify({
                            success: false,
                            message: 'VAPI did not send code parameter (known SDK issue). Please try asking again.'
                        })
                    }
                    
                    // Deduplication: Check if this is a duplicate write within 2 seconds
                    const now = Date.now()
                    if (lastWrittenCodeRef.current) {
                        const {code: lastCode, timestamp: lastTime} = lastWrittenCodeRef.current
                        const timeDiff = now - lastTime
                        
                        if (lastCode === newCode && timeDiff < 2000) {
                            console.log(`⚠️ Duplicate writeCode call detected (${timeDiff}ms ago), skipping...`)
                            return JSON.stringify({
                                success: true,
                                message: 'Code already written (duplicate call ignored)'
                            })
                        }
                    }
                    
                    console.log(`✅ Writing ${newCode.split('\n').length} lines to editor`)
                    // Update the code in the editor
                    onCodeChange(newCode)
                    
                    // Track this write to prevent duplicates
                    lastWrittenCodeRef.current = {code: newCode, timestamp: now}
                    
                    console.log('✅ Code written to editor successfully')
                    
                    return JSON.stringify({
                        success: true,
                        message: `Successfully wrote ${newCode.split('\n').length} lines of ${language} code to your editor. ${voiceLanguage === 'Hindi' ? 'Code editor mein aa gaya hai!' : 'Code is now in your editor!'}`
                    })
                }, 'writeCode', 1) // Only 1 attempt - don't retry parameter issues
            }

            // Unknown function
            return JSON.stringify({
                success: false,
                error: true,
                message: `Unknown function: ${name}`
            })
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
            {isCallActive && (
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-2 h-2 rounded-full ${!hasSpoken ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {!hasSpoken ? "Preparing..." : "Active"}
                </span>
              </div>
            )}
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
                {isCallActive && !hasSpoken && transcript.length === 0 && (
                  <div className="text-xs mb-1 flex items-center gap-2 text-muted-foreground bg-muted/50 p-2 rounded">
                    <span className="font-medium">AI: </span>
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 bg-primary/50 rounded-full animate-bounce"></span>
                    </div>
                    <span>Connecting and preparing for you...</span>
                  </div>
                )}
                
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

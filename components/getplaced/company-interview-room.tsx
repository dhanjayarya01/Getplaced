"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { CodingInterviewLayout } from '../interviews/coding-interview-layout'
import { VoiceInterviewLayout } from '../interviews/voice-interview-layout'

interface CompanyInterviewRoomProps {
  companyId: string
  roleIndex: number
  roundNumber: number
}

export function CompanyInterviewRoom({ companyId, roleIndex, roundNumber }: CompanyInterviewRoomProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<any>(null)
  const [userResume, setUserResume] = useState<any>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    loadInterviewData()
  }, [companyId, roleIndex, roundNumber])

  const loadInterviewData = async () => {
    try {
      setLoading(true)

      // Fetch company data
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const companyRes = await fetch(`${apiUrl}/api/companies/${companyId}`, {
        credentials: 'include'
      })
      const companyData = await companyRes.json()

      if (!companyData.success) {
        throw new Error('Failed to load company')
      }

      // Fetch user's resume
      const resumeRes = await fetch(`${apiUrl}/api/companies/interview/resume`, {
        credentials: 'include'
      })
      const resumeData = await resumeRes.json()
      
      console.log('📄 Resume API Response:', resumeData)
      console.log('📄 Resume Data:', resumeData.data)

      // Create/fetch interview session
      const startRes = await fetch(`${apiUrl}/api/companies/${companyId}/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roleIndex })
      })
      const startData = await startRes.json()

      if (!startData.success) {
        throw new Error(startData.message || 'Failed to start interview')
      }

      setCompany(companyData.data)
      setUserResume(resumeData.data)
      console.log('✅ Set userResume to:', resumeData.data)
      setSession({
        _id: `company-${companyId}-role-${roleIndex}-round-${roundNumber}`,
        currentStage: roundNumber
      })

    } catch (error) {
      console.error('Error loading interview:', error)
      alert('Failed to load interview. Redirecting...')
      router.push(`/getplaced/${companyId}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!company) {
    return null
  }

  const role = company.rolesData[roleIndex]
  const round = role.hiringPipeline.find((r: any) => r.roundNumber === roundNumber)

  if (!round) {
    return <div>Round not found</div>
  }

  // Categorize rounds
  const codingRounds = ['coding', 'technical-interview', 'system-design', 'machine-coding']
  const nonCodingRounds = ['behavioral-interview', 'hr-interview']
  const unsupportedRounds = ['aptitude', 'assignment', 'group-discussion', 'online-assessment']

  const isCoding = codingRounds.includes(round.roundType)
  const isNonCoding = nonCodingRounds.includes(round.roundType)

  // Coming soon for unsupported rounds
  if (unsupportedRounds.includes(round.roundType)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Coming Soon</h1>
        <p className="text-muted-foreground mb-4">
          {round.roundType.replace(/-/g, ' ')} rounds will be available in the next update.
        </p>
        <button 
          onClick={() => router.push(`/getplaced/${company.slug}`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to Company
        </button>
      </div>
    )
  }

  // Get DSA problems for this round if coding
  const dsaProblems = isCoding 
    ? role.linkedDSAProblems?.filter((p: any) => p.roundNumber === roundNumber) || []
    : []

  // Generate enhanced prompt
  const systemPrompt = generateCompanyInterviewPrompt({
    company,
    role,
    round,
    userResume,
    isCoding,
    dsaProblems
  })

  // Mock interview object for existing components
  const mockInterview = {
    _id: `company-${companyId}`,
    title: `${company.name} - ${role.roleName}`,
    description: round.description,
    interviewStages: [{
      stage: roundNumber,
      stageName: round.roundName,
      topics: [round.roundType],
      strictness: round.passingCriteria?.minimumScore || 70
    }]
  }

  return isCoding ? (
    <CodingInterviewLayout
      session={session}
      interview={mockInterview}
      systemPrompt={systemPrompt}
    />
  ) : (
    <VoiceInterviewLayout
      session={session}
      interview={mockInterview}
      systemPrompt={systemPrompt}
    />
  )
}

/**
 * Generate context-aware interview prompt
 */
function generateCompanyInterviewPrompt({ company, role, round, userResume, isCoding, dsaProblems }: any) {
  // Debug logging
  console.log('🎯 Generating prompt with userResume:', userResume)
  console.log('📝 parsedData:', userResume?.parsedData)
  
  // Extract resume details with fallbacks - using parsedData structure
  const userName = userResume?.parsedData?.name || null
  const userEmail = userResume?.parsedData?.email || null
  const experience = userResume?.parsedData?.experience?.[0] || null
  const parsedSkills = userResume?.parsedData?.skills || {}
  // Flatten skills object into array
  const skills = [
    ...(parsedSkills.languages || []),
    ...(parsedSkills.frameworks || []),
    ...(parsedSkills.databases || []),
    ...(parsedSkills.tools || []),
    ...(parsedSkills.other || [])
  ]
  const projects = userResume?.parsedData?.projects || []
  
  console.log('✅ Extracted userName:', userName)
  console.log('✅ Extracted experience:', experience)
  console.log('✅ Extracted skills:', skills)
  
  if (isCoding) {
    // CODING INTERVIEW PROMPT - More realistic and resume-aware
    return `You are a ${company.name} interviewer conducting a ${round.roundName} interview for the ${role.roleName} position.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL INTERVIEW FLOW (MUST FOLLOW):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 1: WARM GREETING & INTRO (2-3 minutes)**
${userName 
  ? `"Hi ${userName}! I'm [Your Name], a software engineer at ${company.name}. Thanks for taking the time to interview with us today. How are you doing?"` 
  : `"Hi! I'm [Your Name], a software engineer at ${company.name}. Thanks for taking the time to interview with us today. How are you doing?"`
}

Wait for response, then continue:

"Before we dive into the technical part, I'd like to give you a quick overview. This is the ${round.roundName} for the ${role.roleName} position at ${company.name}. We'll spend about ${round.duration} on a coding problem, and I'll be evaluating your problem-solving approach, code quality, and communication."

**STEP 2: RESUME DISCUSSION (2-3 minutes)**
${userName && (experience || skills.length > 0) ? `
"I see from your resume that ${experience ? `you're ${experience.position} at ${experience.company}` : `you have some great experience`}${skills.length > 0 ? `. I noticed you have experience with ${skills.slice(0, 3).join(', ')}` : ''}${projects.length > 0 ? ` and you've worked on ${projects[0].name}` : ''}. ${round.roundType === 'coding' || round.roundType === 'technical-interview' ? 'That\'s great - those skills will definitely be relevant for this round.' : ''}"

Ask 1-2 brief questions about their background:
- "Tell me a bit about your role at ${experience?.company || 'your current company'}"
- ${skills.includes('JavaScript') || skills.includes('Python') || skills.includes('Java') ? `"I see you work with ${skills.find((s: string) => ['JavaScript', 'Python', 'Java', 'C++'].includes(s))}. How much experience do you have with it?"` : '"What technologies do you work with day-to-day?"'}
- ${projects.length > 0 ? `"Can you briefly tell me about ${projects[0].name}?"` : ''}

Keep this brief! Don't dig too deep - just 1-2 minutes max.
` : `
"Before we start coding, could you give me a quick 30-second overview of your background and what you're currently working on?"

Listen briefly, then:
"Great, thanks for sharing! That background will be helpful for today's discussion."
`}

**STEP 3: COMPANY & ROLE CONTEXT (1 minute)**
"Quick context about ${company.name} - we're ${company.description.substring(0, 100)}... For this ${role.roleName} role, ${role.description?.substring(0, 80) || 'you would be working on core engineering challenges'}.

This ${round.roundName} round is specifically testing ${round.roundType === 'coding' ? 'your algorithmic thinking and coding skills' : round.roundType === 'system-design' ? 'your system design and architecture skills' : round.roundType === 'machine-coding' ? 'your ability to build features end-to-end' : 'your technical problem-solving'}. Sound good?"

**STEP 4: LOAD & INTRODUCE PROBLEM**
[After they say yes/ready]:

Use searchDSAProblems() or loadDSAProblem() to load a problem.
${dsaProblems.length > 0 ? `
📋 PROBLEMS FOR THIS ROUND:
${dsaProblems.map((p: any) => `- ${p.problem?.title || 'Problem'} (Asked ${p.frequency} at ${company.name})`).join('\n')}

🎯 PREFER problems from this list!
` : ''}

**AFTER loading, introduce it naturally:**
❌ DON'T say: "I've loaded a problem. Read it."
✅ DO say: "Alright, so the first problem I have for you today is [Problem Title]. You should be able to see it on your screen now. Take a moment to read through it, and then walk me through your initial thoughts on how you'd approach it."

OR

"Okay, I'm going to share a problem with you - it's called [Problem Title]. It should appear on your screen. Go ahead and read it, and when you're ready, talk me through your approach before you start coding."

**STEP 5: DISCUSSION & CODING (Main portion - ~30 mins)**
- Wait for them to read
- "What's your initial thinking?" or "How would you approach this?"
- Let them explain their approach FULLY before they code
- Ask clarifying questions:
  * "What data structures are you thinking of using?"
  * "Any edge cases you're considering?"
  * "What would be the time and space complexity?"
  
While coding:
- Periodically use readCode() to monitor (every 2-3 min)
- Be encouraging: "Good approach" / "That's interesting, tell me more"
- If stuck for >3 mins: Give hints specific to ${company.name} standards
- Natural comments: "I see you're using X, why did you choose that over Y?"
  
**STEP 6: COMPLEXITY & OPTIMIZATION**
After they finish:
- "Can you walk me through the time and space complexity?"
- "Do you see any ways to optimize this?"
- "What about edge cases like empty input or very large numbers?"

**STEP 7: WRAP UP & FEEDBACK (Last 3-5 mins)**
"Alright${userName ? `, ${userName}` : ''}, we're close on time. Let me review your solution..."
[Call readCode() one final time]

"Overall, here's my feedback: [Provide specific feedback aligned with ${company.name}'s standards]"

Call submitFeedback() with:
- score (1-10)
- areasGoodIn: Specific things they did well
- areasToWorkOn: Concrete improvements for ${company.name} interviews

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 COMPANY CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Company: ${company.name}
- Industry: ${company.industry || 'Technology'}
- Tech Stack: ${company.techStack?.slice(0, 5).join(', ') || 'Modern tech stack'}
- Role: ${role.roleName}
- Round: ${round.roundName} (${round.roundType})
- Duration: ${round.duration}
- Passing Score: ${round.passingCriteria?.minimumScore || 70}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 CANDIDATE INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${userName ? `- Name: ${userName}` : '- Name: Not provided (call them "candidate")'}
${experience ? `- Current: ${experience.position} at ${experience.company}` : ''}
${skills.length > 0 ? `- Skills: ${skills.slice(0, 10).join(', ')}${skills.length > 10 ? '...' : ''}` : '- Skills: Not provided'}
${projects.length > 0 ? `- Projects: ${projects.map((p: any) => p.name).slice(0, 3).join(', ')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **NATURAL PROBLEM INTRODUCTION**
   ❌ DON'T: "I've loaded a problem. Read it."
   ❌ DON'T: "Problem loaded. Read it and tell me your approach."
   ✅ DO: "Alright, so the problem I have for you is [Title]. You can see it on your screen now. Take a look and let me know your thoughts."
   ✅ DO: "Okay, this one's called [Title]. It should be showing up now. Read through it and walk me through how you'd tackle it."

2. **NEVER DESCRIBE PROBLEM DETAILS VERBALLY**
   ❌ DON'T say the problem description out loud
   ❌ DON'T read examples or constraints
   ✅ Only mention the TITLE when introducing it
   ✅ Let them read it themselves from the screen

3. **BE A REAL ${company.name.toUpperCase()} INTERVIEWER**
   - Be friendly and conversational
   - Use natural language, not robotic
   - Reference ${company.name}'s culture and tech stack when relevant
   - Show genuine interest in their background

4. **FUNCTION CALLS**:
   - searchDSAProblems({difficulty, tags})
   - loadDSAProblem({problemId})
   - readCode() - Monitor their progress
   - submitFeedback() - End with scores

⏰ **4-MINUTE SILENCE CHECK**:
- Every 4 min of silence: "Hey, how's it going?"
- Wait 15 sec
- "Are you still there?"
- Wait 30 sec
- If no response: End gracefully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Remember: You're representing ${company.name}. Be professional, conversational, and make this feel REAL. Discuss their resume naturally, introduce problems by name, and engage like a real engineer would!`

  } else {
    // NON-CODING INTERVIEW PROMPT (Behavioral/HR)
    const interviewQuestions = role.interviewQuestions?.filter((q: any) => q.roundNumber === roundNumber) || []
    
    return `You are a ${company.name} interviewer conducting a ${round.roundName} interview for the ${role.roleName} position.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 COMPANY CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Company: ${company.name}
- Industry: ${company.industry || 'Technology'}
- Company Culture: ${company.description?.substring(0, 200)}
- Role: ${role.roleName}
- Round: ${round.roundName} (${round.roundType})
- Duration: ${round.duration}
- Passing Criteria: ${round.passingCriteria?.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 CANDIDATE CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Name: ${userName}
- Experience: ${experience}
- Skills: ${skills}
- Previous Projects: ${userResume?.projects?.[0]?.title || 'N/A'}
- Target: ${role.roleName} at ${company.name}

${interviewQuestions.length > 0 ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INTERVIEW QUESTIONS POOL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${interviewQuestions.map((q: any) => 
  `Q: ${q.question}
Type: ${q.type}
Difficulty: ${q.difficulty}
Tips: ${q.tips?.join(', ') || 'N/A'}`
).join('\n\n')}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 INTERVIEW INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **GREETING**:
   "Hi ${userName}! I'm your interviewer from ${company.name}. 
    This is the ${round.roundName} round. Are you ready?"

2. **ASK 3-5 QUESTIONS**:
   ${interviewQuestions.length > 0 
     ? '- Use questions from the pool above OR create similar ${round.roundType} questions'
     : '- Create appropriate ${round.roundType} questions for ${company.name}'}
   - Let candidate speak fully before asking follow-ups
   - Dig deeper with "Tell me more about that" or "How did you handle..."

3. **EVALUATION CRITERIA**:
   - **STAR Method**: Check if candidate uses Situation, Task, Action, Result
   - **Clarity**: Can they communicate ideas clearly?
   - **Cultural Fit**: Do they align with ${company.name}'s values?
   - **Leadership/Teamwork**: Look for examples${round.roundType === 'hr-interview' ? `
   - **Career Goals**: How do they align with ${role.roleName}?
   - **Why ${company.name}**: Genuine interest or generic answer?
   - **Salary Expectations**: Realistic and informed?` : ''}

4. **${company.name}-SPECIFIC**:
   - Reference ${company.name}'s products/services when relevant
   - Assess knowledge about ${company.name}
   - Look for passion about ${company.name}'s mission

5. **FINAL FEEDBACK** (~${round.duration}):
   Call submitFeedback() with:
   - score: 1-10 based on ${round.passingCriteria?.description}
   - areasGoodIn: What they excelled at
   - areasToWorkOn: Specific improvements

⏰ **4-MINUTE CHECK-IN** (if candidate is silent):
- "How are you doing? Need a moment?"
- Wait 15 seconds
- "Are you still there?"
- Wait 30 seconds
- If no response: End gracefully

Be PROFESSIONAL. Assess CULTURAL FIT. Simulate REAL ${company.name} ${round.roundType.replace(/-/g, ' ').toUpperCase()}.`
  }
}

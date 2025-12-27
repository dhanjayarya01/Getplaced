"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft, Loader2, Lock, Play, CheckCircle2, 
  Clock, Target, Code, MessageSquare, Trophy
} from 'lucide-react'
import { apiService } from '@/lib/api'

interface CompanyInterviewSelectPageProps {
  companyId: string
}

export function CompanyInterviewSelectPage({ companyId }: CompanyInterviewSelectPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<any>(null)
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0)
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    loadCompany()
  }, [companyId])

  useEffect(() => {
    if (company) {
      loadProgress()
    }
  }, [selectedRoleIndex, company])

  const loadCompany = async () => {
    try {
      setLoading(true)
      const companyRes = await apiService.companies.getById(companyId)
      if (companyRes.success) {
        setCompany(companyRes.data)
      }
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const progressRes = await fetch(
        `${apiUrl}/api/companies/${companyId}/interview/progress?roleIndex=${selectedRoleIndex}`,
        { credentials: 'include' }
      )
      const progressData = await progressRes.json()
      
      if (progressData.success && progressData.data) {
        setProgress(progressData.data)
      } else {
        setProgress(null)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const startInterview = async (roundNumber: number) => {
    router.push(`/getplaced/${company.slug}/interview?roleIndex=${selectedRoleIndex}&round=${roundNumber}`)
  }

  const getRoundTypeIcon = (roundType: string) => {
    const codingTypes = ['coding', 'technical-interview', 'system-design', 'machine-coding']
    if (codingTypes.includes(roundType)) return <Code className="w-4 h-4" />
    return <MessageSquare className="w-4 h-4" />
  }

  const getRoundTypeColor = (roundType: string) => {
    const codingTypes = ['coding', 'technical-interview', 'system-design', 'machine-coding']
    if (codingTypes.includes(roundType)) return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!company) {
    return <div>Company not found</div>
  }

  const currentRole = company.rolesData?.[selectedRoleIndex]
  const currentRound = progress?.currentRound || 1

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href={`/getplaced/${company.slug}`}>
            <Button variant="ghost" className="mb-6">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to {company.name}
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-20 h-20 rounded-xl object-contain bg-white border p-2" 
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {company.name} Interview Practice
                </h1>
                <p className="text-muted-foreground">
                  Practice company-specific interviews with AI. Select a role and start your preparation journey.
                </p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          {company.rolesData && company.rolesData.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Select Your Target Role</CardTitle>
                <CardDescription>
                  Choose the position you're preparing for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  value={selectedRoleIndex.toString()} 
                  onValueChange={(val) => setSelectedRoleIndex(parseInt(val))}
                >
                  <TabsList className="w-full justify-start flex-wrap h-auto p-1 bg-transparent gap-2">
                    {company.rolesData.map((role: any, index: number) => (
                      <TabsTrigger
                        key={index}
                        value={index.toString()}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2 rounded-full border border-border bg-card hover:bg-muted"
                      >
                        {role.roleName}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {currentRole && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Interview Rounds */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Interview Rounds - {currentRole.roleName}
                    </CardTitle>
                    <CardDescription>
                      Complete each round to unlock the next. AI will simulate real {company.name} interviews.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentRole.hiringPipeline?.map((round: any, index: number) => {
                        const roundProgress = progress?.roundProgress?.find(
                          (rp: any) => rp.roundNumber === round.roundNumber
                        )
                        const isCompleted = roundProgress?.completed
                        const isCurrent = round.roundNumber === currentRound
                        const isLocked = round.roundNumber > currentRound

                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${
                              isCompleted
                                ? 'bg-green-500/5 border-green-500/20'
                                : isCurrent
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-card border-border'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    isCompleted
                                      ? 'bg-green-500 text-white'
                                      : isCurrent
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-secondary text-muted-foreground'
                                  }`}>
                                    {isCompleted ? '✓' : round.roundNumber}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{round.roundName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getRoundTypeColor(round.roundType)}`}
                                      >
                                        {getRoundTypeIcon(round.roundType)}
                                        <span className="ml-1">{round.roundType.replace(/-/g, ' ')}</span>
                                      </Badge>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {round.duration}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-3">
                                  {round.description}
                                </p>

                                {roundProgress && (
                                  <div className="bg-background/50 rounded-md p-3 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">Your Score</span>
                                      <span className="text-lg font-bold text-primary">
                                        {roundProgress.score}/10
                                      </span>
                                    </div>
                                    {roundProgress.feedback && (
                                      <p className="text-xs text-muted-foreground">
                                        {roundProgress.feedback.substring(0, 150)}...
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div>
                                {isLocked ? (
                                  <Button disabled variant="outline" size="sm">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Locked
                                  </Button>
                                ) : isCompleted ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => startInterview(round.roundNumber)}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Retry
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm"
                                    onClick={() => startInterview(round.roundNumber)}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    {isCurrent ? 'Start' : 'Continue'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Summary */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progress ? (
                      <>
                        <div className="text-center py-4">
                          <div className="text-4xl font-bold text-primary mb-2">
                            {progress.completedRounds}/{progress.totalRounds || currentRole.hiringPipeline?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rounds Completed
                          </div>
                        </div>

                        {progress.overallScore && (
                          <div className="text-center py-4 border-t">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {progress.overallScore.toFixed(1)}/10
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Average Score
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 border-t pt-4">
                          <h4 className="font-semibold text-sm">Current Round</h4>
                          <p className="text-sm text-muted-foreground">
                            {currentRole.hiringPipeline?.[currentRound - 1]?.roundName || 'Not started'}
                          </p>
                        </div>

                        {progress.lastAttemptedAt && (
                          <div className="space-y-2 border-t pt-4">
                            <h4 className="font-semibold text-sm">Last Attempted</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(progress.lastAttemptedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm mb-4">
                          You haven't started this interview yet
                        </p>
                        <Button onClick={() => startInterview(1)}>
                          Start Interview
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Position:</span>
                      <p className="text-muted-foreground">{currentRole.roleName}</p>
                    </div>
                    {currentRole.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground text-xs">{currentRole.description.substring(0, 150)}...</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Total Rounds:</span>
                      <p className="text-muted-foreground">{currentRole.hiringPipeline?.length || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium">DSA Problems:</span>
                      <p className="text-muted-foreground">{currentRole.linkedDSAProblems?.length || 0} linked</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

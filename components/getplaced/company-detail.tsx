"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft, MapPin, Users, Globe, Briefcase, GraduationCap,
  Clock, CheckCircle, Play, FileText, ArrowRight, Star,
  TrendingUp, Code, MessageSquare, Building2, Calendar,
  DollarSign, Target, BookOpen, Video, Loader2, Laptop
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface CompanyDetailProps {
  companyId: string
}

export function CompanyDetail({ companyId }: CompanyDetailProps) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0)
  const [openSheet, setOpenSheet] = useState<string | null>(null)

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const fetchCompany = async () => {
    try {
      setLoading(true)
      const response = await apiService.companies.getById(companyId)
      
      if (response.success) {
        setCompany(response.data)
      } else {
        setError(response.message || 'Company not found')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Very Hard": return "text-red-500 bg-red-500/10"
      case "Hard": return "text-orange-500 bg-orange-500/10"
      case "Medium": return "text-yellow-500 bg-yellow-500/10"
      case "Easy": return "text-green-500 bg-green-500/10"
      default: return "text-muted-foreground bg-secondary"
    }
  }

  const getFrequencyColor = (frequency: string) => {
     switch (frequency) {
        case "Very High": return "bg-red-500/10 text-red-600 border-red-500/20";
        case "High": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
        case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
        case "Low": return "bg-green-500/10 text-green-600 border-green-500/20";
        default: return "bg-secondary text-muted-foreground border-border";
     }
  }

  const formatPackage = (pkg: any) => {
    if (!pkg || (!pkg.min && !pkg.max)) return "Not specified"
    const currency = pkg.currency === 'INR' ? '₹' : '$'
    if (pkg.min && pkg.max) {
      return `${currency}${pkg.min}-${pkg.max} LPA`
    }
    return "Not specified"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Company not found'}</p>
          <Link href="/getplaced">
            <Button variant="outline">Back to Companies</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentRole = company.rolesData?.[selectedRoleIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link href="/getplaced">
        <Button variant="ghost" className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>
      </Link>

      {/* Company Header */}
      <div className="bg-card rounded-xl border border-border p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-24 h-24 rounded-xl object-contain bg-white border border-border p-2" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center text-4xl font-bold">
              {company.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                   {company.headquarters && (
                     <span className="flex items-center gap-1">
                       <MapPin className="w-4 h-4" />
                       {company.headquarters}
                     </span>
                   )}
                  {company.locations?.[0] && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {company.locations.join(", ")}
                    </span>
                  )}
                  {company.employeeCount && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {company.employeeCount} Employees
                    </span>
                  )}
                   {company.founded && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Est. {company.founded}
                    </span>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 {company.difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(company.difficulty)}`}>
                  {company.difficulty} Interview
                </span>
                 )}
                 {company.isHiring && (
                     <Badge variant="default" className="bg-green-500 hover:bg-green-600">Hiring Now</Badge>
                 )}
              </div>
            </div>

            <p className="mt-4 text-muted-foreground leading-relaxed">{company.description}</p>

            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border">
              {company.averagePackage && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Salary Package</p>
                    <p className="font-semibold text-foreground">{formatPackage(company.averagePackage)}</p>
                  </div>
                </div>
              )}
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Experience</p>
                     <p className="font-semibold text-foreground">
                        {company.hiringFreshers ? "Freshers Allowed" : "Experienced Only"}
                         {company.experienceRequired && (company.experienceRequired.min > 0 || company.experienceRequired.max > 0) && (
                             ` (${company.experienceRequired.min}-${company.experienceRequired.max} Years)`
                         )}
                     </p>
                  </div>
                </div>
                 {company.workModes && company.workModes.length > 0 && (
                 <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                      <Laptop className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Work Mode</p>
                    <p className="font-semibold text-foreground">{company.workModes.join(", ")}</p>
                  </div>
                </div>
                 )}
            </div>
          </div>
        </div>
      </div>

        {/* Roles & Role Specific Data */}
        {company.rolesData && company.rolesData.length > 0 ? (
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Role Specific Details</h2>
                </div>
                
                <Tabs defaultValue={company.rolesData[0].roleName} onValueChange={(val) => {
                    const idx = company.rolesData.findIndex((r: any) => r.roleName === val);
                    if(idx !== -1) setSelectedRoleIndex(idx);
                }}>
                    <ScrollArea className="w-full pb-4">
                        <TabsList className="w-full justify-start h-auto p-1 bg-transparent gap-2">
                            {company.rolesData.map((role: any, index: number) => (
                                <TabsTrigger 
                                    key={index} 
                                    value={role.roleName}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2 rounded-full border border-border bg-card hover:bg-muted transition-all"
                                >
                                    {role.roleName}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </ScrollArea>

                    {company.rolesData.map((role: any, index: number) => (
                        <TabsContent key={index} value={role.roleName} className="mt-6 space-y-8">
                             {/* Hiring Pipeline */}
                            {role.hiringPipeline && role.hiringPipeline.length > 0 && (
                                <div className="bg-card rounded-xl border border-border p-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Hiring Process for {role.roleName}
                                </h3>
                                <div className="relative space-y-6 before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-border">
                                    {role.hiringPipeline.sort((a: any, b: any) => a.roundNumber - b.roundNumber).map((round: any, rIdx: number) => (
                                    <div key={rIdx} className="relative pl-12">
                                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center font-bold text-sm z-10">
                                            {round.roundNumber}
                                        </div>
                                        <div className="border border-border rounded-lg p-5 bg-card/50 hover:bg-card transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h4 className="font-semibold text-lg">{round.roundName}</h4>
                                                <Badge variant="outline" className="mt-1">{round.roundType}</Badge>
                                            </div>
                                            {round.duration && (
                                                <span className="text-sm text-muted-foreground flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full whitespace-nowrap">
                                                <Clock className="w-4 h-4" />
                                                {round.duration}
                                                </span>
                                            )}
                                            </div>
                                            {round.description && (
                                            <p className="text-sm text-muted-foreground">{round.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                               <Link href={`/getplaced/${companyId}/interview-select`}>
                                  <Button size="lg" className="w-full">
                                    <Play className="w-5 h-5 mr-2" />
                                    Start Mock Interview for {role.roleName}
                                  </Button>
                                </Link>
                                </div>
                            )}

                             {/* DSA Problems Section - Hidden as per user request */}

                             {/* Linked Dev Problems */}
                             {role.linkedDevProblems && role.linkedDevProblems.length > 0 && (
                                <div className="bg-card rounded-xl border border-border p-6">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                        Development Tasks
                                    </h3>
                                    <div className="space-y-3">
                                        {role.linkedDevProblems.map((item: any, idx: number) => (
                                            <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-all bg-card/50 hover:bg-card">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold">{item.problem?.title}</h4>
                                                        {item.problem?._id && (
                                                            <Link href={`/code-arena/${item.problem._id}`}>
                                                                <Button size="sm" variant="outline">View Task</Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                     <div className="flex items-center gap-3 text-sm">
                                                        {item.frequency && (
                                                            <span className={`text-xs px-2 py-0.5 rounded border ${getFrequencyColor(item.frequency)}`}>
                                                                {item.frequency} Freq
                                                            </span>
                                                        )}
                                                        {item.roundNumber && (
                                                            <span className="text-muted-foreground">Round {item.roundNumber}</span>
                                                        )}
                                                    </div>
                                                     {item.notes && (
                                                        <p className="text-sm text-muted-foreground mt-1">Note: {item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                             
                             {/* Interview Questions */}
                             {role.interviewQuestions && role.interviewQuestions.length > 0 && (
                                 <div className="bg-card rounded-xl border border-border p-6">
                                     <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                         <MessageSquare className="w-5 h-5 text-primary" />
                                         Previously Asked Questions
                                     </h3>
                                     <div className="space-y-4">
                                         {role.interviewQuestions.map((q: any, idx: number) => (
                                             <div key={idx} className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                                                 <p className="font-medium text-lg mb-3">{q.question}</p>
                                                 <div className="flex items-center gap-2 flex-wrap mb-3">
                                                     <Badge variant="secondary">{q.type}</Badge>
                                                     {q.difficulty && (
                                                         <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(q.difficulty)}`}>
                                                             {q.difficulty}
                                                         </span>
                                                     )}
                                                     {q.roundNumber && (
                                                         <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                                                             Round {q.roundNumber}
                                                         </span>
                                                     )}
                                                 </div>
                                                 {q.answer && (
                                                     <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-md mb-2">
                                                         <p className="text-sm text-green-700 dark:text-green-400 font-medium">Answer Key:</p>
                                                         <p className="text-sm text-muted-foreground">{q.answer}</p>
                                                     </div>
                                                 )}
                                                 {q.tips && q.tips.length > 0 && (
                                                     <div className="space-y-1 mt-2 pl-4 border-l-2 border-primary/30">
                                                         {q.tips.map((tip: string, tIdx: number) => (
                                                             <p key={tIdx} className="text-sm text-muted-foreground italic">
                                                                 " {tip} "
                                                             </p>
                                                         ))}
                                                     </div>
                                                 )}
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        ) : (
            <div className="text-center py-12 border rounded-xl border-dashed mb-12 bg-muted/30">
                <p className="text-muted-foreground">No role specific data available for this company yet.</p>
            </div>
        )}

      {/* Common Company Sections */}
      <div className="space-y-8">
              {/* Requirements */}
              {company.requirements && company.requirements.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Global Requirements
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                      {company.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 bg-secondary/30 p-3 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                      </li>
                      ))}
                  </ul>
                  </div>
              )}

              {/* Trigger Cards for Modal Sections */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Recruitment Patterns Card */}
                {company.patterns && company.patterns.length > 0 && (
                  <Sheet open={openSheet === 'patterns'} onOpenChange={(open) => setOpenSheet(open ? 'patterns' : null)}>
                    <SheetTrigger asChild>
                      <Card className="cursor-pointer hover:border-primary/50 transition-all group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <TrendingUp className="w-8 h-8 text-primary" />
                            <Badge variant="secondary">{company.patterns.length}</Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Recruitment Patterns</h3>
                          <p className="text-sm text-muted-foreground">View interview patterns and strategies</p>
                          <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Recruitment Patterns
                        </SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 mt-6">
                        {company.patterns.map((pattern: any, idx: number) => (
                          <div key={idx} className="border border-border rounded-lg p-4 bg-gradient-to-br from-card to-secondary/30">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{pattern.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded border ${getFrequencyColor(pattern.frequency)}`}>
                                {pattern.frequency}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                            {pattern.examples && pattern.examples.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {pattern.examples.map((ex: string, i: number) => (
                                  <Badge key={i} variant="outline" className="bg-background">{ex}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}

                {/* Interview Tips Card */}
                {company.interviewTips && company.interviewTips.length > 0 && (
                  <Sheet open={openSheet === 'tips'} onOpenChange={(open) => setOpenSheet(open ? 'tips' : null)}>
                    <SheetTrigger asChild>
                      <Card className="cursor-pointer hover:border-primary/50 transition-all group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <Star className="w-8 h-8 text-yellow-500" />
                            <Badge variant="secondary">{company.interviewTips.length}</Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Insider Tips</h3>
                          <p className="text-sm text-muted-foreground">Expert advice from interviewees</p>
                          <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          Insider Interview Tips
                        </SheetTitle>
                      </SheetHeader>
                      <ul className="space-y-3 mt-6">
                        {company.interviewTips.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Star className="w-3 h-3 fill-current" />
                            </div>
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </SheetContent>
                  </Sheet>
                )}

                {/* Benefits Card */}
                {company.benefits && company.benefits.length > 0 && (
                  <Sheet open={openSheet === 'benefits'} onOpenChange={(open) => setOpenSheet(open ? 'benefits' : null)}>
                    <SheetTrigger asChild>
                      <Card className="cursor-pointer hover:border-primary/50 transition-all group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <Target className="w-8 h-8 text-green-500" />
                            <Badge variant="secondary">{company.benefits.length}</Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Perks and Benefits</h3>
                          <p className="text-sm text-muted-foreground">Employee perks and advantages</p>
                          <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-500" />
                          Perks and Benefits
                        </SheetTitle>
                      </SheetHeader>
                      <ul className="space-y-2 mt-6">
                        {company.benefits.map((benefit: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm p-3 bg-card rounded-lg border border-border">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </SheetContent>
                  </Sheet>
                )}
              </div>

              {/* Eligibility and Tech Stack - Single Row Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Eligibility */}
                {company.eligibilityCriteria && Object.values(company.eligibilityCriteria).some(v => v) && (
                  <Card className="bg-card border border-border">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Eligibility Criteria
                      </h3>
                      <div className="space-y-3">
                        {company.eligibilityCriteria.minCGPA && (
                          <div className="flex justify-between items-center pb-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Min CGPA</span>
                            <span className="font-semibold">{company.eligibilityCriteria.minCGPA}</span>
                          </div>
                        )}
                        {company.eligibilityCriteria.minPercentage && (
                          <div className="flex justify-between items-center pb-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Min Percentage</span>
                            <span className="font-semibold">{company.eligibilityCriteria.minPercentage}%</span>
                          </div>
                        )}
                        {company.eligibilityCriteria.educationLevel && (
                          <div className="flex justify-between items-center pb-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Degree</span>
                            <span className="font-semibold">{company.eligibilityCriteria.educationLevel}</span>
                          </div>
                        )}
                        {company.eligibilityCriteria.allowedBranches && company.eligibilityCriteria.allowedBranches.length > 0 && (
                          <div className="pt-1">
                            <span className="text-sm text-muted-foreground block mb-2">Allowed Branches</span>
                            <div className="flex flex-wrap gap-1">
                              {company.eligibilityCriteria.allowedBranches.map((b: string) => (
                                <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {company.eligibilityCriteria.yearOfPassing && company.eligibilityCriteria.yearOfPassing.length > 0 && (
                          <div className="pt-2">
                            <span className="text-sm text-muted-foreground block mb-2">Batch</span>
                            <div className="flex flex-wrap gap-1">
                              {company.eligibilityCriteria.yearOfPassing.map((b: number) => (
                                <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tech Stack */}
                {company.techStack && company.techStack.length > 0 && (
                  <Card className="bg-card border border-border">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {company.techStack.map((tech: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
          </div>

          {/* Sidebar Sections - Removed, consolidated into cards above */}

      </div>
 
  )
}
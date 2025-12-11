"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft, MapPin, Users, Globe, Briefcase, GraduationCap,
  Clock, CheckCircle, Play, FileText, ArrowRight, Star,
  TrendingUp, Code, MessageSquare, Building2, Calendar,
  DollarSign, Target, BookOpen, Video, Loader2
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"

interface CompanyDetailProps {
  companyId: string
}

export function CompanyDetail({ companyId }: CompanyDetailProps) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <div className="bg-card rounded-xl border border-border p-8 mb-8">
        <div className="flex items-start gap-6">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-24 h-24 rounded-xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center text-4xl font-bold">
              {company.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {company.locations?.[0] && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {company.locations.join(", ")}
                    </span>
                  )}
                  {company.employeeCount && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {company.employeeCount}
                    </span>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
              {company.difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(company.difficulty)}`}>
                  {company.difficulty}
                </span>
              )}
            </div>

            <p className="mt-4 text-muted-foreground">{company.description}</p>

            <div className="flex flex-wrap gap-4 mt-6">
              {company.averagePackage && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Package</p>
                    <p className="font-semibold">{formatPackage(company.averagePackage)}</p>
                  </div>
                </div>
              )}
              {company.founded && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Founded</p>
                    <p className="font-semibold">{company.founded}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      {company.roles && company.roles.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Open Roles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.roles.map((role: string, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <h3 className="font-semibold">{role}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hiring Pipeline */}
      {company.hiringPipeline && company.hiringPipeline.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Interview Process</h2>
          <div className="space-y-4">
            {company.hiringPipeline.map((round: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {round.roundNumber || index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{round.roundName}</h3>
                      <p className="text-sm text-muted-foreground">{round.roundType}</p>
                    </div>
                  </div>
                  {round.duration && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {round.duration}
                    </span>
                  )}
                </div>
                {round.description && (
                  <p className="text-sm text-muted-foreground mt-2">{round.description}</p>
                )}
              </div>
            ))}
          </div>
          <Link href={`/getplaced/${companyId}/interview`}>
            <Button className="w-full mt-6">
              <Play className="w-4 h-4 mr-2" />
              Start Interview Preparation
            </Button>
          </Link>
        </div>
      )}

      {/* Interview Tips */}
      {company.interviewTips && company.interviewTips.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Interview Tips
          </h2>
          <ul className="space-y-2">
            {company.interviewTips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {company.requirements && company.requirements.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Requirements
          </h2>
          <ul className="space-y-2">
            {company.requirements.map((req: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Stack */}
      {company.techStack && company.techStack.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {company.techStack.map((tech: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      {company.benefits && company.benefits.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Benefits & Perks
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {company.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eligibility Criteria */}
      {company.eligibilityCriteria && Object.keys(company.eligibilityCriteria).some(key => company.eligibilityCriteria[key]) && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Eligibility Criteria
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.eligibilityCriteria.minCGPA && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Minimum CGPA</p>
                <p className="text-lg font-semibold">{company.eligibilityCriteria.minCGPA}</p>
              </div>
            )}
            {company.eligibilityCriteria.minPercentage && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Minimum Percentage</p>
                <p className="text-lg font-semibold">{company.eligibilityCriteria.minPercentage}%</p>
              </div>
            )}
            {company.eligibilityCriteria.educationLevel && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Education Level</p>
                <p className="text-lg font-semibold">{company.eligibilityCriteria.educationLevel}</p>
              </div>
            )}
            {company.eligibilityCriteria.maxBacklogs !== undefined && company.eligibilityCriteria.maxBacklogs !== null && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Max Backlogs</p>
                <p className="text-lg font-semibold">{company.eligibilityCriteria.maxBacklogs}</p>
              </div>
            )}
            {company.eligibilityCriteria.ageLimit && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Age Limit</p>
                <p className="text-lg font-semibold">{company.eligibilityCriteria.ageLimit} years</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked DSA Problems */}
      {company.linkedDSAProblems && company.linkedDSAProblems.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Frequently Asked DSA Problems
          </h2>
          <div className="space-y-3">
            {company.linkedDSAProblems.map((item: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.problem?.problemNumber && (
                        <span className="text-sm font-mono font-semibold text-primary">
                          #{item.problem.problemNumber}
                        </span>
                      )}
                      <h3 className="font-semibold">
                        {item.problem?.title || 'Problem'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {item.frequency && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.frequency === 'Very High' ? 'bg-red-500/10 text-red-600' :
                          item.frequency === 'High' ? 'bg-orange-500/10 text-orange-600' :
                          item.frequency === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>
                          {item.frequency} Frequency
                        </span>
                      )}
                      {item.role && (
                        <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded">
                          {item.role}
                        </span>
                      )}
                      {item.problem?.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(item.problem.difficulty)}`}>
                          {item.problem.difficulty}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                    )}
                  </div>
                  {item.problem?._id && (
                    <Link href={`/dsa/${item.problem._id}`}>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Dev Problems */}
      {company.linkedDevProblems && company.linkedDevProblems.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Development Problems
          </h2>
          <div className="space-y-3">
            {company.linkedDevProblems.map((item: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.problem?.title || 'Problem'}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {item.frequency && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.frequency === 'Very High' ? 'bg-red-500/10 text-red-600' :
                          item.frequency === 'High' ? 'bg-orange-500/10 text-orange-600' :
                          item.frequency === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>
                          {item.frequency} Frequency
                        </span>
                      )}
                      {item.role && (
                        <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded">
                          {item.role}
                        </span>
                      )}
                      {item.problem?.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(item.problem.difficulty)}`}>
                          {item.problem.difficulty}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                    )}
                  </div>
                  {item.problem?._id && (
                    <Link href={`/code-arena/${item.problem._id}`}>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Questions */}
      {company.interviewQuestions && company.interviewQuestions.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Popular Interview Questions</h2>
          <div className="space-y-3">
            {company.interviewQuestions.slice(0, 10).map((q: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-secondary rounded">{q.type}</span>
                      {q.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      )}
                      {q.role && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {q.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

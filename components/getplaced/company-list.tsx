"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Users, ChevronRight, Briefcase } from "lucide-react"
import Link from "next/link"

const companies = [
  {
    id: 1,
    name: "Google",
    logo: "/google-logo.png",
    location: "Multiple Locations",
    employees: "150,000+",
    roles: ["SDE", "SDE II", "Senior SDE", "Staff Engineer"],
    rounds: ["Online Assessment", "Phone Screen", "Onsite (4-5 rounds)", "Team Match"],
    difficulty: "Very Hard",
    avgPackage: "₹25-45 LPA",
    preparing: 2456,
  },
  {
    id: 2,
    name: "Amazon",
    logo: "/amazon-logo.png",
    location: "Bangalore, Hyderabad",
    employees: "1.5M+",
    roles: ["SDE I", "SDE II", "Senior SDE"],
    rounds: ["Online Assessment", "Phone Screen", "Onsite (4 rounds)", "Bar Raiser"],
    difficulty: "Hard",
    avgPackage: "₹18-35 LPA",
    preparing: 3234,
  },
  {
    id: 3,
    name: "Microsoft",
    logo: "/microsoft-logo.png",
    location: "Bangalore, Hyderabad, Noida",
    employees: "220,000+",
    roles: ["SDE", "SDE II", "Senior SDE", "Principal SDE"],
    rounds: ["Online Assessment", "Phone Interview", "Onsite (3-4 rounds)"],
    difficulty: "Hard",
    avgPackage: "₹20-40 LPA",
    preparing: 2890,
  },
  {
    id: 4,
    name: "TCS",
    logo: "/generic-tech-logo.png",
    location: "Pan India",
    employees: "600,000+",
    roles: ["System Engineer", "ASE", "Senior Developer"],
    rounds: ["TCS NQT", "Technical Interview", "HR Round"],
    difficulty: "Medium",
    avgPackage: "₹3.5-7 LPA",
    preparing: 12456,
  },
  {
    id: 5,
    name: "Infosys",
    logo: "/infosys-logo.png",
    location: "Pan India",
    employees: "335,000+",
    roles: ["System Engineer", "Senior SE", "Technology Analyst"],
    rounds: ["InfyTQ", "Technical Round", "HR Round"],
    difficulty: "Medium",
    avgPackage: "₹3.6-8 LPA",
    preparing: 9876,
  },
]

export function CompanyList() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Very Hard":
        return "text-red-500 bg-red-500/10"
      case "Hard":
        return "text-orange-500 bg-orange-500/10"
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "Easy":
        return "text-green-500 bg-green-500/10"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Popular Companies</h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/getplaced/${company.id}`}
            className="block bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start gap-4">
              <img
                src={company.logo || "/placeholder.svg"}
                alt={company.name}
                className="w-14 h-14 rounded-xl bg-secondary object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{company.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {company.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {company.employees}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(company.difficulty)}`}>
                    {company.difficulty}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {company.roles.slice(0, 3).map((role) => (
                    <span key={role} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {role}
                    </span>
                  ))}
                  {company.roles.length > 3 && (
                    <span className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground">
                      +{company.roles.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="font-medium">{company.avgPackage}</span>
                    </span>
                    <span className="text-muted-foreground">{company.preparing.toLocaleString()} preparing</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import {
  Code2,
  Mic,
  Terminal,
  Building2,
  TrendingUp,
  Target,
  Flame,
  Trophy,
  Calendar,
  ArrowRight,
  Play,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"

const quickStats = [
  { label: "Problems Solved", value: "127", change: "+12 this week", icon: Code2, color: "text-primary" },
  { label: "Mock Interviews", value: "24", change: "+3 this week", icon: Mic, color: "text-accent" },
  { label: "Dev Challenges", value: "32", change: "+5 this week", icon: Terminal, color: "text-chart-3" },
  { label: "Companies Prepped", value: "12", change: "+2 this week", icon: Building2, color: "text-chart-4" },
]

const recentActivity = [
  { type: "problem", title: "Two Sum", status: "solved", time: "2 hours ago", xp: 50 },
  { type: "interview", title: "Technical Mock", status: "completed", time: "Yesterday", xp: 150 },
  { type: "challenge", title: "Build useState Hook", status: "in-progress", time: "Yesterday", xp: 0 },
  { type: "company", title: "Google Prep Started", status: "new", time: "2 days ago", xp: 0 },
]

const upcomingTasks = [
  { title: "System Design Mock", type: "Interview", time: "Today, 3:00 PM" },
  { title: "Complete DP Section", type: "DSA", time: "Tomorrow" },
  { title: "Amazon LP Questions", type: "Company Prep", time: "Dec 8" },
]

export function DashboardOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your progress overview for this week</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
            <Flame className="w-5 h-5 text-accent" />
            <span className="font-semibold">45 day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-semibold">2,450 XP</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Weekly Goals
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">
                Edit Goals
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Solve 20 DSA problems", current: 12, total: 20, color: "bg-primary" },
                { label: "Complete 3 mock interviews", current: 2, total: 3, color: "bg-accent" },
                { label: "Finish 5 dev challenges", current: 5, total: 5, color: "bg-green-500" },
              ].map((goal) => (
                <div key={goal.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{goal.label}</span>
                    <span className="text-sm font-medium">
                      {goal.current}/{goal.total}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${goal.color} rounded-full transition-all`}
                      style={{ width: `${(goal.current / goal.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === "solved"
                        ? "bg-green-500/20"
                        : activity.status === "completed"
                          ? "bg-primary/20"
                          : "bg-accent/20"
                    }`}
                  >
                    {activity.status === "solved" || activity.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : activity.status === "in-progress" ? (
                      <Clock className="w-5 h-5 text-accent" />
                    ) : (
                      <Zap className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                  {activity.xp > 0 && <span className="text-sm font-medium text-primary">+{activity.xp} XP</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/dsa"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <Code2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Continue DSA Practice</h3>
              <p className="text-sm text-muted-foreground mb-4">8 problems left in Sliding Window section</p>
              <div className="flex items-center text-primary text-sm font-medium">
                Resume
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link
              href="/interviews"
              className="bg-card rounded-xl border border-border p-6 hover:border-accent/50 transition-all hover:shadow-lg group"
            >
              <Mic className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">Start Mock Interview</h3>
              <p className="text-sm text-muted-foreground mb-4">Practice behavioral questions with AI</p>
              <div className="flex items-center text-accent text-sm font-medium">
                Start Now
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground">{task.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
              View Calendar
            </Button>
          </div>

          {/* Skill Breakdown */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Skill Breakdown</h3>
            <div className="space-y-3">
              {[
                { skill: "Arrays & Strings", level: 85 },
                { skill: "Trees & Graphs", level: 70 },
                { skill: "Dynamic Programming", level: 45 },
                { skill: "System Design", level: 60 },
                { skill: "Behavioral", level: 80 },
              ].map((item) => (
                <div key={item.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.skill}</span>
                    <span className="text-primary">{item.level}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Ranking
            </h3>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary">#247</div>
              <div className="text-sm text-muted-foreground">out of 50,000 users</div>
              <div className="text-xs text-green-500 mt-1">Top 1%</div>
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              View Leaderboard
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

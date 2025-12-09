"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Code, Briefcase, Building2 } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...')
      const response = await apiService.admin.getDashboard()
      console.log('Admin stats response:', response)
      
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message || 'Failed to fetch stats')
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      setError(error.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users?.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">DSA Problems</CardTitle>
            <Code className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.problems?.dsa || 0}</div>
            <p className="text-xs text-muted-foreground">Active problems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dev Problems</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.problems?.development || 0}</div>
            <p className="text-xs text-muted-foreground">Active problems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.companies?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.companies?.hiring || 0} hiring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-bold">{stats?.activity?.totalSubmissions || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold">{stats?.activity?.totalApplications || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold">{stats?.activity?.activeSessions || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

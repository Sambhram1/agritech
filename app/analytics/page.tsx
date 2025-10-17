"use client"
import { Pie, PieChart, Cell, AreaChart, Area } from "recharts"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Camera,
  ArrowLeft,
  TrendingUp,
  Calendar,
  BarChart3,
  LucidePieChart,
  Sun,
  Moon,
  LogOut,
  Download,
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface LivestockRecord {
  id: string
  imageUrl: string
  classification: "Cattle" | "Buffalo"
  confidence: number
  timestamp: string
  location?: string
}

const COLORS = {
  Cattle: "hsl(var(--primary))",
  Buffalo: "hsl(var(--secondary))",
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [records, setRecords] = useState<LivestockRecord[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("agrilens_user")
    if (!userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.authenticated) {
        router.push("/login")
        return
      }
      setUser(parsedUser)
    } catch {
      router.push("/login")
    }

    // Load records
    const savedRecords = localStorage.getItem("agrilens_records")
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords))
      } catch {
        setRecords([])
      }
    }

    // Check for dark mode preference
    const isDark = localStorage.getItem("agrilens_theme") === "dark"
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [router])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("agrilens_theme", newDarkMode ? "dark" : "light")

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("agrilens_user")
    router.push("/")
  }

  // Calculate analytics data
  const cattleCount = records.filter((r) => r.classification === "Cattle").length
  const buffaloCount = records.filter((r) => r.classification === "Buffalo").length
  const totalCount = records.length

  // Pie chart data
  const pieData = [
    { name: "Cattle", value: cattleCount, color: COLORS.Cattle },
    { name: "Buffalo", value: buffaloCount, color: COLORS.Buffalo },
  ]

  // Monthly trend data (mock data for demonstration)
  const monthlyData = [
    { month: "Jan", Cattle: 12, Buffalo: 8, total: 20 },
    { month: "Feb", Cattle: 15, Buffalo: 10, total: 25 },
    { month: "Mar", Cattle: 18, Buffalo: 12, total: 30 },
    { month: "Apr", Cattle: 22, Buffalo: 14, total: 36 },
    { month: "May", Cattle: 25, Buffalo: 16, total: 41 },
    { month: "Jun", Cattle: cattleCount, Buffalo: buffaloCount, total: totalCount },
  ]

  // Weekly activity data
  const weeklyData = [
    { day: "Mon", records: 3 },
    { day: "Tue", records: 5 },
    { day: "Wed", records: 2 },
    { day: "Thu", records: 8 },
    { day: "Fri", records: 4 },
    { day: "Sat", records: 6 },
    { day: "Sun", records: 1 },
  ]

  // Confidence score distribution
  const confidenceData = records.reduce((acc: any[], record) => {
    const range = Math.floor(record.confidence * 10) * 10
    const existing = acc.find((item) => item.range === `${range}-${range + 10}%`)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ range: `${range}-${range + 10}%`, count: 1 })
    }
    return acc
  }, [])

  const averageConfidence =
    records.length > 0 ? records.reduce((sum, record) => sum + record.confidence, 0) / records.length : 0

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AgriLens Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="w-9 h-9 p-0">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Livestock Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your farm's livestock data</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              <div className="text-3xl font-bold text-foreground">{totalCount}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">+12%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cattle Count</CardTitle>
              <div className="text-3xl font-bold text-primary">{cattleCount}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">+8%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buffalo Count</CardTitle>
              <div className="text-3xl font-bold text-secondary">{buffaloCount}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">+15%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Confidence</CardTitle>
              <div className="text-3xl font-bold text-accent">{Math.round(averageConfidence * 100)}%</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">+2%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Livestock Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucidePieChart className="w-5 h-5" />
                Livestock Distribution
              </CardTitle>
              <CardDescription>Current breakdown of your livestock types</CardDescription>
            </CardHeader>
            <CardContent>
              {totalCount > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LucidePieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm">Cattle ({cattleCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-sm">Buffalo ({buffaloCount})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>Livestock count trends over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Cattle"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="Buffalo"
                      stackId="1"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Number of records added each day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="records" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Score Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>AI Confidence Distribution</CardTitle>
              <CardDescription>Distribution of AI classification confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              {confidenceData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confidenceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No confidence data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Insights */}
        <Card className="border-border mt-8">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated insights based on your livestock data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">High Classification Accuracy</p>
                    <p className="text-sm text-muted-foreground">
                      Your AI classifications maintain an average confidence of {Math.round(averageConfidence * 100)}%,
                      indicating reliable livestock identification.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Balanced Livestock Portfolio</p>
                    <p className="text-sm text-muted-foreground">
                      You have a {cattleCount > buffaloCount ? "cattle-heavy" : "buffalo-heavy"} farm composition with{" "}
                      {Math.round((Math.max(cattleCount, buffaloCount) / totalCount) * 100)}% of your livestock being{" "}
                      {cattleCount > buffaloCount ? "cattle" : "buffalo"}.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Consistent Record Keeping</p>
                    <p className="text-sm text-muted-foreground">
                      You've maintained regular livestock documentation with {totalCount} total records, showing good
                      farm management practices.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Growth Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Consider expanding your {cattleCount < buffaloCount ? "cattle" : "buffalo"} population to
                      diversify your livestock portfolio further.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

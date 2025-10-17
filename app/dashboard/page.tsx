"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  Upload,
  BarChart3,
  MessageCircle,
  LogOut,
  Sun,
  Moon,
  X,
  CheckCircle,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface User {
  phone: string
  authenticated: boolean
  loginTime: string
}

interface LivestockRecord {
  id: string
  imageUrl: string
  classification: "Cattle" | "Buffalo"
  confidence: number
  timestamp: string
  location?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationResult, setClassificationResult] = useState<{
    type: "Cattle" | "Buffalo"
    confidence: number
  } | null>(null)
  const [records, setRecords] = useState<LivestockRecord[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
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

    // Load existing records
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

  const handleLogout = () => {
    localStorage.removeItem("agrilens_user")
    router.push("/")
  }

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setSelectedImage(imageUrl)
        setShowUploadModal(true)
        classifyImage(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const classifyImage = async (imageUrl: string) => {
    setIsClassifying(true)
    setClassificationResult(null)

    try {
      // Simulate AI classification API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock classification result
      const classifications = [
        { type: "Cattle" as const, confidence: 0.92 },
        { type: "Buffalo" as const, confidence: 0.88 },
        { type: "Cattle" as const, confidence: 0.95 },
        { type: "Buffalo" as const, confidence: 0.91 },
      ]

      const result = classifications[Math.floor(Math.random() * classifications.length)]
      setClassificationResult(result)
    } catch (error) {
      console.error("Classification failed:", error)
    } finally {
      setIsClassifying(false)
    }
  }

  const saveRecord = () => {
    if (!selectedImage || !classificationResult) return

    const newRecord: LivestockRecord = {
      id: Date.now().toString(),
      imageUrl: selectedImage,
      classification: classificationResult.type,
      confidence: classificationResult.confidence,
      timestamp: new Date().toISOString(),
      location: "Farm Location", // In real app, this would come from GPS
    }

    const updatedRecords = [newRecord, ...records]
    setRecords(updatedRecords)
    localStorage.setItem("agrilens_records", JSON.stringify(updatedRecords))

    // Reset modal state
    setShowUploadModal(false)
    setSelectedImage(null)
    setClassificationResult(null)
  }

  const closeModal = () => {
    setShowUploadModal(false)
    setSelectedImage(null)
    setClassificationResult(null)
    setIsClassifying(false)
  }

  const cattleCount = records.filter((r) => r.classification === "Cattle").length
  const buffaloCount = records.filter((r) => r.classification === "Buffalo").length

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AgriLens</span>
          </div>

          <div className="flex items-center gap-2">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to AgriLens</h1>
          <p className="text-muted-foreground">
            Logged in as +91 {user.phone} • Manage your livestock with AI-powered tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              <div className="text-2xl font-bold text-foreground">{records.length}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cattle Count</CardTitle>
              <div className="text-2xl font-bold text-primary">{cattleCount}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buffalo Count</CardTitle>
              <div className="text-2xl font-bold text-secondary">{buffaloCount}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="border-border hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => cameraInputRef.current?.click()}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Capture Photo</CardTitle>
              <CardDescription>Take a photo of your livestock for AI classification</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="border-border hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-lg">Upload Image</CardTitle>
              <CardDescription>Upload existing photos from your device gallery</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/analytics">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-lg">View Analytics</CardTitle>
                <CardDescription>Check livestock counts and farm statistics</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/chat">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <CardDescription>Get farming tips and guidance from our AI chatbot</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Records */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Livestock Records</CardTitle>
            <CardDescription>Your latest AI-classified livestock photos</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No records yet</p>
                <p>Start by capturing or uploading your first livestock photo</p>
                <Button className="mt-4" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.slice(0, 6).map((record) => (
                  <Card key={record.id} className="border-border overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={record.imageUrl || "/placeholder.svg"}
                        alt="Livestock"
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={record.classification === "Cattle" ? "default" : "secondary"}
                      >
                        {record.classification}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-sm text-muted-foreground">{Math.round(record.confidence * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                      {record.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          {record.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>AI Classification</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedImage && (
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected livestock"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {isClassifying ? (
                <div className="text-center py-6">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing image with AI...</p>
                </div>
              ) : classificationResult ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Classification Complete</h3>
                  <Badge
                    variant={classificationResult.type === "Cattle" ? "default" : "secondary"}
                    className="text-sm px-3 py-1 mb-2"
                  >
                    {classificationResult.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {Math.round(classificationResult.confidence * 100)}%
                  </p>
                  <Button onClick={saveRecord} className="w-full mt-4">
                    Save Record
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

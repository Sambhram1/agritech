"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Camera, ArrowLeft, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate phone number
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      setLoading(false)
      return
    }

    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep("otp")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate OTP
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      setLoading(false)
      return
    }

    try {
      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store user session (in real app, this would be handled by backend)
      localStorage.setItem(
        "agrilens_user",
        JSON.stringify({
          phone: phoneNumber,
          authenticated: true,
          loginTime: new Date().toISOString(),
        }),
      )

      router.push("/dashboard")
    } catch (err) {
      setError("Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError("")

    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setError("") // Clear any previous errors
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AgriLens</span>
          </div>
          <p className="text-muted-foreground">Smart farming starts here</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{step === "phone" ? "Welcome Back" : "Verify Your Phone"}</CardTitle>
            <CardDescription className="text-base">
              {step === "phone"
                ? "Enter your phone number to get started with AgriLens"
                : `We've sent a 6-digit code to +91 ${phoneNumber}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">+91</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-16 h-12 text-lg"
                      required
                    />
                  </div>
                </div>

                {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">{error}</div>}

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading || phoneNumber.length !== 10}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-2xl tracking-widest h-12"
                    maxLength={6}
                    required
                  />
                </div>

                {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">{error}</div>}

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-primary hover:text-primary/80"
                  >
                    Resend OTP
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Change Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
          <p className="text-sm text-muted-foreground">Phone: Any 10-digit number | OTP: 123456</p>
        </div>
      </div>
    </div>
  )
}

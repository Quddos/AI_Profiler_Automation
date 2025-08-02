"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import Link from "next/link"
import { Shield, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Login successful:", data)
        // Redirect based on role or to a default dashboard
        window.location.href = data.user.role === "superadmin" || data.user.role === "admin" ? "/admin" : "/dashboard"
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-yellow-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full max-w-md shadow-lg animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">ProfileDash</span>
            </Link>
            <CardTitle className="text-3xl font-bold text-blue-800">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm text-center border border-red-300 bg-red-50 p-2 rounded-md"
                >
                  {error}
                </motion.div>
              )}
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-2 rounded-md transition-colors duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

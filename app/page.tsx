import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText, Upload } from "lucide-react"
import { initializeDatabase } from "@/lib/db-init"

export default async function LandingPage() {
  let dbConnected = false
  let setupRequired = false

  try {
    await initializeDatabase()
    dbConnected = true
  } catch (error) {
    console.error("Database connection failed on landing page:", error)
    setupRequired = true
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100 p-4 text-center">
      <div className="space-y-6 animate-fade-in">
        <Shield className="mx-auto h-24 w-24 text-yellow-500 animate-bounce-slow" />
        <h1 className="text-5xl font-extrabold tracking-tight gradient-bg bg-clip-text text-transparent sm:text-6xl md:text-7xl">
          ProfileDash
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-700 md:text-xl">
          Your ultimate solution for role-based profile management. Admins can manage user credentials and content,
          while users access their personalized dashboards.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {setupRequired ? (
            <Button asChild className="bg-red-500 hover:bg-red-600 text-white animate-pulse-red">
              <Link href="/setup">Database Setup Required</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold animate-pulse-yellow"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent"
              >
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-16 w-full max-w-4xl grid gap-8 md:grid-cols-3">
        <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-blue-700">Admin Control</CardTitle>
            <CardDescription>Manage users, roles, and profile cards with ease.</CardDescription>
          </CardHeader>
          <CardContent>
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Full CRUD operations for users and their assigned content.</p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="text-yellow-700">Personalized Dashboards</CardTitle>
            <CardDescription>Users see only their relevant credentials and documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileText className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Customizable cards for LinkedIn, Certificates, Degrees, and more.</p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="text-blue-700">Secure File Storage</CardTitle>
            <CardDescription>Upload and manage documents securely with Vercel Blob.</CardDescription>
          </CardHeader>
          <CardContent>
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Integrated file uploads for certificates, resumes, and other documents.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

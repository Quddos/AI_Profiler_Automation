import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, FileText, Zap, AlertTriangle } from "lucide-react"
import { testConnection } from "@/lib/db-init"

export default async function LandingPage() {
  let dbConnected = false
  let showSetup = false

  try {
    dbConnected = await testConnection()
  } catch (error) {
    showSetup = true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">ProfileDash</span>
          </div>
          <div className="space-x-4">
            {showSetup ? (
              <Button variant="outline" asChild>
                <Link href="/setup">Setup</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Setup Alert */}
      {showSetup && (
        <div className="container mx-auto px-4 mb-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Database connection not configured. Please{" "}
              <Link href="/setup" className="underline font-medium">
                complete the setup
              </Link>{" "}
              to get started.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 gradient-bg bg-clip-text text-transparent">
            Manage Profiles with Precision
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive role-based profile management system that empowers administrators to create, manage, and
            track user credentials and documents with ease.
          </p>
          <div className="space-x-4">
            {showSetup ? (
              <Button size="lg" className="animate-pulse-yellow" asChild>
                <Link href="/setup">Complete Setup</Link>
              </Button>
            ) : (
              <Button size="lg" className="animate-pulse-yellow" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover animate-fade-in">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Secure authentication with superadmin, admin, and user roles for precise access control.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <Users className="h-12 w-12 text-yellow-500 mb-4" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete CRUD operations for user accounts with role assignment and management.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload, organize, and manage multiple documents per user with secure cloud storage.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-500 mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track completion progress for each profile card with visual indicators and analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold">ProfileDash</span>
          </div>
          <p className="text-gray-400">© 2024 ProfileDash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

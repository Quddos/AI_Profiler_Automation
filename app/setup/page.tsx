import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Upload, Key, CheckCircle, XCircle } from "lucide-react"

async function checkEnvironment() {
  const checks = {
    database: !!process.env.DATABASE_URL,
    blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    jwt: !!process.env.JWT_SECRET,
  }

  return checks
}

export default async function SetupPage() {
  const envChecks = await checkEnvironment()
  const allConfigured = Object.values(envChecks).every(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">ProfileDash Setup</span>
          </div>
          <p className="text-gray-600">Configure your environment variables to get started</p>
        </div>

        <div className="space-y-6">
          {/* Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Environment Status</span>
              </CardTitle>
              <CardDescription>Check your environment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Database Connection</p>
                      <p className="text-sm text-gray-500">DATABASE_URL</p>
                    </div>
                  </div>
                  {envChecks.database ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-4 w-4 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">File Storage</p>
                      <p className="text-sm text-gray-500">BLOB_READ_WRITE_TOKEN</p>
                    </div>
                  </div>
                  {envChecks.blob ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-4 w-4 mr-1" />
                      Optional
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Session Secret</p>
                      <p className="text-sm text-gray-500">JWT_SECRET</p>
                    </div>
                  </div>
                  {envChecks.jwt ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-4 w-4 mr-1" />
                      Optional
                    </Badge>
                  )}
                </div>
              </div>

              {allConfigured ? (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All environment variables are configured! You can now use the application.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    DATABASE_URL is required to run the application. Please configure it in your environment variables.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to configure your environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span>1. Database Setup (Required)</span>
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">Set up your Neon PostgreSQL database:</p>
                  <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs">
                    DATABASE_URL=postgresql://username:password@host:port/database
                  </code>
                  <p className="text-xs text-gray-500">Get your connection string from your Neon dashboard</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-yellow-500" />
                  <span>2. File Storage Setup (Optional)</span>
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">Set up Vercel Blob for file uploads:</p>
                  <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs">
                    BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
                  </code>
                  <p className="text-xs text-gray-500">Get your token from Vercel dashboard → Storage → Blob</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span>3. Session Secret (Optional)</span>
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">Set a secret key for session security:</p>
                  <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs">
                    JWT_SECRET=your-super-secret-key-here
                  </code>
                  <p className="text-xs text-gray-500">Use a random string for production environments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Credentials */}
          <Card>
            <CardHeader>
              <CardTitle>Default Admin Credentials</CardTitle>
              <CardDescription>Use these credentials to log in after setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <code className="bg-white px-2 py-1 rounded text-sm">admin@qudmeet.click</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Password:</span>
                    <code className="bg-white px-2 py-1 rounded text-sm">admin@123</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Role:</span>
                    <Badge>superadmin</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

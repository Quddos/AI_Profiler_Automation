"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "failed">("checking")
  const [blobStatus, setBlobStatus] = useState<"checking" | "connected" | "failed">("checking")
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    checkDatabaseConnection()
    checkBlobConnection()
  }, [])

  const checkDatabaseConnection = async () => {
    setDbStatus("checking")
    setDbError(null)
    try {
      const response = await fetch("/api/debug/db-check")
      const data = await response.json()
      if (response.ok && data.connected) {
        setDbStatus("connected")
      } else {
        setDbStatus("failed")
        setDbError(data.message || "Failed to connect to database.")
      }
    } catch (error: any) {
      setDbStatus("failed")
      setDbError(error.message || "Network error or server issue during DB check.")
    }
  }

  const checkBlobConnection = async () => {
    setBlobStatus("checking")
    try {
      // A simple check for Blob token presence, not a full connection test
      const response = await fetch("/api/debug/blob-check")
      const data = await response.json()
      if (response.ok && data.connected) {
        setBlobStatus("connected")
      } else {
        setBlobStatus("failed")
      }
    } catch (error) {
      setBlobStatus("failed")
    }
  }

  const allConnected = dbStatus === "connected" && blobStatus === "connected"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">Setup Required</CardTitle>
          <CardDescription className="text-gray-600">
            Please configure your environment variables to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant={dbStatus === "connected" ? "default" : "destructive"}>
            {dbStatus === "checking" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : dbStatus === "connected" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>Database Connection</AlertTitle>
            <AlertDescription>
              {dbStatus === "checking" && "Checking database connection..."}
              {dbStatus === "connected" && "Database connected successfully!"}
              {dbStatus === "failed" && (
                <>
                  Failed to connect to Neon database. Please ensure `DATABASE_URL` is set correctly.
                  {dbError && <p className="mt-2 text-xs">Error: {dbError}</p>}
                </>
              )}
              <p className="mt-2 text-sm font-mono">`DATABASE_URL="postgresql://user:password@host:port/database"`</p>
            </AlertDescription>
          </Alert>

          <Alert variant={blobStatus === "connected" ? "default" : "destructive"}>
            {blobStatus === "checking" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : blobStatus === "connected" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>Vercel Blob Storage</AlertTitle>
            <AlertDescription>
              {blobStatus === "checking" && "Checking Vercel Blob token..."}
              {blobStatus === "connected" && "Vercel Blob token detected!"}
              {blobStatus === "failed" && (
                <>Vercel Blob token not found. Please ensure `BLOB_READ_WRITE_TOKEN` is set.</>
              )}
              <p className="mt-2 text-sm font-mono">`BLOB_READ_WRITE_TOKEN="your_blob_token_here"`</p>
            </AlertDescription>
          </Alert>

          <div className="flex justify-center gap-4">
            <Button onClick={checkDatabaseConnection} disabled={dbStatus === "checking"}>
              {dbStatus === "checking" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying DB...
                </>
              ) : (
                "Retry DB Connection"
              )}
            </Button>
            <Button onClick={checkBlobConnection} disabled={blobStatus === "checking"}>
              {blobStatus === "checking" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying Blob...
                </>
              ) : (
                "Retry Blob Check"
              )}
            </Button>
          </div>

          {allConnected && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Setup Complete!</AlertTitle>
              <AlertDescription>
                All environment variables are configured. You can now proceed to the login page.
                <Button asChild className="ml-4">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!allConnected && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Please set the required environment variables in your `.env.local` file or Vercel project settings.
                <p className="mt-2">After setting them, click the "Retry" buttons above.</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

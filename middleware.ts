import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  const { pathname } = request.nextUrl

  console.log("Middleware - Path:", pathname, "Session:", sessionId ? "exists" : "none")

  // Public routes that don't require authentication
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/setup" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Protected routes require authentication
  if (!sessionId) {
    console.log("No session, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.redirect(new URL("/setup", request.url))
    }

    // Validate session in database
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL)

    const result = await sql`
      SELECT u.role FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_id = ${sessionId} 
      AND s.expires_at > NOW()
      LIMIT 1
    `

    if (!result || result.length === 0) {
      console.log("Invalid session, redirecting to login")
      // Clear invalid session cookie
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session-id")
      return response
    }

    const userRole = result[0].role
    console.log("Valid session, user role:", userRole)

    // Role-based access control
    if (pathname.startsWith("/admin") && !["admin", "superadmin"].includes(userRole)) {
      console.log("Insufficient permissions for admin area")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // If database connection fails, redirect to setup
    return NextResponse.redirect(new URL("/setup", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
}

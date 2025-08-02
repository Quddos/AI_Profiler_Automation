import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 })
    }
    // Return user data without sensitive info like password hash
    const { password_hash, ...safeUser } = user
    return NextResponse.json({ authenticated: true, user: safeUser }, { status: 200 })
  } catch (error) {
    console.error("Error in /api/auth/check:", error)
    return NextResponse.json({ authenticated: false, user: null, message: "Internal server error" }, { status: 500 })
  }
}

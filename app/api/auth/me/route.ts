import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    // Return user data without sensitive info like password hash
    const { password_hash, ...safeUser } = user
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

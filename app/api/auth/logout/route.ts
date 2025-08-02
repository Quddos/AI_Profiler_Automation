import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (sessionId) {
      await deleteSession(sessionId)
      cookieStore.delete("session-id")
      console.log("Session deleted:", sessionId)
    }

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await getUserByEmail(email)

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      console.log("Login failed: Invalid credentials for email:", email)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const sessionId = await createSession(user)
    const cookieStore = cookies()

    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    console.log("Login successful for user:", user.email, "Redirecting to dashboard.")
    return NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

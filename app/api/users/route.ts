import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, getSessionUser } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db-init"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    const user = await getSessionUser(sessionId || "")

    if (!user || !["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const sql = await initializeDatabase()
    const users = await sql`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    const user = await getSessionUser(sessionId || "")

    if (!user || !["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const sql = await initializeDatabase()
    const [newUser] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, name, email, role, created_at, updated_at
    `

    return NextResponse.json({ user: newUser })
  } catch (error: any) {
    console.error("Create user error:", error)
    if (error.code === "23505") {
      // Unique constraint violation
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

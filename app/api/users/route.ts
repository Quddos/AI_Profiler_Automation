import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-init"
import { getAuthenticatedAdmin } from "@/lib/server-auth"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    await getAuthenticatedAdmin() // Ensure only admins/superadmins can access
    const sql = await initializeDatabase()
    const users = await sql`
      SELECT id, name, email, role FROM users ORDER BY id ASC
    `
    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await getAuthenticatedAdmin() // Only admins/superadmins can create users
    const sql = await initializeDatabase()
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Name, email, password, and role are required" }, { status: 400 })
    }

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `
    if (existingUser.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, name, email, role
    `

    return NextResponse.json({ message: "User created successfully", user: newUser[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating user:", error)
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

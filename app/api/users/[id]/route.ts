import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-init"
import { getAuthenticatedAdmin } from "@/lib/server-auth"
import { hashPassword } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await getAuthenticatedAdmin() // Ensure only admins/superadmins can access
    const sql = await initializeDatabase()
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const users = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${userId} LIMIT 1
    `
    if (!users || users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error: any) {
    console.error("Error fetching user by ID:", error)
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await getAuthenticatedAdmin() // Ensure only admins/superadmins can update
    const sql = await initializeDatabase()
    const userId = Number.parseInt(params.id)
    const { name, email, role, password } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (name) {
      updateFields.push("name = ${name}")
      updateValues.push(name)
    }
    if (email) {
      updateFields.push("email = ${email}")
      updateValues.push(email)
    }
    if (role) {
      updateFields.push("role = ${role}")
      updateValues.push(role)
    }
    if (password) {
      const hashedPassword = await hashPassword(password)
      updateFields.push("password_hash = ${hashedPassword}")
      updateValues.push(hashedPassword)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 })
    }

    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ${userId}`
    await sql.unsafe(query, updateValues)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error: any) {
    console.error("Error updating user:", error)
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await getAuthenticatedAdmin() // Ensure only admins/superadmins can delete
    const sql = await initializeDatabase()
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Delete user's sessions, cards, card details, and files first
    await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`
    await sql`DELETE FROM card_details WHERE card_id IN (SELECT id FROM cards WHERE assigned_user_id = ${userId})`
    await sql`DELETE FROM files WHERE card_id IN (SELECT id FROM cards WHERE assigned_user_id = ${userId})`
    await sql`DELETE FROM cards WHERE assigned_user_id = ${userId}`
    await sql`DELETE FROM users WHERE id = ${userId}`

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

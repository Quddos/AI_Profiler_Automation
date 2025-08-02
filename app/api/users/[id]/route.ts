import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "superadmin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, email, password, role } = await request.json()
    const userId = Number.parseInt(params.id)

    let updateQuery = `
      UPDATE users 
      SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
    `
    const queryParams = [name, email, role]

    if (password) {
      const hashedPassword = await hashPassword(password)
      updateQuery += `, password_hash = $4`
      queryParams.push(hashedPassword)
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, name, email, role, created_at, updated_at`
    queryParams.push(userId)

    const [user] = await sql.unsafe(updateQuery, queryParams)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Update user error:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = Number.parseInt(params.id)

    const [deletedUser] = await sql`
      DELETE FROM users 
      WHERE id = ${userId} 
      RETURNING id
    `

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

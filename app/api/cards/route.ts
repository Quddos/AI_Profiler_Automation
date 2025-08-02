import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db-init"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    const user = await getSessionUser(sessionId || "")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = await initializeDatabase()
    let cards

    if (["admin", "superadmin"].includes(user.role)) {
      // Admin can see all cards
      cards = await sql`
        SELECT c.*, u.name as assigned_user_name, u.email as assigned_user_email
        FROM cards c
        LEFT JOIN users u ON c.assigned_user_id = u.id
        ORDER BY c.created_at DESC
      `
    } else {
      // Users can only see their assigned cards
      cards = await sql`
        SELECT c.*, u.name as assigned_user_name, u.email as assigned_user_email
        FROM cards c
        LEFT JOIN users u ON c.assigned_user_id = u.id
        WHERE c.assigned_user_id = ${user.id}
        ORDER BY c.created_at DESC
      `
    }

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Get cards error:", error)
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

    const { title, description, type, assigned_user_id, progress = 0 } = await request.json()

    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 })
    }

    const sql = await initializeDatabase()
    const [card] = await sql`
      INSERT INTO cards (title, description, type, assigned_user_id, progress, created_by)
      VALUES (${title}, ${description}, ${type}, ${assigned_user_id}, ${progress}, ${user.id})
      RETURNING *
    `

    return NextResponse.json({ card })
  } catch (error) {
    console.error("Create card error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

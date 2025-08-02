import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cardId = Number.parseInt(params.id)

    const [card] = await sql`
      SELECT c.*, u.name as assigned_user_name, u.email as assigned_user_email
      FROM cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      WHERE c.id = ${cardId}
    `

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    // Check permissions
    if (!["admin", "superadmin"].includes(decoded.role) && card.assigned_user_id !== decoded.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get card details
    const details = await sql`
      SELECT * FROM card_details WHERE card_id = ${cardId}
    `

    // Get files
    const files = await sql`
      SELECT * FROM files WHERE card_id = ${cardId}
    `

    return NextResponse.json({
      card: {
        ...card,
        details,
        files,
      },
    })
  } catch (error) {
    console.error("Get card error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "superadmin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const cardId = Number.parseInt(params.id)
    const { title, description, type, assigned_user_id, progress } = await request.json()

    const [card] = await sql`
      UPDATE cards 
      SET title = ${title}, description = ${description}, type = ${type}, 
          assigned_user_id = ${assigned_user_id}, progress = ${progress}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cardId}
      RETURNING *
    `

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    return NextResponse.json({ card })
  } catch (error) {
    console.error("Update card error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "superadmin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const cardId = Number.parseInt(params.id)

    const [deletedCard] = await sql`
      DELETE FROM cards WHERE id = ${cardId} RETURNING id
    `

    if (!deletedCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete card error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

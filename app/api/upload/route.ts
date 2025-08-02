import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const cardId = formData.get("cardId") as string

    if (!file || !cardId) {
      return NextResponse.json({ error: "File and cardId are required" }, { status: 400 })
    }

    // Check if user has access to this card
    const [card] = await sql`
      SELECT * FROM cards WHERE id = ${Number.parseInt(cardId)}
    `

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    if (!["admin", "superadmin"].includes(decoded.role) && card.assigned_user_id !== decoded.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Save file record to database
    const [fileRecord] = await sql`
      INSERT INTO files (card_id, file_name, file_url, file_size, mime_type, uploaded_by)
      VALUES (${Number.parseInt(cardId)}, ${file.name}, ${blob.url}, ${file.size}, ${file.type}, ${decoded.id})
      RETURNING *
    `

    return NextResponse.json({ file: fileRecord })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

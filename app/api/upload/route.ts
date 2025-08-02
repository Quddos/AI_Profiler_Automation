import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-init"
import { getAuthenticatedUser } from "@/lib/server-auth"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser() // Ensure user is authenticated
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")
    const cardId = searchParams.get("cardId")

    if (!filename) {
      return NextResponse.json({ message: "Filename is required" }, { status: 400 })
    }
    if (!request.body) {
      return NextResponse.json({ message: "Request body is empty" }, { status: 400 })
    }

    const blob = await put(filename, request.body, {
      access: "public",
    })

    if (cardId) {
      const sql = await initializeDatabase()
      const parsedCardId = Number.parseInt(cardId)
      if (isNaN(parsedCardId)) {
        return NextResponse.json({ message: "Invalid cardId" }, { status: 400 })
      }

      // Check if the card belongs to the user or if user is admin/superadmin
      const cardOwnerCheck = await sql`
        SELECT assigned_user_id FROM cards WHERE id = ${parsedCardId}
      `
      if (cardOwnerCheck.length === 0) {
        return NextResponse.json({ message: "Card not found" }, { status: 404 })
      }
      const ownerId = cardOwnerCheck[0].assigned_user_id

      if (ownerId !== user.id && !["admin", "superadmin"].includes(user.role)) {
        return NextResponse.json({ message: "Unauthorized to upload to this card" }, { status: 403 })
      }

      // Store file metadata in the database
      await sql`
        INSERT INTO files (card_id, file_name, file_url)
        VALUES (${parsedCardId}, ${filename}, ${blob.url})
      `
    }

    return NextResponse.json(blob)
  } catch (error: any) {
    console.error("Error uploading file:", error)
    if (error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 })
  }
}

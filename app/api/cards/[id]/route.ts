import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db-init";
import { getAuthenticatedAdmin } from "@/lib/server-auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = await initializeDatabase();
    const cardId = Number.parseInt(params.id);
    if (isNaN(cardId)) {
      return NextResponse.json({ message: "Invalid card ID" }, { status: 400 });
    }

    // Get user (admin or normal user)
    let user = null;
    try {
      user = await getAuthenticatedAdmin();
    } catch {
      // Not admin, try as normal user
      try {
        user = await (await import("@/lib/server-auth")).getAuthenticatedUser();
      } catch {
        return NextResponse.json({ message: "Authentication required" }, { status: 403 });
      }
    }

    const cardResult = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.type, 
        c.progress, 
        c.assigned_user_id,
        c.created_at,
        u.name as assigned_user_name,
        u.email as assigned_user_email
      FROM cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      WHERE c.id = ${cardId}
    `;

    if (!cardResult || cardResult.length === 0) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    const card = cardResult[0];

    // Only allow access if admin or assigned user
    if (!user || (user.role !== "admin" && user.role !== "superadmin" && card.assigned_user_id !== user.id)) {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
    }

    const detailsResult = await sql`
      SELECT field_name, field_value, file_url FROM card_details WHERE card_id = ${cardId}
    `;
    card.details = detailsResult || [];

    const filesResult = await sql`
      SELECT id, file_name, file_url FROM files WHERE card_id = ${cardId}
    `;
    card.files = filesResult || [];

    return NextResponse.json({ card });
  } catch (error: any) {
    console.error("Error fetching card by ID:", error);
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await getAuthenticatedAdmin();
    const sql = await initializeDatabase();
    const cardId = Number.parseInt(params.id);
    const { title, description, type, progress, assignedUserId, details, files } = await request.json();

    if (isNaN(cardId)) {
      return NextResponse.json({ message: "Invalid card ID" }, { status: 400 });
    }

    // Validation
    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ message: "Please select item in the list" }, { status: 400 });
    }

    const assignedId = assignedUserId === "null" ? null : assignedUserId || null;

    await sql`
      UPDATE cards
      SET 
        title = ${title}, 
        description = ${description}, 
        type = ${type}, 
        progress = ${progress}, 
        assigned_user_id = ${assignedId ?? null}
      WHERE id = ${cardId}
    `;

    await sql`DELETE FROM card_details WHERE card_id = ${cardId}`;
    if (details && details.length > 0) {
      for (const detail of details) {
        await sql`
          INSERT INTO card_details (card_id, field_name, field_value, file_url)
          VALUES (${cardId}, ${detail.field_name}, ${detail.field_value}, ${detail.file_url || null})
        `;
      }
    }

    await sql`DELETE FROM files WHERE card_id = ${cardId}`;
    if (files && files.length > 0) {
      for (const file of files) {
        await sql`
          INSERT INTO files (card_id, file_name, file_url)
          VALUES (${cardId}, ${file.file_name}, ${file.file_url})
        `;
      }
    }

    return NextResponse.json({ message: "Card updated successfully" });
  } catch (error: any) {
    console.error("Error updating card:", error);
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await getAuthenticatedAdmin();
    const sql = await initializeDatabase();
    const cardId = Number.parseInt(params.id);

    if (isNaN(cardId)) {
      return NextResponse.json({ message: "Invalid card ID" }, { status: 400 });
    }

    await sql`DELETE FROM card_details WHERE card_id = ${cardId}`;
    await sql`DELETE FROM files WHERE card_id = ${cardId}`;
    await sql`DELETE FROM cards WHERE id = ${cardId}`;

    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting card:", error);
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

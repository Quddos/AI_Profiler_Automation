import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db-init";
import { getAuthenticatedAdmin, getAuthenticatedUser } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const sql = await initializeDatabase();
    const user = await getAuthenticatedUser();

    let cards;
    if (["admin", "superadmin"].includes(user.role)) {
      cards = await sql`
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
        ORDER BY c.created_at DESC
      `;
    } else {
      cards = await sql`
        SELECT 
          c.id, 
          c.title, 
          c.description, 
          c.type, 
          c.progress, 
          c.assigned_user_id,
          c.created_at
        FROM cards c
        WHERE c.assigned_user_id = ${user.id}
        ORDER BY c.created_at DESC
      `;
    }

    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error("Error fetching cards:", error);
    if (error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await getAuthenticatedAdmin();
    const sql = await initializeDatabase();
    const { title, description, type, progress, assignedUserId, details } = await request.json();

    // Validation
    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ message: "Please select item in the list" }, { status: 400 });
    }

    const assignedId = assignedUserId === "null" ? null : assignedUserId || null;

    const newCardResult = await sql`
      INSERT INTO cards (title, description, type, progress, assigned_user_id)
      VALUES (${title}, ${description || null}, ${type}, ${progress || 0}, ${assignedId ?? null})
      RETURNING id
    `;
    const newCardId = newCardResult[0].id;

    if (details && details.length > 0) {
      for (const detail of details) {
        await sql`
          INSERT INTO card_details (card_id, field_name, field_value, file_url)
          VALUES (${newCardId}, ${detail.field_name}, ${detail.field_value}, ${detail.file_url || null})
        `;
      }
    }

    return NextResponse.json({ message: "Card created successfully", cardId: newCardId }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating card:", error);
    if (error.message === "Insufficient permissions" || error.message === "Authentication required") {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

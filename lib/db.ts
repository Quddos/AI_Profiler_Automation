import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is properly set
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set. Please add it to your environment variables.")
}

// Validate the URL format
try {
  new URL(databaseUrl)
} catch (error) {
  throw new Error(
    `DATABASE_URL is not a valid URL format. Expected format: postgresql://username:password@host:port/database`,
  )
}

export const sql = neon(databaseUrl)

export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  role: "superadmin" | "admin" | "user"
  created_at: string
  updated_at: string
}

export interface Card {
  id: number
  title: string
  description: string
  type: string
  progress: number
  assigned_user_id: number
  created_by: number
  created_at: string
  updated_at: string
}

export interface CardDetail {
  id: number
  card_id: number
  field_name: string
  field_value: string
  file_url: string
  created_at: string
}

export interface FileRecord {
  id: number
  card_id: number
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_by: number
  created_at: string
}

export interface UserSession {
  session_id: string
  user_id: number
  expires_at: string
  created_at: string
}

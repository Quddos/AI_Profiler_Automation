import type { User } from "./db"
import { cookies } from "next/headers"
import { initializeDatabase } from "./db-init"

// Simple plain text password handling
export async function hashPassword(password: string): Promise<string> {
  return password
}

export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  return password === storedPassword
}

// Generate a more secure session ID
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${randomPart}_${randomPart2}`
}

export async function createSession(user: User): Promise<string> {
  try {
    const sql = await initializeDatabase()
    const sessionId = generateSessionId()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    console.log("Creating session for user:", user.id, "Session ID:", sessionId)

    // Delete any existing sessions for this user first
    await sql`
      DELETE FROM user_sessions WHERE user_id = ${user.id}
    `

    // Create new session
    await sql`
      INSERT INTO user_sessions (session_id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt})
    `

    console.log("Session created successfully")
    return sessionId
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

export async function getSessionUser(sessionId: string): Promise<User | null> {
  try {
    const sql = await initializeDatabase()
    const result = await sql`
      SELECT u.* FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_id = ${sessionId} 
      AND s.expires_at > NOW()
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting session user:", error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sql = await initializeDatabase()
    await sql`
      DELETE FROM user_sessions WHERE session_id = ${sessionId}
    `
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const sql = await initializeDatabase()
    const users = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return users[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const sql = await initializeDatabase()
    const users = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `
    return users[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return null
    }

    return getSessionUser(sessionId)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

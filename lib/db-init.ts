import { config, validateConfig } from "./config"

let sqlInstance: any = null

export async function initializeDatabase() {
  try {
    validateConfig()

    if (!sqlInstance) {
      const { neon } = await import("@neondatabase/serverless")
      sqlInstance = neon(config.database.url!)
    }

    return sqlInstance
  } catch (error) {
    console.error("Database initialization failed:", error)
    throw error
  }
}

export async function testConnection() {
  try {
    const sql = await initializeDatabase()
    await sql`SELECT 1 as test`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

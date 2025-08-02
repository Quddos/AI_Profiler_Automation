export const config = {
  database: {
    url: process.env.DATABASE_URL,
    required: true,
  },
  blob: {
    token: process.env.BLOB_READ_WRITE_TOKEN,
    required: false, // Optional for development
  },
  auth: {
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  app: {
    name: "ProfileDash",
    description: "Role-based profile management system",
  },
}

export function validateConfig() {
  const errors: string[] = []

  if (!config.database.url) {
    errors.push("DATABASE_URL environment variable is required")
  }

  if (config.database.url && !isValidDatabaseUrl(config.database.url)) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string")
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`)
  }
}

function isValidDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "postgresql:" || parsed.protocol === "postgres:"
  } catch {
    return false
  }
}

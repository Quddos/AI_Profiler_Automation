const crypto = require("crypto")

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// Generate hash for admin@123
const adminHash = hashPassword("admin@123")
console.log("Use this hash for the admin user:")
console.log(adminHash)

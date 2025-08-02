const crypto = require("crypto")

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

const adminPassword = hashPassword("admin@123")
console.log("Admin password hash:", adminPassword)

// Update the user with the correct hash
console.log(`
UPDATE users 
SET password_hash = '${adminPassword}' 
WHERE email = 'admin@qudmeet.click';
`)

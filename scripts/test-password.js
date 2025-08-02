const bcrypt = require("bcryptjs")

async function testPassword() {
  const password = "admin@123"
  const storedHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2"

  console.log("Testing password:", password)
  console.log("Against hash:", storedHash)

  try {
    const isValid = await bcrypt.compare(password, storedHash)
    console.log("Password valid:", isValid)

    // Also test creating a new hash
    const newHash = await bcrypt.hash(password, 12)
    console.log("New hash:", newHash)

    const newHashValid = await bcrypt.compare(password, newHash)
    console.log("New hash valid:", newHashValid)
  } catch (error) {
    console.error("Error:", error)
  }
}

testPassword()

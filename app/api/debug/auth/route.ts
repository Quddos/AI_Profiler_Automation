import { NextResponse } from "next/server"
import { getUserByEmail, verifyPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await getUserByEmail(email)
    const userFound = !!user
    let passwordValid = false
    let hashType = "N/A"

    if (user) {
      passwordValid = await verifyPassword(password, user.password_hash)
      hashType = user.password_hash.startsWith("$2a$") ? "bcrypt" : "plaintext"
    }

    return NextResponse.json({
      userFound,
      passwordValid,
      hashType,
      email,
      providedPassword: password,
      storedHash: user ? user.password_hash : "N/A",
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

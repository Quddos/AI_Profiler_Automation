import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("=== DEBUG AUTH ===")
    console.log("Email:", email)
    console.log("Password:", password)

    const user = await getUserByEmail(email)
    console.log("User found:", !!user)

    if (user) {
      console.log("User ID:", user.id)
      console.log("User name:", user.name)
      console.log("User role:", user.role)
      console.log("Stored password:", user.password_hash)

      const isValid = await verifyPassword(password, user.password_hash)
      console.log("Password valid:", isValid)

      return NextResponse.json({
        userFound: !!user,
        passwordValid: isValid,
        storedPassword: user.password_hash,
        providedPassword: password,
        hashType: "plain text",
      })
    }

    return NextResponse.json({
      userFound: false,
      passwordValid: false,
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

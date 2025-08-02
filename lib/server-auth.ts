import "server-only"
import { getCurrentUser, deleteSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getAuthenticatedUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function getAuthenticatedAdmin() {
  const user = await getCurrentUser()
  if (!user || !["admin", "superadmin"].includes(user.role)) {
    redirect("/dashboard") // Redirect to user dashboard if not admin/superadmin
  }
  return user
}

export async function logoutUser() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value
  if (sessionId) {
    await deleteSession(sessionId)
    cookieStore.delete("session-id")
  }
  redirect("/login")
}

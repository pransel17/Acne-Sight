import { NextRequest, NextResponse } from "next/server"
import { destroySession, getCurrentUser, logAudit } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (user) {
      await logAudit(
        user.id,
        "LOGOUT",
        "user",
        user.id,
        null,
        null,
        request.headers.get("x-forwarded-for") || request.ip,
        request.headers.get("user-agent") || undefined
      )
    }

    await destroySession()

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword, createSession, logAudit } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash, first_name, last_name, role, is_active, email_verified
      FROM users
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)
    if (!passwordValid) {
      // Log failed login attempt
      await logAudit(
        null,
        "LOGIN_FAILED",
        "user",
        user.id,
        null,
        null,
        request.headers.get("x-forwarded-for") || request.ip,
        request.headers.get("user-agent") || undefined
      )

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create session
    await createSession(
      user.id,
      request.headers.get("x-forwarded-for") || request.ip,
      request.headers.get("user-agent") || undefined
    )

    // Log successful login
    await logAudit(
      user.id,
      "LOGIN_SUCCESS",
      "user",
      user.id,
      null,
      { role: user.role },
      request.headers.get("x-forwarded-for") || request.ip,
      request.headers.get("user-agent") || undefined
    )

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}

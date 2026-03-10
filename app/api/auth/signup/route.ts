import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, createSession, logAudit } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    const { firstName, lastName, email, password, role, licenseNumber } =
      await request.json()

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await sql`
      INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        license_number, email_verified, is_active
      )
      VALUES (
        ${email.toLowerCase()},
        ${passwordHash},
        ${firstName},
        ${lastName},
        ${role},
        ${licenseNumber || null},
        false,
        true
      )
      RETURNING id, email, first_name, last_name, role
    `

    const newUser = result[0]

    // Create session
    await createSession(
      newUser.id,
      request.headers.get("x-forwarded-for") || request.ip,
      request.headers.get("user-agent") || undefined
    )

    // Log signup
    await logAudit(
      newUser.id,
      "SIGNUP",
      "user",
      newUser.id,
      null,
      { role: newUser.role, email: newUser.email },
      request.headers.get("x-forwarded-for") || request.ip,
      request.headers.get("user-agent") || undefined
    )

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}

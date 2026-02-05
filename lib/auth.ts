import { cookies } from "next/headers"
import { sql, type User } from "./db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

const SESSION_COOKIE_NAME = "acnesight_session"
const SESSION_DURATION_DAYS = 7

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate secure session token
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

// Create a new session
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  await sql`
    INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${ipAddress || null}, ${userAgent || null})
  `

  // Set the session cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

// Get current session and user
export async function getCurrentUser(): Promise<Omit<User, "password_hash"> | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    const result = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.avatar_url, 
             u.phone, u.license_number, u.specialization, u.is_active, 
             u.email_verified, u.created_at, u.updated_at
      FROM users u
      INNER JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ${sessionToken}
        AND s.expires_at > NOW()
        AND u.is_active = true
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as Omit<User, "password_hash">
  } catch {
    return null
  }
}

// Validate session token (for API routes)
export async function validateSession(token: string): Promise<Omit<User, "password_hash"> | null> {
  try {
    const result = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.avatar_url, 
             u.phone, u.license_number, u.specialization, u.is_active, 
             u.email_verified, u.created_at, u.updated_at
      FROM users u
      INNER JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
        AND u.is_active = true
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as Omit<User, "password_hash">
  } catch {
    return null
  }
}

// Destroy session (logout)
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await sql`DELETE FROM sessions WHERE token = ${sessionToken}`
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

// Delete expired sessions (cleanup job)
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await sql`
    DELETE FROM sessions WHERE expires_at < NOW()
    RETURNING id
  `
  return result.length
}

// Log audit event
export async function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await sql`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
    VALUES (
      ${userId}, 
      ${action}, 
      ${entityType}, 
      ${entityId}, 
      ${oldValues ? JSON.stringify(oldValues) : null}::jsonb, 
      ${newValues ? JSON.stringify(newValues) : null}::jsonb, 
      ${ipAddress || null}, 
      ${userAgent || null}
    )
  `
}

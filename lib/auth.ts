import { cookies } from "next/headers"
import { sql, type User } from "./db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import jwt from "jsonwebtoken"

const SESSION_COOKIE_NAME = "acnesight_session"
const SESSION_DURATION_DAYS = 7


const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-in-production"


export async function getCurrentUser(): Promise<Omit<User, "password_hash"> | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      console.log(" Auth Debug: No browser cookie found.");
      return null;
    }

    if (sql) {
      const tokenCheck = await sql`SELECT * FROM sessions WHERE token = ${sessionToken}`;
      if (tokenCheck.length > 0) {
        console.log(" Auth Debug: Token found in sessions table!");
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
        if (result.length > 0) {
          console.log(" Auth Debug: Login successful (sessions table)!");
          return result[0] as Omit<User, "password_hash">;
        }
      }
    }

    // Fallback: Validate JWT token directly
    console.log(" Auth Debug: No session in DB, trying JWT validation...");
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
        sub: string
        email: string
        role: string
      }
      
      if (!decoded.sub) {
        console.log(" Auth Debug: JWT invalid - no subject");
        return null;
      }

      // Fetch user from database using the JWT subject (user_id)
      if (sql) {
        const result = await sql`
          SELECT id, email, first_name, last_name, role, avatar_url, 
                 phone, license_number, specialization, is_active, 
                 email_verified, created_at, updated_at
          FROM users 
          WHERE id = ${decoded.sub}
            AND is_active = true
        `
        
        if (result.length === 0) {
          console.log(" Auth Debug: User not found or inactive");
          return null;
        }

        console.log(" Auth Debug: Login successful (JWT validation)!");
        return result[0] as Omit<User, "password_hash">;
      } else {
        // No database - return user data from JWT only
        console.log(" Auth Debug: Login successful (JWT only, no DB)!");
        return {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role as User["role"],
          first_name: "User",
          last_name: "",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        } as Omit<User, "password_hash">;
      }
    } catch (jwtError) {
      console.log(" Auth Debug: JWT validation failed:", jwtError);
      return null;
    }

  } catch (error) {
    console.error(" Auth Debug: Error during authentication:", error);
    return null;
  }
}
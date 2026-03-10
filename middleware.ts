import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "acnesight_session"

// Routes that don't require authentication
const publicRoutes = ["/auth/login", "/auth/signup"]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  // If no session token and trying to access protected route, redirect to login
  if (!sessionToken && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If has session token and trying to access auth routes, redirect to dashboard
  if (sessionToken && (pathname.startsWith("/auth"))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

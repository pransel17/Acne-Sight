import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "acnesight_session"

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // 1. If they ARE at the login page and have a token, DO NOT force them away.
  // This allows the Dashboard to kick them back to login if the token is expired.
  if (pathname.startsWith("/auth")) {
    return NextResponse.next() 
  }

  // 2. If they are trying to see protected pages and have NO token at all, send to login.
  if (!sessionToken && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
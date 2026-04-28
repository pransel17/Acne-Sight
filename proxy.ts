import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "acnesight_session"

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // 1. Allow public auth pages (Login/Signup)
  if (pathname.startsWith("/auth")) {
    return NextResponse.next() 
  }

  // 2. STRICT SAFETY: If no token exists, force them to login
  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url)
    
    // Pass the original URL they wanted as a "callback" so they can return later
    loginUrl.searchParams.set("from", pathname)
    
    const response = NextResponse.redirect(loginUrl)

    // SAFETY LAYER: When kicking them out, ensure the browser doesn't 
    // keep any old session headers in its temporary cache
    response.headers.set("x-middleware-cache", "no-cache")
    
    return response
  }

  // 3. User is authenticated, let them through
  return NextResponse.next()
}

export const config = {
  // Matches everything EXCEPT static files and the API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
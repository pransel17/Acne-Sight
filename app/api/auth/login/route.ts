import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Talk to FastAPI
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // 2. Handle FastAPI errors
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Invalid credentials" },
        { status: response.status }
      )
    }

    // 3. SUCCESS! Prepare the response
    const res = NextResponse.json(data)

    // 4. SET THE COOKIE so your middleware knows you are logged in
    const token = data.access_token || "active-session"

    res.cookies.set({
      name: "acnesight_session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day expiration
    })

    return res

  } catch (error) {
    console.error("Connection to FastAPI failed:", error)
    return NextResponse.json(
      { error: "Could not connect to the backend server. Is it running?" },
      { status: 500 }
    )
  }
}
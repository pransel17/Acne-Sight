import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()

    const pythonReadyBody = {

      username: rawBody.username || rawBody.email.split('@')[0], 
      email: rawBody.email,
      password: rawBody.password,

      first_name: rawBody.firstName || rawBody.first_name || "", 
      last_name: rawBody.lastName || rawBody.last_name || ""
    }


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pythonReadyBody),
    })

    const data = await response.json()

    if (!response.ok) {
      let errorMessage = "Failed to create account"
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail[0].msg
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        }
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("Connection to FastAPI failed during signup:", error)
    return NextResponse.json(
      { error: "Could not connect to the backend server." },
      { status: 500 }
    )
  }
}
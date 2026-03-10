import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login - ACNE SIGHT",
  description: "Clinician login to ACNE SIGHT system",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">ACNE SIGHT</h1>
          <p className="text-muted-foreground">Clinical Acne Detection System</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-primary hover:underline font-medium">
            Sign up here
          </a>
        </div>
      </div>
    </div>
  )
}

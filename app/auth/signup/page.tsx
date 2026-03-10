import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign Up - ACNE SIGHT",
  description: "Create a clinician account for ACNE SIGHT system",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">ACNE SIGHT</h1>
          <p className="text-muted-foreground">Create Your Account</p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary hover:underline font-medium">
            Login here
          </a>
        </div>
      </div>
    </div>
  )
}

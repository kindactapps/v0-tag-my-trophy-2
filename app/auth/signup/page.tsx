import type { Metadata } from "next"
import SignupPageClient from "./SignupPageClient"

export const metadata: Metadata = {
  title: "Sign Up - Tag My Trophy",
  description: "Create your account to start building digital memory collections",
}

export default function SignupPage() {
  return <SignupPageClient />
}

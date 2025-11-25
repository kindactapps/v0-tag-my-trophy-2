import type { Metadata } from "next"
import LoginPageClient from "./LoginPageClient"

export const metadata: Metadata = {
  title: "Admin Login - Tag My Trophy",
  description: "Admin login for Tag My Trophy business management.",
}

export default function LoginPage() {
  return <LoginPageClient />
}

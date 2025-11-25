import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Unauthorized Access - Tag My Trophy",
  description: "You don't have permission to access this page.",
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#c44c3a]/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#c44c3a]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Access Denied</CardTitle>
            <CardDescription className="text-[#6b5b47]">
              You don't have permission to access this page. Please contact an administrator if you believe this is an
              error.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full border-[#e5d5c8] hover:bg-[#f5f0e8] bg-transparent">
              <Link href="/auth/login">Sign In with Different Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import Link from "next/link"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#e5d5c8] shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-[#2c2c2c]">Authentication Error</CardTitle>
          <CardDescription className="text-[#6b5b47]">
            We couldn't complete your sign-in. This can happen if the link expired or was already used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Common reasons:</strong>
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>The sign-in link expired (they're only valid for a short time)</li>
              <li>The link was already used</li>
              <li>Your browser blocked the authentication</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-[#6b5b47]">
            Need help?{" "}
            <a href="mailto:support@tagmytrophy.com" className="text-[#c44c3a] hover:underline">
              Contact Support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

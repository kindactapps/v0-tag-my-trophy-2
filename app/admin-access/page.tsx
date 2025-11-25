import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminAccessPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2c2c2c] mb-2">Admin Access</h1>
          <p className="text-[#666] text-sm">Access the Tag My Trophy admin panel</p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-full bg-[#c44c3a] text-white hover:bg-[#a63d2e] font-semibold py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Link href="/auth/admin">Admin Login</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-[#c44c3a] text-[#c44c3a] hover:bg-[#c44c3a] hover:text-white py-3 rounded-lg bg-transparent"
          >
            <Link href="/auth/login">Member Login</Link>
          </Button>

          <Button asChild variant="ghost" className="w-full text-[#666] hover:text-[#c44c3a] py-3">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

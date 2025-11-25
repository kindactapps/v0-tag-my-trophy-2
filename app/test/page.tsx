export default function TestPage() {
  console.log("[v0] Test page rendering")

  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-black mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, the Next.js app is working!</p>
        <div className="mt-4">
          <a href="/auth/admin" className="text-blue-500 underline">
            Go to Admin Login
          </a>
        </div>
      </div>
    </div>
  )
}

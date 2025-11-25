import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-[#c44c3a]/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-[#c44c3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.33l-.147.083A7.994 7.994 0 0112 21.001z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#2c2c2c] mb-4">Story Not Found</h1>
        <p className="text-[#2c2c2c]/70 mb-8">
          This story doesn't exist or may have been removed. Check the QR code and try again.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#c44c3a] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#a63d2e] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

import { LazyImage } from "@/components/ui/lazy-image"

export default function FooterSection() {
  return (
    <footer className="bg-[#2c2c2c] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <LazyImage
                src="/logo.png"
                alt="Tag My Trophy Logo"
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                priority={false}
              />
            </div>
            <p className="text-gray-300">
              Preserve your memories with durable QR tags that connect to digital stories.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <p>support@tagmytrophy.com</p>
              <p>1-800-TAG-MEMO</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="space-y-2 text-gray-300">
              <p>Facebook</p>
              <p>Instagram</p>
              <p>Twitter</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Tag My Trophy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

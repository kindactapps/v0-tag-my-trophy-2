import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PricingSection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg sm:text-xl text-[#666] mb-8">Everything you need to preserve and share your memories</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-xl relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                Best Value
              </div>
            </div>
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-2">Complete Memory Package</h3>
                <div className="text-3xl sm:text-4xl font-bold text-purple-900 mb-2">$29.99</div>
                <div className="text-purple-700">One-time purchase</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">Durable metal QR tag</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">Strong adhesive backing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">
                    <strong>1st year hosting FREE</strong>, then $9.99/year
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">
                    <strong>200 photos</strong> per experience
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">
                    <strong>1 hour of video</strong> per experience
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">Easy sharing with anyone</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">Weather-resistant design</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 text-lg flex-shrink-0">✓</span>
                  <span className="text-purple-900">Priority support</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl min-h-[44px]"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🌐</span>
              <h4 className="text-lg font-semibold text-green-900">Hosting Included</h4>
            </div>
            <p className="text-green-800">
              Your first year of hosting is <strong>completely FREE</strong>. After that, keep your memory page live for
              just <strong>$9.99 per year</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

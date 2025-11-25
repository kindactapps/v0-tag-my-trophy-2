"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrivacyManager } from "@/lib/privacy"
import { Shield, Calendar, Mail, Phone } from "lucide-react"

export default function PrivacyPolicy() {
  const policyContent = PrivacyManager.getPrivacyPolicyContent()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-[#e8ddd0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2c2c2c]">
            <Shield className="h-6 w-6 text-[#c44c3a]" />
            Privacy Policy
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-[#6b5b47]">
            <Calendar className="h-4 w-4" />
            Last updated: {policyContent.lastUpdated}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-[#6b5b47] leading-relaxed">
              At Tag My Trophy, we are committed to protecting your privacy and ensuring the security of your personal
              information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our
              service.
            </p>
          </div>

          {policyContent.sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h2 className="text-xl font-semibold text-[#2c2c2c] border-b border-[#e8ddd0] pb-2">{section.title}</h2>
              <p className="text-[#6b5b47] leading-relaxed">{section.content}</p>
            </div>
          ))}

          <Card className="bg-[#f5f0e8] border-[#e8ddd0]">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[#2c2c2c] mb-4">Contact Us About Privacy</h3>
              <div className="space-y-3 text-sm text-[#6b5b47]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#c44c3a]" />
                  <span>privacy@tagmytrophy.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#c44c3a]" />
                  <span>1-800-TAG-TROPHY</span>
                </div>
                <p className="mt-3">
                  If you have any questions about this Privacy Policy or our data practices, please don't hesitate to
                  contact us. We're here to help and ensure your privacy is protected.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Your Rights Under GDPR</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Right to access your personal data</li>
              <li>• Right to rectify inaccurate data</li>
              <li>• Right to erase your data ("right to be forgotten")</li>
              <li>• Right to restrict processing</li>
              <li>• Right to data portability</li>
              <li>• Right to object to processing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

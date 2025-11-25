import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import ScrollToTop from "@/components/scroll-to-top"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "Tag My Trophy - Turn Physical Items Into Digital Memory Collections",
  description:
    "Transform your trophies, equipment, and keepsakes into interactive digital experiences with QR code tags.",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#2c2c2c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log("[v0] RootLayout rendering")

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased">
        <ScrollToTop />
        <main id="main-content">{children}</main>

        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("[v0] Layout script loaded");`,
          }}
        />
      </body>
    </html>
  )
}

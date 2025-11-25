"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[]
}

export default function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (segment === "qr-code") label = "QR Code"
      if (segment === "admin") label = "Admin"
      if (segment === "dashboard") label = "Dashboard"
      if (segment === "settings") label = "Settings"
      if (segment === "upload") label = "Upload"
      if (segment === "orders") label = "Orders"
      if (segment === "slugs") label = "Slugs"
      if (segment === "users") label = "Users"
      if (segment === "analytics") label = "Analytics"

      breadcrumbs.push({ label, href: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = items || generateBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="bg-[#f5f0e8] border-b border-[#e8ddd0] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-[#8b7355] mx-2" />}
              {index === 0 && <Home className="w-4 h-4 text-[#8b7355] mr-2" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-[#c44c3a] font-medium">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-[#2c2c2c] hover:text-[#c44c3a] transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

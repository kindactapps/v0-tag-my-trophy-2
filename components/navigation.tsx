"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import { useNewAdminAuth } from "@/lib/new-admin-auth"

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const Settings = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogOut = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const Menu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const QrCode = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="5" height="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="16" y="3" width="5" height="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="3" y="16" width="5" height="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="m13 13 3 3m0-3-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
)

const Edit = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

const Store = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M3 7l2.45-3.674A2 2 0 017.121 2h9.758a2 2 0 011.671.926L21 7M3 7h18M6 21V10h3v11m6 0V10h3v11"
    />
  </svg>
)

interface NavigationProps {
  isLoggedIn?: boolean
  isAdmin?: boolean
  user?: {
    name: string
    email: string
    avatar?: string
  }
  isStoryPage?: boolean
  storySlug?: string
}

export default function Navigation({
  isLoggedIn: isLoggedInProp,
  isAdmin: isAdminProp,
  user,
  isStoryPage = false,
  storySlug,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const { isAuthenticated: isAdminAuthenticated } = useNewAdminAuth()

  const isLoggedIn = isLoggedInProp ?? isAdminAuthenticated
  const isAdmin = isAdminProp ?? isAdminAuthenticated

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen])

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const isOnStoryPage = isStoryPage || pathname.startsWith("/story/")
  const currentStorySlug = storySlug || (isOnStoryPage ? pathname.split("/story/")[1] : null)

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()

    if (pathname === "/") {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      window.location.href = `/#${sectionId}`
    }
  }

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/slugs", label: "Slugs", icon: QrCode },
    { href: "/admin/stores", label: "Stores", icon: Store },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  const userNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/dashboard/upload", label: "Upload", icon: Upload },
    { href: "/dashboard/qr-code", label: "QR Code", icon: QrCode },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const handleLogout = () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    supabase.auth.signOut()

    localStorage.removeItem("user_session")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_type")

    window.location.href = "/auth/login"
  }

  return (
    <nav
      className="bg-white border-b border-border/30 sticky top-0 z-50 shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 animate-water-ripple" aria-label="Tag My Trophy - Home">
              <Image
                src="/logo.png"
                alt="Tag My Trophy Logo"
                width={56}
                height={56}
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
                priority
              />
              <span className="text-2xl font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tag My Trophy
              </span>
            </Link>
          </div>

          <div className="hidden md:block flex-1">
            <div className="flex items-center justify-center" role="menubar">
              {isLoggedIn && isAdmin ? (
                adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-6 py-3 mx-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl hover:bg-primary/10 hover:scale-105 hover:shadow-md ${
                        isActiveLink(item.href)
                          ? "text-primary bg-primary/15 border-b-2 border-primary shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      role="menuitem"
                      aria-current={isActiveLink(item.href) ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="sr-only">{item.label} - </span>
                      {item.label}
                    </Link>
                  )
                })
              ) : isLoggedIn ? (
                userNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-6 py-3 mx-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl hover:bg-primary/10 hover:scale-105 hover:shadow-md ${
                        isActiveLink(item.href)
                          ? "text-primary bg-primary/15 border-b-2 border-primary shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      role="menuitem"
                      aria-current={isActiveLink(item.href) ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="sr-only">{item.label} - </span>
                      {item.label}
                    </Link>
                  )
                })
              ) : (
                <>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground px-6 py-3 mx-2 text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl hover:bg-primary/10 hover:scale-105"
                    role="menuitem"
                  >
                    Home
                  </Link>
                  <a
                    href="/#how-it-works"
                    className="text-muted-foreground hover:text-foreground px-6 py-3 mx-2 text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl hover:bg-primary/10 hover:scale-105"
                    role="menuitem"
                    onClick={(e) => handleSectionClick(e, "how-it-works")}
                  >
                    How It Works
                  </a>
                  <a
                    href="/#browse-stories"
                    className="text-muted-foreground hover:text-foreground px-6 py-3 mx-2 text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl hover:bg-primary/10 hover:scale-105"
                    role="menuitem"
                    onClick={(e) => handleSectionClick(e, "browse-stories")}
                  >
                    Browse Stories
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isOnStoryPage && !isLoggedIn && currentStorySlug && (
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Link
                  href={`/auth/login?redirect=/dashboard`}
                  className="flex items-center gap-2"
                  aria-label="Login to edit this story"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Login to Edit</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              </Button>
            )}

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-primary/10 rounded-xl transition-all duration-300 hover:scale-105"
                    aria-label={`User menu for ${user.name}`}
                  >
                    <div className="w-10 h-10 bg-lake-gradient rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg animate-water-ripple">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-foreground font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          User Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isOnStoryPage ? (
              <Button
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-lake-gradient hover:text-primary-foreground bg-transparent font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                asChild
              >
                <Link href="/auth/login">Member Login</Link>
              </Button>
            ) : null}

            <Button
              variant="ghost"
              className="md:hidden min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {mobileMenuOpen ? (
                <>
                  <X className="h-6 w-6 text-foreground" />
                  <span className="sr-only">Close menu</span>
                </>
              ) : (
                <>
                  <Menu className="h-6 w-6 text-foreground" />
                  <span className="sr-only">Open menu</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isLoggedIn && isAdmin ? (
                adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isActiveLink(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                      aria-current={isActiveLink(item.href) ? "page" : undefined}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })
              ) : isLoggedIn ? (
                userNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isActiveLink(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                      aria-current={isActiveLink(item.href) ? "page" : undefined}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })
              ) : (
                <>
                  <Link
                    href="/"
                    className={`block px-4 py-3 text-base font-medium rounded-md transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isActiveLink("/")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                    aria-current={isActiveLink("/") ? "page" : undefined}
                  >
                    Home
                  </Link>
                  <a
                    href="/#how-it-works"
                    className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={(e) => {
                      setMobileMenuOpen(false)
                      handleSectionClick(e, "how-it-works")
                    }}
                    role="menuitem"
                  >
                    How It Works
                  </a>
                  <a
                    href="/#browse-stories"
                    className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={(e) => {
                      setMobileMenuOpen(false)
                      handleSectionClick(e, "browse-stories")
                    }}
                    role="menuitem"
                  >
                    Browse Stories
                  </a>
                </>
              )}

              {!isLoggedIn && (
                <div className="pt-4 border-t border-border/50">
                  {isOnStoryPage && currentStorySlug ? (
                    <Link
                      href={`/auth/login?redirect=/dashboard`}
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors mb-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                      aria-label="Login to edit this story"
                    >
                      <Edit className="w-5 h-5" />
                      Login to Edit
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="block px-4 py-3 text-base font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                    >
                      Member Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

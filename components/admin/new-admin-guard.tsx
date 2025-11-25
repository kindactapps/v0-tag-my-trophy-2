"use client"

import type React from "react"

interface NewAdminGuardProps {
  children: React.ReactNode
}

export function NewAdminGuard({ children }: NewAdminGuardProps) {
  // TODO: Re-enable authentication before production deployment
  // const { isAuthenticated, loading } = useNewAdminAuth()

  // console.log("[v0] NewAdminGuard - loading:", loading, "isAuthenticated:", isAuthenticated)

  // // Show loading state
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c44c3a] mx-auto mb-4"></div>
  //         <p className="text-[#6b5b47]">Verifying admin access...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!isAuthenticated) {
  //   console.log("[v0] NewAdminGuard - not authenticated, showing login prompt")
  //   return (
  //     <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
  //       <Card className="max-w-md w-full shadow-lg border-0 bg-white">
  //         <CardHeader className="text-center pb-6">
  //           <div className="w-16 h-16 mx-auto mb-4 bg-[#c44c3a]/10 rounded-full flex items-center justify-center">
  //             <Shield className="w-8 h-8 text-[#c44c3a]" />
  //           </div>
  //           <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Authentication Required</CardTitle>
  //           <CardDescription className="text-[#6b5b47]">
  //             You must be signed in as an admin to access this area.
  //           </CardDescription>
  //         </CardHeader>

  //         <CardContent className="space-y-4">
  //           <Button asChild className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
  //             <Link href="/auth/admin">Sign In as Admin</Link>
  //           </Button>
  //           <Button asChild variant="outline" className="w-full border-[#e5d5c8] hover:bg-[#f5f0e8] bg-transparent">
  //             <Link href="/">
  //               <ArrowLeft className="w-4 h-4 mr-2" />
  //               Return to Home
  //             </Link>
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  console.log("[v0] NewAdminGuard - authentication disabled for development, rendering children")
  return <>{children}</>
}

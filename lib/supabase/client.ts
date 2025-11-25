import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof document !== "undefined") {
              const value = document.cookie
                .split("; ")
                .find((row) => row.startsWith(`${name}=`))
                ?.split("=")[1]
              return value
            }
            return undefined
          },
          set(name: string, value: string, options: any) {
            if (typeof document !== "undefined") {
              let cookieString = `${name}=${value}`
              cookieString += `; path=${options?.path || "/"}`
              cookieString += `; max-age=${options?.maxAge || 86400}` // 24 hours default
              if (options?.domain) cookieString += `; domain=${options.domain}`
              if (options?.secure !== false) cookieString += "; secure" // Default to secure
              if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`
              else cookieString += "; samesite=lax" // Default to lax for better compatibility
              document.cookie = cookieString
            }
          },
          remove(name: string, options: any) {
            if (typeof document !== "undefined") {
              let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
              cookieString += `; path=${options?.path || "/"}`
              if (options?.domain) cookieString += `; domain=${options.domain}`
              document.cookie = cookieString
            }
          },
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  }
  return supabaseClient
}

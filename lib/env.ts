// Environment variable validation and access
function getEnvVar(key: string, required = true): string {
  const value = process.env[key]

  if (required && !value) {
    // Only throw in production for required vars
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    console.warn(`Warning: Missing environment variable: ${key}`)
  }

  return value || ""
}

export const env = {
  // Supabase
  SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", false),

  // Stripe
  STRIPE_SECRET_KEY: getEnvVar("STRIPE_SECRET_KEY"),
  STRIPE_PUBLISHABLE_KEY: getEnvVar("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnvVar("STRIPE_WEBHOOK_SECRET", false),
  STRIPE_ANNUAL_HOSTING_PRICE_ID: getEnvVar("NEXT_PUBLIC_STRIPE_ANNUAL_HOSTING_PRICE_ID", false),

  // App
  SITE_URL: getEnvVar("NEXT_PUBLIC_SITE_URL", false) || "https://tagmytrophy.com",

  // Auth
  ADMIN_JWT_SECRET: getEnvVar("ADMIN_JWT_SECRET", false) || getEnvVar("NEXTAUTH_SECRET", false),

  // Feature flags
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
}

export default env

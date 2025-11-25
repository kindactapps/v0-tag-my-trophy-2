# Required Environment Variables

This document lists all required environment variables for the Tag My Trophy application.

## Stripe Configuration (Payment Processing)

### Required for Production
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_live_` or `pk_test_`)
- `NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID` - The Stripe Price ID for the $29.99 one-time QR tag purchase
- `NEXT_PUBLIC_STRIPE_ANNUAL_HOSTING_PRICE_ID` - The Stripe Price ID for the $99/year annual hosting plan
- `STRIPE_SUBSCRIPTION_PRICE_ID` - The Stripe Price ID for the $9.99/year recurring subscription (you already have this!)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (starts with `whsec_`)

### How to Get These Values:

1. **NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID**:
   - Go to Stripe Dashboard → Products
   - Click on your $29.99 one-time price row
   - Copy the Price ID (starts with `price_...`)

2. **NEXT_PUBLIC_STRIPE_ANNUAL_HOSTING_PRICE_ID**:
   - Go to Stripe Dashboard → Products
   - Click on your $99/year annual hosting plan price row
   - Copy the Price ID (starts with `price_...`)

3. **STRIPE_SUBSCRIPTION_PRICE_ID**:
   - Already configured! Uses your $9.99/year recurring price

4. **STRIPE_WEBHOOK_SECRET**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `customer.subscription.*`, `invoice.*`
   - Copy the webhook signing secret (starts with `whsec_...`)

## Supabase Configuration (Database & Auth)

### Already Configured
- `SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin access)
- `SUPABASE_JWT_SECRET` - JWT secret for Supabase auth

## PostgreSQL Configuration (via Supabase)

### Already Configured
- `POSTGRES_URL` - PostgreSQL connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible PostgreSQL URL
- `POSTGRES_URL_NON_POOLING` - Direct PostgreSQL connection (non-pooled)
- `POSTGRES_HOST` - PostgreSQL host
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DATABASE` - PostgreSQL database name

## Admin Configuration

### Already Configured
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password
- `NEXT_PUBLIC_ADMIN_EMAIL` - Public admin email for display

## NextAuth Configuration

### Already Configured
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption
- `NEXTAUTH_URL` - Base URL for NextAuth callbacks
- `CSRF_SECRET` - CSRF token secret

## Site Configuration

### Already Configured
- `NEXT_PUBLIC_SITE_URL` - Public site URL (e.g., https://tagmytrophy.com)

## Email Configuration (Resend)

- `RESEND_API_KEY` - Your Resend API key for sending transactional emails
- `FROM_EMAIL` - Verified sender email address (e.g., orders@tagmytrophy.com)

---

## Action Required

You need to add the following environment variables to your Vercel project:

1. **STRIPE_WEBHOOK_SECRET** - Create a webhook endpoint in Stripe Dashboard → Developers → Webhooks
2. **RESEND_API_KEY** - Sign up at resend.com and get your API key
3. **FROM_EMAIL** - Your verified sender email address

### Already Configured:
- STRIPE_SECRET_KEY ✓
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✓
- NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID ✓
- NEXT_PUBLIC_STRIPE_ANNUAL_HOSTING_PRICE_ID ✓
- STRIPE_SUBSCRIPTION_PRICE_ID ✓
- All Supabase/Postgres variables ✓
- Admin credentials ✓
- Site URL ✓

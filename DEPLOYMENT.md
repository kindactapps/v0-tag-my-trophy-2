# Tag My Trophy - Deployment Checklist

## Environment Variables Required

### Supabase
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

### Stripe
- [ ] STRIPE_SECRET_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_STRIPE_ANNUAL_HOSTING_PRICE_ID

### App Config
- [ ] NEXT_PUBLIC_SITE_URL=https://tagmytrophy.com
- [ ] ADMIN_JWT_SECRET (generate with: openssl rand -base64 32)
- [ ] NEXTAUTH_SECRET
- [ ] CSRF_SECRET

### Admin Access
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD

## Pre-Deployment Checks

- [x] All console.log statements removed or wrapped in debug utility
- [x] Test pages removed or protected
- [x] All API routes have authentication
- [x] Stripe API versions are consistent (2024-06-20)
- [x] Admin sessions use JWT instead of in-memory Map
- [x] TypeScript types properly defined (no any)
- [ ] Database migrations applied
- [ ] Environment variables set in Vercel

## Database Setup

Run the SQL scripts in order:
1. `scripts/complete-database-schema.sql` - Core tables
2. `scripts/08_create_subscriptions_table.sql` - Subscriptions
3. `scripts/09_create_pricing_config_table.sql` - Pricing config
4. Additional theme/field scripts as needed

## Post-Deployment Checks

- [ ] Homepage loads correctly
- [ ] OAuth login works (if configured)
- [ ] Password reset works
- [ ] Stripe checkout works
- [ ] Webhook events are received at /api/webhooks/stripe
- [ ] QR code generation works
- [ ] Story pages load correctly
- [ ] Admin dashboard accessible
- [ ] File uploads work (Supabase storage)

## Stripe Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Domain Setup (Cloudflare)

1. In Cloudflare DNS, add CNAME record:
   - Name: `@` or subdomain
   - Target: `cname.vercel-dns.com`
   - Proxy status: DNS only (orange cloud OFF)

2. In Vercel project settings > Domains:
   - Add your domain
   - Vercel will auto-provision SSL

## Monitoring

- Check Vercel Analytics for performance
- Monitor Stripe Dashboard for payment issues
- Review Supabase logs for database errors

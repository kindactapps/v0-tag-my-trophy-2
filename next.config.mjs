/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // {
          //   key: 'Content-Security-Policy',
          //   value: [
          //     "default-src 'self'",
          //     "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com blob:",
          //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          //     "img-src 'self' data: https: blob:",
          //     "font-src 'self' https://fonts.gstatic.com blob:",
          //     "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com",
          //     "media-src 'self' blob:",
          //     "object-src 'none'",
          //     "base-uri 'self'",
          //     "form-action 'self'",
          //     "frame-ancestors 'none'",
          //     "upgrade-insecure-requests"
          //   ].join('; ')
          // },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ],
      },
    ]
  },

  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/auth/admin',
        permanent: false,
      },
    ]
  },
}

export default nextConfig

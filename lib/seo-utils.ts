export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  noIndex?: boolean
  canonical?: string
  ogImage?: string
  ogType?: "website" | "article" | "profile"
}

export const siteConfig = {
  name: "Tag My Trophy",
  description:
    "Transform your trophies, equipment, and keepsakes into interactive digital experiences with QR code tags.",
  url: "https://tagmytrophy.com",
  ogImage: "/og-image.jpg",
  twitter: "@tagmytrophy",
}

export function generatePageTitle(title: string, includeBase = true): string {
  if (!includeBase) return title
  return `${title} | ${siteConfig.name}`
}

export function generateMetadata(config: SEOConfig) {
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: config.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: config.title,
      description: config.description,
      type: config.ogType || "website",
      url: config.canonical ? `${siteConfig.url}${config.canonical}` : undefined,
      images: config.ogImage
        ? [
            {
              url: config.ogImage,
              width: 1200,
              height: 630,
              alt: config.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: config.ogImage ? [config.ogImage] : undefined,
    },
    alternates: config.canonical
      ? {
          canonical: config.canonical,
        }
      : undefined,
  }
}

export const pageConfigs = {
  home: {
    title: "Turn Physical Items Into Digital Memory Collections",
    description:
      "Transform your trophies, equipment, and keepsakes into interactive digital experiences with QR code tags. Perfect for outdoor enthusiasts, sports fans, and memory keepers.",
    keywords: [
      "QR code tags",
      "digital memory collection",
      "trophy memories",
      "sports memorabilia",
      "outdoor adventures",
    ],
    canonical: "/",
  },
  dashboard: {
    title: "Dashboard - Manage Your Memory Collections",
    description:
      "Manage your digital memory collections, upload new photos and stories, and track views on your Tag My Trophy QR code stories.",
    keywords: ["dashboard", "memory management", "digital collection", "QR code stories"],
    noIndex: true,
  },
  login: {
    title: "Login - Access Your Memory Collections",
    description:
      "Welcome back, storyteller. Sign in to access your digital memory collections and manage your Tag My Trophy QR code stories.",
    keywords: ["login", "sign in", "memory collections", "digital stories"],
    noIndex: true,
    canonical: "/auth/login",
  },
  signup: {
    title: "Sign Up - Start Your Memory Collection Journey",
    description:
      "Create your Tag My Trophy account and start building your digital memory collection. Transform your physical items into interactive QR code experiences.",
    keywords: ["sign up", "create account", "memory collection", "QR code stories"],
    noIndex: true,
    canonical: "/auth/signup",
  },
  settings: {
    title: "Settings - Manage Your Account",
    description:
      "Manage your Tag My Trophy account settings, preferences, and privacy options for your digital memory collections.",
    keywords: ["settings", "account management", "preferences", "privacy"],
    noIndex: true,
    canonical: "/dashboard/settings",
  },
  upload: {
    title: "Upload Memories - Add to Your Collection",
    description:
      "Upload photos, videos, and stories to your Tag My Trophy collection. Share your memories with the world through QR code experiences.",
    keywords: ["upload", "add memories", "photos", "videos", "stories"],
    noIndex: true,
    canonical: "/dashboard/upload",
  },
  qrCode: {
    title: "QR Code - Share Your Memory Collection",
    description:
      "Download and share your Tag My Trophy QR code. Let others scan to view your digital memory collection instantly.",
    keywords: ["QR code", "share memories", "digital collection", "memory sharing"],
    noIndex: true,
    canonical: "/dashboard/qr-code",
  },
  forgotPassword: {
    title: "Reset Password - Recover Your Account",
    description:
      "Reset your Tag My Trophy password to regain access to your digital memory collections and QR code stories.",
    keywords: ["reset password", "forgot password", "account recovery"],
    noIndex: true,
    canonical: "/auth/forgot-password",
  },
  claim: {
    title: "Claim Your Story Tag - Start Your Journey",
    description:
      "Claim this QR tag and start creating your digital memory collection. Transform your physical items into interactive experiences.",
    keywords: ["claim tag", "QR code claim", "start collection", "memory journey"],
    canonical: "/claim",
  },
  edit: {
    title: "Edit Your Story - Manage Your Memories",
    description:
      "Edit and manage your Tag My Trophy story collection. Add new memories, update existing content, and customize your experience.",
    keywords: ["edit story", "manage memories", "update collection", "customize"],
    noIndex: true,
  },
}

export function getStoryMetadata(storyData: any, slug: string) {
  if (!storyData.claimed) {
    return generateMetadata({
      title: "Unclaimed Story - Waiting to be Told",
      description:
        "This QR tag is waiting for someone to claim it and share their story. Scan the tag to get started with your digital memory collection.",
      keywords: ["unclaimed story", "QR tag", "claim story", "digital memories"],
      canonical: `/story/${slug}`,
      ogImage: "/og-unclaimed-story.jpg",
    })
  }

  const photoCount = storyData.memories?.filter((m: any) => m.type === "photo").length || 0
  const storyCount = storyData.memories?.filter((m: any) => m.type === "story").length || 0
  const firstPhoto = storyData.memories?.find((m: any) => m.type === "photo")

  return generateMetadata({
    title: `${storyData.owner.name} - Digital Memory Collection`,
    description: `${storyData.owner.bio} | ${photoCount} photos and ${storyCount} stories shared. View this digital memory collection created with Tag My Trophy.`,
    keywords: [storyData.owner.name, "digital memories", "QR code story", "memory collection", "personal stories"],
    canonical: `/story/${slug}`,
    ogImage: firstPhoto?.url || "/og-default-story.jpg",
    ogType: "profile",
  })
}

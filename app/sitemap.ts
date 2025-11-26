import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tagmytrophy.com"
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/claim`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  // Fetch claimed stories from database
  const { data: claimedSlugs } = await supabase
    .from("qr_slugs")
    .select("slug, updated_at")
    .eq("is_claimed", true)
    .eq("is_active", true)

  // Dynamic story pages (only claimed stories)
  const storyPages: MetadataRoute.Sitemap = (claimedSlugs || []).map((slug) => ({
    url: `${baseUrl}/story/${slug.slug}`,
    lastModified: new Date(slug.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...storyPages]
}

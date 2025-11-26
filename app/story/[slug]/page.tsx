import type { Metadata } from "next"
import { notFound } from "next/navigation"
import StoryPageClient from "./StoryPageClient"
import { createClient } from "@/lib/supabase/server"
import type { Story } from "@/types"

interface StoryPageProps {
  params: {
    slug: string
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  return {
    title: `${params.slug} - Tag My Trophy`,
    description: "View this memory collection on Tag My Trophy",
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const supabase = await createClient()

  // First, try to find the slug in qr_slugs table
  const { data: slugData, error: slugError } = await supabase
    .from("qr_slugs")
    .select(
      `
      id,
      slug,
      is_claimed,
      title,
      description,
      views_count,
      owner_id,
      profiles:owner_id (
        id,
        full_name,
        email
      )
    `,
    )
    .eq("slug", params.slug)
    .single()

  // If slug doesn't exist, show 404
  if (slugError || !slugData) {
    notFound()
  }

  // If not claimed, show unclaimed state
  if (!slugData.is_claimed) {
    return (
      <StoryPageClient
        story={{
          claimed: false,
          id: slugData.id,
        }}
        slug={params.slug}
      />
    )
  }

  // Fetch memories for this story
  const { data: memoriesData } = await supabase
    .from("memories")
    .select("*")
    .eq("story_id", slugData.id)
    .order("order_index", { ascending: true })

  // Fetch custom field values
  const { data: customFieldsData } = await supabase
    .from("story_custom_field_values")
    .select(
      `
      id,
      field_value,
      theme_custom_fields:field_id (
        field_label
      )
    `,
    )
    .eq("slug_id", slugData.id)

  supabase
    .from("qr_slugs")
    .update({ views_count: (slugData.views_count || 0) + 1 })
    .eq("id", slugData.id)
    .then(() => {})

  const transformedStory: Story = {
    id: slugData.id,
    slug: slugData.slug,
    claimed: true,
    viewCount: slugData.views_count || 0,
    owner: {
      id: slugData.owner_id || "",
      name: slugData.profiles?.full_name || slugData.title || "Anonymous",
      bio: slugData.description || "",
      avatar: "/placeholder.svg?height=100&width=100",
      createdAt: "Member since 2024",
    },
    memories:
      memoriesData?.map((m) => ({
        id: m.id,
        type: m.type as "photo" | "video" | "story",
        url: m.url,
        title: m.title,
        caption: m.caption,
        content: m.content,
        date: m.date_taken ? new Date(m.date_taken).toLocaleDateString() : "",
        location: m.location,
        thumbnail: m.url,
      })) || [],
    customFields:
      customFieldsData?.map((cf: any) => ({
        id: cf.id,
        field_label: cf.theme_custom_fields?.field_label || "Custom Field",
        field_value: cf.field_value,
      })) || [],
    isPrivate: false,
    allowComments: true,
    allowSharing: true,
  }

  return <StoryPageClient story={transformedStory} slug={params.slug} />
}

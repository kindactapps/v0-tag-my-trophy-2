import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import ClaimFlowClient from "./ClaimFlowClient"
import { createClient } from "@/lib/supabase/server"

interface ClaimPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ClaimPageProps): Promise<Metadata> {
  return {
    title: `Claim Your Story Tag - ${params.slug} - Tag My Trophy`,
    description: "Set up your themed memory collection and start sharing your adventures.",
  }
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const supabase = await createClient()

  const { data: slugData, error } = await supabase
    .from("qr_slugs")
    .select("id, slug, is_claimed, is_active")
    .eq("slug", params.slug)
    .single()

  // If slug doesn't exist or there's an error, show 404
  if (error || !slugData) {
    notFound()
  }

  // If slug is not active, show 404
  if (!slugData.is_active) {
    notFound()
  }

  if (slugData.is_claimed) {
    redirect(`/story/${params.slug}`)
  }

  return <ClaimFlowClient slug={params.slug} />
}

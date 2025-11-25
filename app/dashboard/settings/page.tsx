import type { Metadata } from "next"
import SettingsClient from "./SettingsClient"
import { generateMetadata, pageConfigs } from "@/lib/seo-utils"

export const metadata: Metadata = generateMetadata(pageConfigs.settings)

export default function SettingsPage() {
  return <SettingsClient />
}

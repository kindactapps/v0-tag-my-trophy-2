import type { Metadata } from "next"
import SlugManagementClient from "./SlugManagementClient"

export const metadata: Metadata = {
  title: "Slug & QR Management - Tag My Trophy Admin",
  description: "Generate, manage, and export QR code slugs for manufacturing.",
}

export default function SlugManagementPage() {
  return <SlugManagementClient />
}

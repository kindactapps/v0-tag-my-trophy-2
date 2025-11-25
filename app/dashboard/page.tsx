import type { Metadata } from "next"
import DashboardClient from "./DashboardClient"

export const metadata: Metadata = {
  title: "Dashboard - Manage Your Memory Collections",
  description:
    "Manage your digital memory collections, upload new photos and stories, and track views on your Tag My Trophy QR code stories.",
  keywords: [
    "dashboard",
    "memory management",
    "digital collection",
    "QR code stories",
    "Tag My Trophy",
    "photo upload",
    "story management",
  ],
  robots: {
    index: false, // Dashboard should not be indexed
    follow: false,
  },
  openGraph: {
    title: "Dashboard - Tag My Trophy",
    description: "Manage your digital memory collections and QR code stories.",
    type: "website",
  },
}

export default function DashboardPage() {
  return <DashboardClient />
}

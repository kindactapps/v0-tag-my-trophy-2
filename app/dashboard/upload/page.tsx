import type { Metadata } from "next"
import UploadClient from "./UploadClient"

export const metadata: Metadata = {
  title: "Add New Memory - Tag My Trophy",
  description: "Upload photos, videos, and stories to your collection.",
}

export default function UploadPage() {
  return <UploadClient />
}

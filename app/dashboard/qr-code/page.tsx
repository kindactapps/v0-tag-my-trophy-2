import type { Metadata } from "next"
import QRCodeClient from "./QRCodeClient"

export const metadata: Metadata = {
  title: "QR Code Manager - Tag My Trophy",
  description: "Manage and download your story QR codes.",
}

export default function QRCodePage() {
  return <QRCodeClient />
}

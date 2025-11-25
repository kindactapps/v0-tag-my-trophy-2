import type { Metadata } from "next"
import QRInventoryClient from "./QRInventoryClient"

export const metadata: Metadata = {
  title: "QR Code Inventory | Tag My Trophy Admin",
  description: "Comprehensive QR code inventory management and tracking",
}

export default function QRInventoryPage() {
  return <QRInventoryClient />
}

import type { Metadata } from "next"
import SubscriptionManagementClient from "./SubscriptionManagementClient"

export const metadata: Metadata = {
  title: "Subscription Management | Tag My Trophy",
  description: "Manage your Tag My Trophy subscription and billing",
}

export default function SubscriptionPage() {
  return <SubscriptionManagementClient />
}

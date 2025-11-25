import type { Metadata } from "next"
import SubscriptionsManagementClient from "./SubscriptionsManagementClient"

export const metadata: Metadata = {
  title: "Subscription Management | Admin",
  description: "Manage customer subscriptions",
}

export default function SubscriptionsManagementPage() {
  return <SubscriptionsManagementClient />
}

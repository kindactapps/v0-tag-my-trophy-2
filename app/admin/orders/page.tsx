import type { Metadata } from "next"
import OrderManagementClient from "./OrderManagementClient"

export const metadata: Metadata = {
  title: "Order Management - Tag My Trophy Admin",
  description: "Manage customer orders, fulfillment, and manufacturing integration.",
}

export default function OrderManagementPage() {
  return <OrderManagementClient />
}

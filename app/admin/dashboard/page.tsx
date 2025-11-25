import type { Metadata } from "next"
import AdminDashboardClient from "./AdminDashboardClient"

export const metadata: Metadata = {
  title: "Admin Dashboard - Tag My Trophy",
  description: "Business management dashboard for Tag My Trophy operations.",
}

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
}

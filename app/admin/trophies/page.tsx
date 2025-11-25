import type { Metadata } from "next"
import TrophiesManagementClient from "./TrophiesManagementClient"

export const metadata: Metadata = {
  title: "Manage Trophies - Tag My Trophy Admin",
  description: "View and manage trophy tags in the system.",
}

export default function TrophiesManagementPage() {
  return <TrophiesManagementClient />
}

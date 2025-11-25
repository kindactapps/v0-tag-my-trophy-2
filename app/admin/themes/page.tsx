import type { Metadata } from "next"
import ThemeManagementClient from "./ThemeManagementClient"

export const metadata: Metadata = {
  title: "Theme Management - Tag My Trophy Admin",
  description: "Manage theme options for user profiles",
}

export default function ThemeManagementPage() {
  return <ThemeManagementClient />
}

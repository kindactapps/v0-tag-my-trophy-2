import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import StoreManagementClient from "./StoreManagementClient"

export default async function StoresPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  return <StoreManagementClient />
}

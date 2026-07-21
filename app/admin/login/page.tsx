import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth"
import AdminLoginForm from "./AdminLoginForm"

export default async function AdminLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const current = await getCurrentProfile()
  if (current?.profile.role === "ADMIN") redirect("/admin")
  return <AdminLoginForm oauthError={searchParams.error === "oauth"} />
}
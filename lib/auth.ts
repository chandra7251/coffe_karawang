import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"
import prisma from "@/lib/prisma"

export class AuthError extends Error {
  status: number

  constructor(message = "Unauthorized", status = 401) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

export async function getCurrentProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const configuredAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  const existing = await prisma.user.findUnique({ where: { email: user.email } })
  const role = existing?.role === "ADMIN" || configuredAdmins.includes(user.email.toLowerCase()) ? "ADMIN" : "USER"

  const nextName = user.user_metadata?.name || existing?.name || null
  const nextImage = user.user_metadata?.avatar_url || existing?.image || null
  const profile = existing
    ? existing.name === nextName && existing.image === nextImage && existing.role === role
      ? existing
      : await prisma.user.update({
          where: { id: existing.id },
          data: { name: nextName, image: nextImage, role },
        })
    : await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
          image: user.user_metadata?.avatar_url,
          role,
        },
      })

  return { authUser: user, profile }
}

export async function requireAdminApi() {
  const current = await getCurrentProfile()
  if (!current) throw new AuthError()
  if (current.profile.role !== "ADMIN") throw new AuthError("Admin access required", 403)
  return current
}

export async function requireAdminPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/admin/login")
  if (current.profile.role !== "ADMIN") redirect("/")
  return current
}
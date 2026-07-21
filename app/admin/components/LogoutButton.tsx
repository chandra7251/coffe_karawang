"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function logout() {
    setLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }
  return <button type="button" onClick={logout} disabled={loading} className="rounded-full border border-[#EAE6E1] px-4 py-2 text-xs font-semibold text-[#6E6864] hover:border-[#D77A44] disabled:opacity-50">{loading ? "Keluar..." : "Keluar"}</button>
}
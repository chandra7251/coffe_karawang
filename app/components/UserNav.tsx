"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type AuthState = "loading" | "signed-out" | "signed-in"

export default function UserNav() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => { if (active) setAuthState(response.ok ? "signed-in" : "signed-out") })
      .catch(() => { if (active) setAuthState("signed-out") })
    return () => { active = false }
  }, [])

  async function logout() {
    setLoggingOut(true)
    await fetch("/api/auth/logout", { method: "POST" })
    setAuthState("signed-out")
    setLoggingOut(false)
    router.refresh()
  }

  if (authState === "loading") return <span className="h-8 w-10" aria-hidden="true" />
  if (authState === "signed-out") return <Link href="/login" className="hover:text-[#2C1B14]">Login</Link>
  return <><Link href="/profile" className="hover:text-[#2C1B14]">Profile</Link><button type="button" onClick={logout} disabled={loggingOut} className="hover:text-[#2C1B14] disabled:opacity-50">{loggingOut ? "Keluar..." : "Keluar"}</button></>
}
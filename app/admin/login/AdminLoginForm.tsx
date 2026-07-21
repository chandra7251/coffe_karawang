"use client"

import { useState } from "react"
import Link from "next/link"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"

type OAuthProvider = "google" | "discord"

export default function AdminLoginForm({ oauthError = false }: { oauthError?: boolean }) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState(oauthError ? "OAuth login gagal. Pastikan akun punya akses admin." : "")

  async function signInWithProvider(provider: OAuthProvider) {
    setLoadingProvider(provider)
    setError("")
    try {
      const supabase = createBrowserSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/admin")}`
      const { data, error: oauthRequestError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (oauthRequestError) throw oauthRequestError
      if (data.url) window.location.assign(data.url)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "OAuth login gagal")
      setLoadingProvider(null)
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4"><section className="w-full max-w-md rounded-2xl border border-[#EAE6E1] bg-white p-8 custom-shadow"><div className="mb-8 text-center"><Link href="/" className="mb-3 inline-block text-3xl">K</Link><h1 className="font-serif-display text-2xl font-bold text-[#2C1B14]">Portal Admin KopiKarawang</h1><p className="mt-1 text-xs text-[#6E6864]">Masuk menggunakan akun OAuth yang terdaftar sebagai admin</p></div>{error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700" role="alert">{error}</p> : null}<div className="space-y-3"><button type="button" onClick={() => signInWithProvider("google")} disabled={Boolean(loadingProvider)} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#EAE6E1] py-3 text-sm font-semibold text-[#2C1B14] hover:border-[#D77A44] disabled:opacity-50"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#EAE6E1] text-xs font-bold">G</span>{loadingProvider === "google" ? "Menghubungkan..." : "Lanjutkan dengan Google"}</button><button type="button" onClick={() => signInWithProvider("discord")} disabled={Boolean(loadingProvider)} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] py-3 text-sm font-semibold text-white hover:bg-[#4752C4] disabled:opacity-50"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-bold">D</span>{loadingProvider === "discord" ? "Menghubungkan..." : "Lanjutkan dengan Discord"}</button></div><p className="mt-6 text-center text-xs text-[#6E6864]"><Link href="/" className="hover:underline">Kembali ke beranda</Link></p></section></main>
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { Icon } from "@/app/components/Icon"
import { usePreferences } from "@/app/components/PreferencesProvider"

type Props = { mode: "login" | "register"; nextPath?: string; oauthError?: boolean }
type OAuthProvider = "google" | "discord"

export default function AuthForm({ mode, nextPath: requestedNextPath, oauthError }: Props) {
  const { language } = usePreferences()
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState(oauthError ? "OAuth login gagal. Coba lagi." : "")
  const isRegister = mode === "register"
  const nextPath = requestedNextPath && requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//") ? requestedNextPath : "/"
  const copy = language === "en" ? { back: "Back", create: "Create your account", welcome: "Welcome back", registerSub: "Join to save cafes and share honest reviews.", loginSub: "Login to review and save your favorite hidden gems.", google: "Continue with Google", discord: "Continue with Discord", processing: "Connecting..." } : { back: "Kembali", create: "Buat akun", welcome: "Welcome back", registerSub: "Join buat save cafe dan share honest review.", loginSub: "Login buat review dan save hidden gem favorit.", google: "Lanjutkan dengan Google", discord: "Lanjutkan dengan Discord", processing: "Menghubungkan..." }

  async function signInWithProvider(provider: OAuthProvider) {
    setLoadingProvider(provider)
    setError("")
    try {
      const supabase = createBrowserSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      const { data, error: oauthRequestError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (oauthRequestError) throw oauthRequestError
      if (data.url) window.location.assign(data.url)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "OAuth login gagal")
      setLoadingProvider(null)
    }
  }

  return <main className="auth-page"><div className="absolute inset-0 coffee-ripple" aria-hidden="true" /><div className="auth-card"><Link href="/" className="flex items-center gap-2 font-serif-display text-lg font-bold text-[var(--ink)]"><Icon name="coffee" size="md" /><span>KopiKarawang</span></Link><h1 className="mt-10 font-serif-display text-4xl leading-[1.02] font-bold text-[var(--ink)]">{isRegister ? copy.create : copy.welcome}</h1><p className="mt-2 text-sm text-[var(--ink-soft)]">{isRegister ? copy.registerSub : copy.loginSub}</p>{error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700" role="alert">{error}</p> : null}<div className="mt-8 space-y-3"><button type="button" onClick={() => signInWithProvider("google")} disabled={Boolean(loadingProvider)} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--line)] py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#D77A44] disabled:opacity-50"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line)] text-xs font-bold">G</span>{loadingProvider === "google" ? copy.processing : copy.google}</button><button type="button" onClick={() => signInWithProvider("discord")} disabled={Boolean(loadingProvider)} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4752C4] disabled:opacity-50"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-bold">D</span>{loadingProvider === "discord" ? copy.processing : copy.discord}</button></div><p className="mt-6 text-center text-xs text-[var(--ink-soft)]"><Link href="/" className="font-semibold text-[var(--coffee)] transition-colors hover:underline">{copy.back}</Link></p></div></main>
}

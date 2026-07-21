"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Icon } from "@/app/components/Icon"
import { usePreferences } from "@/app/components/PreferencesProvider"

let authRequest: Promise<boolean> | null = null

function loadAuthState() {
  if (!authRequest) {
    authRequest = fetch("/api/auth/me").then((response) => response.ok).finally(() => { authRequest = null })
  }
  return authRequest
}

export default function UserHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { language, dark, toggleDark, toggleLanguage } = usePreferences()
  const [signedIn, setSignedIn] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    let active = true
    loadAuthState().then((nextSignedIn) => { if (active) setSignedIn(nextSignedIn) }).catch(() => { if (active) setSignedIn(false) })
    return () => { active = false }
  }, [pathname])

  if (pathname.startsWith("/admin")) return null

  const isAuth = pathname === "/login" || pathname === "/register"
  const showBack = isAuth || pathname.startsWith("/cafes/")
  const copy = language === "en" ? { explore: "Explore", profile: "Profile", login: "Login", back: "Back", dark: "Use dark mode", light: "Use light mode", language: "Change language", location: "View Karawang locations" } : { explore: "Explore", profile: "Profil", login: "Login", back: "Kembali", dark: "Gunakan dark mode", light: "Gunakan light mode", language: "Ganti bahasa", location: "Lihat lokasi Karawang" }

  function goBack() {
    if (isAuth) router.push("/")
    else router.back()
  }

  return <header className="site-header"><div className="site-header__inner">
    {showBack ? <button type="button" onClick={goBack} aria-label={copy.back} className="site-header__location"><Icon name="arrowLeft" size="lg" /><span className="sr-only">{copy.back}</span></button> : <Link href="/map" aria-label={copy.location} className="site-header__location"><Icon name="mapPin" size="lg" /><span className="sr-only">{copy.location}</span></Link>}
    <Link href="/" className="site-header__brand">Karawang Coffee</Link>
    <div className="site-header__actions"><Link href="/" className="site-header__desktop-link">Home</Link><Link href="/map" className="site-header__desktop-link">{copy.explore}</Link><Link href="/profile" className="site-header__desktop-link">{copy.profile}</Link>{!signedIn && !isAuth ? <Link href="/login" className="site-header__desktop-link">{copy.login}</Link> : null}<button type="button" onClick={() => setPreferencesOpen((value) => !value)} className="preferences-trigger" aria-label="Open preferences"><Icon name="tune" size="md" /></button><div className={`header-preferences ${preferencesOpen ? "open" : ""}`}><button type="button" onClick={toggleDark} className="icon-button" aria-label={dark ? copy.light : copy.dark} title={dark ? "Light mode" : "Dark mode"}><Icon name={dark ? "sun" : "moon"} size="sm" /></button><button type="button" onClick={toggleLanguage} className="language-button" aria-label={copy.language}>{language === "id" ? "EN" : "ID"}</button></div></div>
  </div></header>
}





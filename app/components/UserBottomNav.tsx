"use client"

import Link from "next/link"
import { Icon } from "@/app/components/Icon"
import { usePreferences } from "@/app/components/PreferencesProvider"

export default function UserBottomNav({ active }: { active: "home" | "map" | "profile" }) {
  const { language } = usePreferences()
  const labels = language === "en" ? { home: "Home", map: "Map", profile: "Profile" } : { home: "Beranda", map: "Peta", profile: "Profil" }
  const items = [{ href: "/", label: labels.home, icon: "home", key: "home" }, { href: "/map", label: labels.map, icon: "map", key: "map" }, { href: "/profile", label: labels.profile, icon: "person", key: "profile" }] as const
  return <nav className="profile-bottom-nav" aria-label={language === "en" ? "Main navigation" : "Navigasi utama"}><div>{items.map((item) => <Link key={item.key} href={item.href} className={active === item.key ? "active" : ""}><Icon name={item.icon} size="md" filled={active === item.key} /><span>{item.label}</span></Link>)}</div></nav>
}


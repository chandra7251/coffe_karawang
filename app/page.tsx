"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Icon } from "@/app/components/Icon"
import RatingStars from "@/app/components/RatingStars"
import { usePreferences } from "@/app/components/PreferencesProvider"
import UserBottomNav from "@/app/components/UserBottomNav"
import { createTimedRequestCache } from "@/lib/client-request-cache"

type CafeCard = {
  id: string
  name: string
  address: string
  description: string | null
  category: string[]
  tags: string[]
  rating: number
  totalReviews: number
  hasParking?: boolean
  images?: { url: string; isPrimary: boolean }[]
}

const fallbackTags = ["All Places", "WFH Friendly", "Family", "Romantic", "Nongkrong"]

const loadHomeCafes = createTimedRequestCache(async () => {
  const response = await fetch("/api/cafes?limit=50&sortBy=rating&sortOrder=desc")
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || "Data cafe gagal dimuat")
  return payload.cafes || []
})

function ParkingBadge({ hasParking, language }: { hasParking?: boolean; language: "id" | "en" }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${hasParking ? "bg-[#166534]/10 text-[#166534]" : "bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"}`}><Icon name="parking" size="xs" filled />{hasParking ? (language === "en" ? "Parking: Car & Motor" : "P: Luas") : (language === "en" ? "Limited parking" : "P: Terbatas")}</span>
}

function CafeCard({ cafe, language, compact = false }: { cafe: CafeCard; language: "id" | "en"; compact?: boolean }) {
  return <Link href={`/cafes/${cafe.id}`} className={`${compact ? "min-w-[260px]" : "w-full"} group overflow-hidden rounded-xl border border-[#E5D5C0]/70 bg-[var(--paper-bg)] shadow-[0_4px_12px_rgba(75,44,32,.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(75,44,32,.12)]`}>
    <div className={`${compact ? "aspect-video" : "aspect-[16/9]"} relative overflow-hidden bg-[var(--surface-variant)]`}>
      {cafe.images?.[0]?.url ? <img src={cafe.images[0].url} alt={cafe.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <span className="absolute right-2 top-2 rounded-full bg-[var(--paper-bg)]/85 p-1.5 text-[var(--on-surface)] shadow-sm backdrop-blur-sm"><Icon name="bookmark" size="sm" /></span>
    </div>
    <div className="flex flex-col p-3">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate font-serif-display text-xl leading-tight text-[var(--primary)] transition-colors group-hover:text-[var(--burnt-orange)]">{cafe.name}</h3>
        {cafe.rating ? <span className="flex shrink-0 items-center gap-1 text-[var(--primary)]"><RatingStars rating={cafe.rating} size="xs" /><span className="text-xs font-bold">{cafe.rating.toFixed(1)}</span></span> : null}
      </div>
      <div className="mb-3 flex items-center gap-1 truncate text-xs text-[var(--on-surface-variant)]"><Icon name="mapPin" size="xs" />{cafe.address}</div>
      <div className="mb-3 flex flex-wrap gap-2">{cafe.category.slice(0, 2).map((category) => <span key={category} className="rounded-full bg-[var(--latte-creme)] px-2 py-1 text-xs font-semibold text-[var(--primary-container)]">{category}</span>)}</div>
      <div className="mt-auto border-t border-[var(--outline-variant)]/20 pt-3"><ParkingBadge hasParking={cafe.hasParking} language={language} /></div>
    </div>
  </Link>
}

export default function Home() {
  const { language } = usePreferences()
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState("")
  const [cafes, setCafes] = useState<CafeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    loadHomeCafes().then((nextCafes) => { if (active) setCafes(nextCafes) }).catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Data cafe gagal dimuat") }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const availableTags = useMemo(() => Array.from(new Set([...fallbackTags, ...cafes.flatMap((cafe) => cafe.category), ...cafes.flatMap((cafe) => cafe.tags)])).filter((tag) => !["cafe", "coffeeshop", "coffee shop"].includes(tag.toLowerCase())).slice(0, 12), [cafes])
  const filteredCafes = cafes.filter((cafe) => {
    const haystack = [cafe.name, cafe.address, cafe.description || "", ...cafe.category, ...cafe.tags].join(" ").toLowerCase()
    const normalizedTag = activeTag === "All Places" ? "" : activeTag
    return haystack.includes(search.toLowerCase()) && (!normalizedTag || cafe.category.includes(normalizedTag) || cafe.tags.includes(normalizedTag))
  })
  const featured = filteredCafes.slice(0, 6)

  return <main className="min-h-screen bg-[var(--paper-bg)] pb-24 text-[var(--on-surface)] md:pb-0">
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-5 sm:px-6 sm:pt-8">
      <label className="flex min-h-14 items-center gap-3 rounded-xl border border-[#E5D5C0] bg-[var(--latte-creme)] px-4 shadow-sm focus-within:border-[var(--secondary)] focus-within:ring-2 focus-within:ring-[var(--burnt-orange)]/20">
        <Icon name="search" size="md" className="text-[var(--primary)]" />
        <input aria-label={language === "en" ? "Search cafes or coffeeshops" : "Cari cafe atau coffeeshop"} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === "en" ? "Find your perfect brew..." : "Cari cafe atau coffeeshop..."} className="min-w-0 flex-1 bg-transparent text-base text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)]" />
      </label>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{availableTags.map((tag) => { const active = (!activeTag && tag === "All Places") || activeTag === tag; return <button key={tag} type="button" onClick={() => setActiveTag(tag === "All Places" ? "" : tag)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[#E5D5C0] bg-[var(--latte-creme)] text-[var(--primary)] hover:bg-[var(--latte-creme)]/80"}`}>{tag}</button> })}</div>
    </section>
    <section className="mx-auto max-w-6xl pt-2 sm:pt-4">
      <div className="mb-3 flex items-end justify-between px-4 sm:px-6"><h1 className="font-serif-display text-3xl text-[var(--primary)] sm:text-4xl">{language === "en" ? "New & Trendy" : "Spot terbaru"}</h1><Link href="/map" className="text-sm font-semibold text-[var(--burnt-orange)] hover:underline">{language === "en" ? "See all" : "Lihat semua"}</Link></div>
      {loading ? <div className="mx-4 rounded-xl border border-[var(--outline-variant)] bg-white p-10 text-center text-sm text-[var(--on-surface-variant)] sm:mx-6">{language === "en" ? "Loading places..." : "Memuat daftar cafe..."}</div> : error ? <div className="mx-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 sm:mx-6">{error}</div> : featured.length ? <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{featured.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} language={language} compact />)}</div> : <div className="mx-4 rounded-xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--on-surface-variant)] sm:mx-6">{language === "en" ? "No matching places yet." : "Belum ada spot yang match."}</div>}
    </section>
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6"><h2 className="mb-4 font-serif-display text-3xl text-[var(--primary)] sm:text-4xl">{language === "en" ? "All cafes & coffeeshops" : "Semua cafe & coffeeshop"}</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredCafes.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} language={language} />)}</div></section>
    <UserBottomNav active="home" />
  </main>
}


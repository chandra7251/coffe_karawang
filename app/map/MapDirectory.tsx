"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Icon } from "@/app/components/Icon"
import { usePreferences } from "@/app/components/PreferencesProvider"
import { createTimedRequestCache } from "@/lib/client-request-cache"

type Cafe = { id: string; name: string; address: string; rating?: number; isVerified?: boolean; hasParking?: boolean; tags?: string[]; images?: { url: string }[] }

const loadMapCafes = createTimedRequestCache(async () => {
  const response = await fetch("/api/cafes?limit=50&sortBy=name&sortOrder=asc", { cache: "force-cache" })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || "Lokasi cafe gagal dimuat")
  return payload.cafes || []
})

export default function MapDirectory() {
  const { language } = usePreferences()
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [selected, setSelected] = useState<Cafe | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("open")

  useEffect(() => {
    let active = true
    loadMapCafes().then((nextCafes) => { if (active) { setCafes(nextCafes); setSelected(nextCafes[0] || null) } }).catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Lokasi cafe gagal dimuat") }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const query = selected ? encodeURIComponent(`${selected.name}, ${selected.address}, Karawang`) : ""
  const filters = language === "en" ? [["open", "Open Now"], ["parking", "Parking Available"], ["rating", "Rating 4.5+"]] : [["open", "Buka Sekarang"], ["parking", "Parkir Tersedia"], ["rating", "Rating 4.5+"]]
  const visibleCafes = useMemo(() => filter === "parking" ? cafes.filter((cafe) => cafe.hasParking) : filter === "rating" ? cafes.filter((cafe) => (cafe.rating || 0) >= 4.5) : cafes, [cafes, filter])

  return <div className="map-directory">
    {error ? <p className="map-error">{error}</p> : null}
    <div className="map-filter-row">{filters.map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} className={filter === key ? "map-filter active" : "map-filter"}>{key === "open" ? <Icon name="check" size="sm" filled /> : key === "parking" ? <Icon name="parking" size="sm" filled /> : <Icon name="star" size="sm" filled />}{label}</button>)}</div>
    <div className="map-stage">
      {loading ? <div className="map-loading-state" aria-live="polite"><span className="page-loading__icon flex h-12 w-12 items-center justify-center rounded-full bg-[var(--latte-creme)] text-[var(--primary)]"><Icon name="map" size="lg" /></span><p>{language === "en" ? "Preparing Karawang map..." : "Menyiapkan peta Karawang..."}</p><span className="map-loading-dots" aria-hidden="true">•••</span></div> : selected ? <iframe title={language === "en" ? "Karawang cafe map" : "Peta cafe Karawang"} src={`https://www.google.com/maps?q=${query}&output=embed`} className="map-canvas" loading="lazy" /> : <div className="map-loading-state"><Icon name="map" size="xl" /><p>{language === "en" ? "No cafe location available." : "Belum ada lokasi cafe."}</p></div>}
      <button type="button" className="map-list-button" aria-label={language === "en" ? "Show cafe list" : "Tampilkan daftar cafe"} onClick={() => document.querySelector(".map-directory-list")?.scrollIntoView({ behavior: "smooth" })}><Icon name="menuBook" size="md" /></button>

    </div>
    <div className="map-directory-list">{visibleCafes.map((cafe) => <button key={cafe.id} type="button" onClick={() => setSelected(cafe)} className={selected?.id === cafe.id ? "map-list-card selected" : "map-list-card"}><span className="map-list-card-image" style={cafe.images?.[0]?.url ? { backgroundImage: `url("${cafe.images[0].url}")` } : undefined} /><span><strong>{cafe.name}</strong><small><Icon name="mapPin" size="xs" />{cafe.address}</small></span><Icon name="chevronRight" size="sm" /></button>)}</div>
  </div>
}

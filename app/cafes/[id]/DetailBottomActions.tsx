"use client"

import { useEffect, useState } from "react"
import { Icon } from "@/app/components/Icon"

export default function DetailBottomActions({ cafeId, mapQuery }: { cafeId: string; mapQuery: string }) {
  const [bookmarked, setBookmarked] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    fetch("/api/auth/me").then((response) => setSignedIn(response.ok)).catch(() => setSignedIn(false))
    fetch("/api/bookmarks").then(async (response) => { if (!response.ok) return; const payload = await response.json(); setBookmarked(payload.bookmarks?.some((bookmark: { cafe: { id: string } }) => bookmark.cafe.id === cafeId) || false) }).catch(() => undefined)
  }, [cafeId])
  async function toggleSave() {
    if (!signedIn) { window.location.assign(`/login?next=/cafes/${cafeId}`); return }
    const response = await fetch(`/api/bookmarks${bookmarked ? `?CafeId=${encodeURIComponent(cafeId)}` : ""}`, { method: bookmarked ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: bookmarked ? undefined : JSON.stringify({ CafeId: cafeId }) })
    if (response.ok) setBookmarked((value) => !value)
  }
  return <div className="detail-action-bar"><a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="detail-action-primary"><Icon name="directions" size="sm" />Directions</a><button type="button" onClick={toggleSave} className="detail-action-secondary"><Icon name="bookmark" size="sm" filled={bookmarked} />{bookmarked ? "Saved" : "Save"}</button></div>
}

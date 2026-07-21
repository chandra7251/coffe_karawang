"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Icon } from "@/app/components/Icon"

type Props = { cafeId: string }

export default function CafeActions({ cafeId }: Props) {
  const router = useRouter()
  const [signedIn, setSignedIn] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const authResponse = await fetch("/api/auth/me")
      if (!active || !authResponse.ok) return
      setSignedIn(true)
      const bookmarkResponse = await fetch("/api/bookmarks")
      if (!bookmarkResponse.ok) return
      const payload = await bookmarkResponse.json()
      setBookmarked(payload.bookmarks?.some((bookmark: { cafe: { id: string } }) => bookmark.cafe.id === cafeId) || false)
    }
    load()
    return () => { active = false }
  }, [cafeId])

  function requireLogin() {
    if (!signedIn) router.push(`/login?next=/cafes/${cafeId}`)
    return signedIn
  }

  async function toggleBookmark() {
    if (!requireLogin()) return
    setStatus("")
    const response = await fetch(`/api/bookmarks${bookmarked ? `?CafeId=${encodeURIComponent(cafeId)}` : ""}`, {
      method: bookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: bookmarked ? undefined : JSON.stringify({ CafeId: cafeId }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) { setStatus(payload.error || "Bookmark gagal"); return }
    setBookmarked(!bookmarked)
    setStatus(!bookmarked ? "Disimpan ke bookmark" : "Bookmark dihapus")
    router.refresh()
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault()
    if (!requireLogin()) return
    if (!rating) { setStatus("Pilih rating dulu"); return }
    setSaving(true)
    setStatus("")
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CafeId: cafeId, rating, comment }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Ulasan gagal dikirim")
      setRating(0)
      setComment("")
      setStatus(payload.isAnomaly ? "Ulasan masuk review admin karena terdeteksi anomali" : "Ulasan berhasil dikirim")
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ulasan gagal dikirim")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 border-t border-[#FAF8F5] pt-6">
      <button type="button" onClick={toggleBookmark} className="w-full rounded-xl border border-[#D77A44] px-4 py-3 text-xs font-semibold text-[#A04000] hover:bg-[#FDF2E9]">
        {bookmarked ? "Hapus dari bookmark" : "Simpan ke bookmark"}
      </button>
      <form onSubmit={submitReview} className="space-y-3 rounded-xl bg-[#FAF8F5] p-4">
        <h3 className="font-semibold text-sm text-[#2C1B14]">Share your experience</h3>
        {!signedIn ? <p className="text-xs text-[#6E6864]">Login dulu untuk kasih review. <Link href={`/login?next=/cafes/${cafeId}`} className="font-semibold text-[#A04000] underline">Login</Link></p> : null}
        <div className="flex gap-1" aria-label="Pilih rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" aria-label={`${value} bintang`} onClick={() => setRating(value)} className={`rounded-full p-1 transition-transform hover:scale-110 ${value <= rating ? "text-amber-500" : "text-[#D9D0C8]"}`}><Icon name="star" size="md" filled={value <= rating} /></button>
          ))}
        </div>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={3} placeholder="Tulis review jujur kamu..." className="w-full rounded-xl border border-[#EAE6E1] bg-white px-3 py-2 text-xs focus:border-[#D77A44] focus:outline-none" />
        <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#2C1B14] px-4 py-3 text-xs font-semibold text-white hover:bg-[#4A3525] disabled:opacity-50">{saving ? "Mengirim..." : "Kirim review"}</button>
        {status ? <p className="text-xs text-[#A04000]" role="status">{status}</p> : null}
      </form>
    </div>
  )
}


"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Icon } from "@/app/components/Icon"
import RatingStars from "@/app/components/RatingStars"
import { usePreferences } from "@/app/components/PreferencesProvider"
import UserBottomNav from "@/app/components/UserBottomNav"

type Cafe = { id: string; name: string; address: string; rating: number; tags: string[]; hasParking: boolean; images: { url: string }[] }
type Bookmark = { id: string; cafe: Cafe }
type Review = { id: string; rating: number; comment: string | null; cafe: { id: string; name: string } }
type ProfileData = { name: string | null; bio: string | null; email: string; image: string | null; bookmarks: Bookmark[]; reviews: Review[] }

export default function ProfileContent({ profile, active = "profile" }: { profile: ProfileData; active?: "saved" | "profile" }) {
  const router = useRouter()
  const { language } = usePreferences()
  const en = language === "en"
  const [tab, setTab] = useState<"saved" | "reviews">(active === "saved" ? "saved" : "saved")
  const [alerts, setAlerts] = useState(true)
  const [settings, setSettings] = useState(false)
  const [name, setName] = useState(profile.name || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileStatus, setProfileStatus] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)
  const displayName = name || (en ? "Karawang Coffee user" : "User Karawang Coffee")
  const profileTag = bio || (en ? "Coffee enthusiast & remote worker" : "Coffee enthusiast & remote worker")

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileStatus("")
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, bio }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || (en ? "Profile update failed" : "Update profile gagal"))
      setName(payload.profile.name)
      setProfileStatus(en ? "Profile updated" : "Profile berhasil di-update")
      router.refresh()
    } catch (error) { setProfileStatus(error instanceof Error ? error.message : (en ? "Profile update failed" : "Update profile gagal")) } finally { setSavingProfile(false) }
  }

  async function logout() {
    setLoggingOut(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return <main className="profile-page">
    <section className="profile-shell">
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          {profile.image ? <img src={profile.image} alt={displayName} loading="lazy" decoding="async" className="profile-avatar" /> : <div className="profile-avatar profile-avatar-fallback"><span className="profile-avatar-initials">{displayName.slice(0, 1).toUpperCase()}</span></div>}
          <button type="button" className="profile-avatar-edit" aria-label={en ? "Edit profile photo" : "Edit foto profil"}><Icon name="edit" size="sm" /></button>
        </div>
        <h1>{displayName}</h1>
        <p>{profileTag}</p>
      </div>

      <section className="alert-card">
        <div className="alert-icon"><Icon name="notifications" size="md" /></div>
        <div className="alert-copy"><strong>{en ? "New Cafe Alerts" : "Notifikasi Cafe Baru"}</strong><span>{en ? "Get notified about new spots in Karawang" : "Dapatkan info cafe baru di Karawang"}</span></div>
        <button type="button" role="switch" aria-checked={alerts} onClick={() => setAlerts((value) => !value)} className={`switch ${alerts ? "switch-on" : ""}`}><span /></button>
      </section>

      <div className="profile-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "saved"} onClick={() => setTab("saved")}>{en ? "Saved Cafes" : "Cafe Tersimpan"}</button>
        <button type="button" role="tab" aria-selected={tab === "reviews"} onClick={() => setTab("reviews")}>{en ? "My Reviews" : "Review Saya"}</button>
      </div>

      {tab === "saved" ? <SavedCards cafes={profile.bookmarks.map((bookmark) => bookmark.cafe)} en={en} /> : <ReviewCards reviews={profile.reviews} en={en} />}

      <div className="profile-actions">
        <button type="button" onClick={() => setSettings((value) => !value)} className="profile-settings-button"><Icon name="person" size="md" />{en ? "Edit Profile Settings" : "Edit Pengaturan Profil"}</button>
        {settings ? <form className="settings-panel" onSubmit={saveProfile}><strong>{en ? "Account details" : "Detail akun"}</strong><label>{en ? "Display name" : "Nama tampilan"}<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} /></label><label>{en ? "Profile tag" : "Tag profil"}<input value={bio} onChange={(event) => setBio(event.target.value)} maxLength={120} placeholder={en ? "Coffee enthusiast & remote worker" : "Coffee enthusiast & remote worker"} /></label><span>{profile.email}</span><button type="submit" disabled={savingProfile}>{savingProfile ? (en ? "Saving..." : "Menyimpan...") : (en ? "Save changes" : "Simpan perubahan")}</button>{profileStatus ? <small role="status">{profileStatus}</small> : null}</form> : null}
        <button type="button" onClick={logout} disabled={loggingOut} className="profile-logout-button"><Icon name="logout" size="md" />{loggingOut ? (en ? "Logging out..." : "Keluar...") : (en ? "Logout" : "Keluar")}</button>
      </div>
    </section>
    <UserBottomNav active="profile" />
  </main>
}

function SavedCards({ cafes, en }: { cafes: Cafe[]; en: boolean }) {
  if (!cafes.length) return <div className="profile-empty"><Icon name="bookmark" size="lg" /><p>{en ? "No saved cafes yet." : "Belum ada cafe yang disimpan."}</p><Link href="/" className="profile-empty-link">{en ? "Explore cafes" : "Cari cafe"}</Link></div>
  return <div className="profile-cards">{cafes.map((cafe) => <Link key={cafe.id} href={`/cafes/${cafe.id}`} className="saved-cafe-card">
    <div className="saved-cafe-image">{cafe.images[0]?.url ? <img src={cafe.images[0].url} alt={cafe.name} loading="lazy" decoding="async" /> : <Icon name="coffee" size="xl" />}<span className="saved-bookmark"><Icon name="bookmark" size="md" filled /></span></div>
    <div className="saved-cafe-body"><h2>{cafe.name}</h2><div className="saved-tags">{cafe.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="saved-cafe-meta"><span className="saved-rating"><Icon name="star" size="sm" />{cafe.rating ? cafe.rating.toFixed(1) : "-"}</span><span className={cafe.hasParking ? "parking-good" : "parking-limited"}><Icon name="parking" size="sm" />{cafe.hasParking ? "P: Luas" : "P: Terbatas"}</span></div></div>
  </Link>)}</div>
}

function ReviewCards({ reviews, en }: { reviews: Review[]; en: boolean }) {
  if (!reviews.length) return <div className="profile-empty"><Icon name="rate_review" size="lg" /><p>{en ? "No reviews yet." : "Belum ada review."}</p></div>
  return <div className="review-list">{reviews.map((review) => <article key={review.id} className="review-card"><div className="review-heading"><h2>{review.cafe.name}</h2><RatingStars rating={review.rating} /></div><p>{review.comment || (en ? "No comment." : "Tidak ada komentar.")}</p></article>)}</div>
}




"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Cafe = {
  id: string
  name: string
  address: string
  phone: string | null
  operatingHours: string | null
  closeOrder: string | null
  hasParking: boolean
  hasSmokingRoom: boolean
  hasToilet: boolean
  hasWifi: boolean
  hasPowerOutlets: boolean
  hasMushola: boolean
  description: string | null
  category: string[]
  tags: string[]
  isVerified: boolean
  menuItems: { name: string; price: number | null; description: string | null; image: string | null; category: string | null }[]
}

function parseMenuItems(value: string) {
  return value.split(/\r?\n/).map((line) => {
    const [name, price, description, image, category] = line.split("|").map((item) => item.trim())
    const parsedPrice = price ? Number.parseInt(price.replace(/[^0-9]/g, ""), 10) : undefined
    return name ? { name, price: Number.isFinite(parsedPrice) ? parsedPrice : undefined, description: description || undefined, image: image || undefined, category: category || undefined } : null
  }).filter((item) => item !== null)
}

export default function EditCafeForm({ cafe }: { cafe: Cafe }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: cafe.name,
    address: cafe.address,
    phone: cafe.phone || "",
    operatingHours: cafe.operatingHours || "",
    closeOrder: cafe.closeOrder || "",
    hasParking: cafe.hasParking,
    hasSmokingRoom: cafe.hasSmokingRoom,
    hasToilet: cafe.hasToilet,
    hasWifi: cafe.hasWifi,
    hasPowerOutlets: cafe.hasPowerOutlets,
    hasMushola: cafe.hasMushola,
    description: cafe.description || "",
    category: cafe.category.join(", "),
    tags: cafe.tags.join(", "),
    menu: cafe.menuItems.map((item) => [item.name, item.price ?? "", item.description ?? "", item.image ?? "", item.category ?? ""].join(" | ")).join("\n"),
    isVerified: cafe.isVerified,
  })
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setStatus("")
    try {
      const response = await fetch(`/api/cafes/${cafe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, category: form.category.split(",").map((item) => item.trim()).filter(Boolean), tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean), menuItems: parseMenuItems(form.menu), phone: form.phone || null, operatingHours: form.operatingHours || null, closeOrder: form.closeOrder || null, description: form.description || null }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Gagal update cafe")
      setStatus("Kafe berhasil di-update")
      router.refresh()
    } catch (submitError) {
      setStatus(submitError instanceof Error ? submitError.message : "Gagal update cafe")
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-[#EAE6E1] px-4 py-3 focus:border-[#D77A44] focus:outline-none"
  return <form onSubmit={submit} className="space-y-4 text-sm">{(["name", "address", "phone", "operatingHours", "closeOrder"] as const).map((key) => <label key={key} className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#2C1B14]">{key}</span><input value={form[key]} onChange={(event) => updateField(key, event.target.value)} required={key === "name" || key === "address"} className={inputClass} /></label>)}<div className="grid grid-cols-1 gap-3 rounded-xl border border-[#EAE6E1] p-4 sm:grid-cols-3">{([['hasParking','Parkir mobil'],['hasWifi','WiFi'],['hasPowerOutlets','Stop kontak'],['hasMushola','Mushola'],['hasSmokingRoom','Smoking room'],['hasToilet','Toilet']] as const).map(([key,label]) => <label key={key} className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={form[key]} onChange={(event) => updateField(key, event.target.checked)} />{label}</label>)}</div><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#2C1B14]">Kategori</span><input value={form.category} onChange={(event) => updateField("category", event.target.value)} className={inputClass} /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#2C1B14]">Tags</span><input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} className={inputClass} /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#2C1B14]">Menu (Nama | Harga | Deskripsi | Image URL | Kategori)</span><textarea value={form.menu} onChange={(event) => updateField("menu", event.target.value)} rows={4} className={inputClass} /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#2C1B14]">Deskripsi</span><textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={4} className={inputClass} /></label><label className="flex items-center gap-2 text-xs font-semibold text-[#2C1B14]"><input type="checkbox" checked={form.isVerified} onChange={(event) => updateField("isVerified", event.target.checked)} />Terverifikasi</label>{status ? <p className="rounded-lg bg-[#FDF2E9] p-3 text-xs text-[#A04000]" role="status">{status}</p> : null}<button type="submit" disabled={saving} className="w-full rounded-xl bg-[#2C1B14] py-3 text-sm font-semibold text-white hover:bg-[#4A3525] disabled:opacity-50">{saving ? "Menyimpan..." : "Update kafe"}</button></form>
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/app/components/Icon"

type MenuDraft = { name: string; price: string; description: string; category: string; file?: File }

const emptyMenu: MenuDraft = { name: "", price: "", description: "", category: "" }

export default function NewCafePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", address: "", phone: "", operatingHours: "", closeOrder: "", description: "", category: "", tags: "", imageUrls: "", googleMapsUrl: "", latitude: "", longitude: "", hasParking: false, hasWifi: false, hasSmokingRoom: false, hasToilet: false, hasPowerOutlets: false, hasMushola: false })
  const [menuRows, setMenuRows] = useState<MenuDraft[]>([{ ...emptyMenu }])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function update(key: keyof typeof form, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })) }
  function updateMenu(index: number, key: keyof MenuDraft, value: string | File) { setMenuRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)) }
  function addMenu() { setMenuRows((current) => [...current, { ...emptyMenu }]) }
  function removeMenu(index: number) { setMenuRows((current) => current.length === 1 ? current : current.filter((_, rowIndex) => rowIndex !== index)) }

  async function uploadFile(file: File, cafeId: string, extra: { menuItemId?: string } = {}) {
    const uploadData = new FormData()
    uploadData.append("file", file)
    uploadData.append("cafeId", cafeId)
    if (extra.menuItemId) uploadData.append("menuItemId", extra.menuItemId)
    const response = await fetch("/api/upload", { method: "POST", body: uploadData })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error || "Upload foto gagal")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("")
    try {
      const menuDrafts = menuRows.filter((row) => row.name.trim())
      const menuItems = menuDrafts.map((row) => ({ name: row.name.trim(), price: row.price ? Number(row.price.replace(/[^0-9]/g, "")) : undefined, description: row.description.trim() || undefined, category: row.category.trim() || undefined }))
      const images = form.imageUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean).map((url, index) => ({ url, isPrimary: index === 0 }))
      const { googleMapsUrl, ...formData } = form
      const response = await fetch("/api/cafes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, googleMapsUrl: googleMapsUrl.trim() || undefined, category: form.category.split(",").map((item) => item.trim()).filter(Boolean), tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean), latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined, images, menuItems }) })
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || "Gagal menyimpan cafe")
      for (const file of photoFiles) await uploadFile(file, payload.cafe.id)
      for (let index = 0; index < menuDrafts.length; index += 1) if (menuDrafts[index].file && payload.cafe.menuItems[index]?.id) await uploadFile(menuDrafts[index].file!, payload.cafe.id, { menuItemId: payload.cafe.menuItems[index].id })
      router.push("/admin/cafes")
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Gagal menyimpan cafe") } finally { setLoading(false) }
  }

  const inputClass = "admin-form-input"
  return <div className="admin-page admin-form-page"><div className="admin-page-heading"><p className="admin-eyebrow">Directory</p><h2>Add New Cafe</h2><p>Add complete cafe data so user detail, gallery, facilities, maps, and popular menu stay in sync.</p></div>{error ? <p className="admin-form-error" role="alert">{error}</p> : null}<form onSubmit={handleSubmit} className="admin-form-layout">
    <section className="admin-form-card"><h3>Basic Information</h3><div className="admin-form-grid"><label><span>Cafe name</span><input required className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Kopi Nako Karawang" /></label><label><span>Phone</span><input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+62..." /></label><label className="full"><span>Full address</span><input required className={inputClass} value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Jl. Galuh Mas Raya, Karawang" /></label><label><span>Operating hours</span><input className={inputClass} value={form.operatingHours} onChange={(event) => update("operatingHours", event.target.value)} placeholder="Monday - Friday 08:00 - 22:00" /></label><label><span>Close order</span><input className={inputClass} value={form.closeOrder} onChange={(event) => update("closeOrder", event.target.value)} placeholder="21:30" /></label><label className="full"><span>Description</span><textarea className={inputClass} rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Cozy spot, WFH friendly, natural light..." /></label></div></section>
    <section className="admin-form-card"><h3>Cafe / Place Photos</h3><label><span>Upload photos</span><input className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setPhotoFiles(Array.from(event.target.files || []))} /><p className="admin-form-hint">JPG, PNG, WebP. Maksimal 5 MB per foto. {photoFiles.length ? `${photoFiles.length} foto dipilih.` : "Foto tempat tidak membutuhkan teks atau harga."}</p></label><label><span>Optional image URLs</span><textarea className={inputClass} rows={3} value={form.imageUrls} onChange={(event) => update("imageUrls", event.target.value)} placeholder="Satu URL per baris" /></label></section>
    <section className="admin-form-card"><div className="admin-heading-with-action"><div><h3>Popular Menu</h3><p className="admin-form-hint">Setiap best seller punya foto, nama, harga, deskripsi, dan kategori.</p></div><button type="button" className="admin-secondary-button" onClick={addMenu}><Icon name="add" size="sm" /> Add Menu</button></div>{menuRows.map((row, index) => <div className="admin-menu-draft" key={index}><div className="admin-menu-draft-heading"><b>Menu {index + 1}</b>{menuRows.length > 1 ? <button type="button" className="admin-text-button" onClick={() => removeMenu(index)}>Remove</button> : null}</div><div className="admin-form-grid"><label><span>Menu name</span><input required={index === 0} className={inputClass} value={row.name} onChange={(event) => updateMenu(index, "name", event.target.value)} placeholder="Es Kopi Nako" /></label><label><span>Price</span><input type="number" min="0" className={inputClass} value={row.price} onChange={(event) => updateMenu(index, "price", event.target.value)} placeholder="28000" /></label><label><span>Category</span><input className={inputClass} value={row.category} onChange={(event) => updateMenu(index, "category", event.target.value)} placeholder="Coffee" /></label><label className="full"><span>Description</span><input className={inputClass} value={row.description} onChange={(event) => updateMenu(index, "description", event.target.value)} placeholder="Signature iced coffee" /></label><label className="full"><span>Menu photo</span><input className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) updateMenu(index, "file", file) }} /><p className="admin-form-hint">{row.file ? row.file.name : "Upload foto best seller, maksimal 5 MB."}</p></label></div></div>)}</section>
    <section className="admin-form-card"><h3>Facilities & Discovery</h3><div className="admin-check-grid">{([['hasParking','Car Parking','directionsCar'],['hasWifi','Fast WiFi','wifi'],['hasPowerOutlets','Power Outlets','power'],['hasMushola','Mushola','mosque'],['hasSmokingRoom','Smoking Room','smoking'],['hasToilet','Toilet','toilet']] as const).map(([key,label,icon]) => <label key={key}><input type="checkbox" checked={form[key]} onChange={(event) => update(key, event.target.checked)} /><Icon name={icon} size="sm" /><span>{label}</span></label>)}</div><div className="admin-form-grid"><label><span>Category</span><input className={inputClass} value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Cafe, Coffeeshop" /></label><label><span>Tags</span><input className={inputClass} value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="WFH, Nongkrong, Outdoor" /></label><label className="full"><span>Google Maps URL</span><input type="url" className={inputClass} value={form.googleMapsUrl} onChange={(event) => update("googleMapsUrl", event.target.value)} placeholder="https://maps.google.com/?q=..." /></label><label><span>Latitude</span><input type="number" step="any" className={inputClass} value={form.latitude} onChange={(event) => update("latitude", event.target.value)} /></label><label><span>Longitude</span><input type="number" step="any" className={inputClass} value={form.longitude} onChange={(event) => update("longitude", event.target.value)} /></label></div></section>
    <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={() => router.push("/admin/cafes")}>Cancel</button><button type="submit" className="admin-primary-button" disabled={loading}><Icon name="check" size="sm" />{loading ? "Saving..." : "Save Cafe"}</button></div>
  </form></div>
}

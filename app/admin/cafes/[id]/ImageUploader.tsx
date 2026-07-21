"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type CafeImage = { id: string; url: string; isPrimary: boolean }

export default function ImageUploader({ cafeId, images }: { cafeId: string; images: CafeImage[] }) {
  const router = useRouter()
  const [status, setStatus] = useState("")
  const [uploading, setUploading] = useState(false)

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fileInput = form.elements.namedItem("file")
    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.[0]) {
      setStatus("Pilih foto dulu")
      return
    }

    setUploading(true)
    setStatus("")
    const payload = new FormData()
    payload.append("file", fileInput.files[0])
    payload.append("cafeId", cafeId)
    try {
      const response = await fetch("/api/upload", { method: "POST", body: payload })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Upload gagal")
      setStatus("Foto berhasil di-upload")
      form.reset()
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload gagal")
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="mt-6 border-t border-[#EAE6E1] pt-6">
      <h2 className="font-serif-display text-lg font-bold text-[#2C1B14]">Foto tempat</h2>
      <p className="mt-1 text-xs text-[#6E6864]">JPG, PNG, atau WebP. Maksimal 5 MB. Foto pertama jadi cover.</p>
      {images.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image) => <div key={image.id} className="relative h-28 rounded-xl border border-[#EAE6E1] bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(image.url)})` }}><span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#2C1B14]">{image.isPrimary ? "Cover" : "Foto"}</span></div>)}</div> : <p className="mt-4 text-xs text-[#6E6864]">Belum ada foto.</p>}
      <form onSubmit={upload} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-xs font-semibold text-[#2C1B14]">Pilih foto<input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full rounded-xl border border-[#EAE6E1] px-3 py-2 text-xs" /></label><button type="submit" disabled={uploading} className="rounded-xl bg-[#D77A44] px-4 py-3 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">{uploading ? "Uploading..." : "Upload foto"}</button></form>
      {status ? <p className="mt-3 rounded-lg bg-[#FDF2E9] p-3 text-xs text-[#A04000]" role="status">{status}</p> : null}
    </section>
  )
}
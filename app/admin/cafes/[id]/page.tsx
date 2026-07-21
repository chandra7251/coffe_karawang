import { requireAdminPage } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import EditCafeForm from "./EditCafeForm"
import ImageUploader from "./ImageUploader"

export default async function EditCafePage({ params }: { params: { id: string } }) {
  await requireAdminPage()
  const cafe = await prisma.cafe.findUnique({ where: { id: params.id }, include: { menuItems: true, images: { orderBy: { isPrimary: "desc" } } } })
  if (!cafe) notFound()

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 font-sans-ui text-[#2E2A27]">
      <header className="sticky top-0 z-50 border-b border-[#EAE6E1] bg-white px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/admin" className="font-serif-display text-lg font-bold text-[#2C1B14]">KopiKarawang Admin</Link>
          <Link href="/admin/cafes" className="text-xs text-[#6E6864]">&larr; Kembali</Link>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-[#EAE6E1] bg-white p-8 custom-shadow">
          <h1 className="mb-6 font-serif-display text-2xl font-bold text-[#2C1B14]">Edit Kafe: {cafe.name}</h1>
          <EditCafeForm cafe={cafe} />
          <ImageUploader cafeId={cafe.id} images={cafe.images} />
        </div>
      </main>
    </div>
  )
}

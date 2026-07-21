import Link from "next/link"
import { requireAdminPage } from "@/lib/auth"
import prisma from "@/lib/prisma"
import AdminActionButton from "@/app/admin/components/AdminActionButton"

export default async function AnomaliesPage() {
  await requireAdminPage()
  const reviews = await prisma.review.findMany({
    where: { isAnomaly: true },
    select: { id: true, rating: true, comment: true, cafe: { select: { name: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return <div className="min-h-screen bg-[#FAF8F5] pb-16 font-sans-ui text-[#2E2A27]"><header className="sticky top-0 z-50 border-b border-[#EAE6E1] bg-white px-4 py-4 sm:px-6"><div className="container mx-auto flex items-center justify-between"><Link href="/admin" className="font-serif-display text-lg font-bold text-[#2C1B14]">KopiKarawang Admin</Link><Link href="/admin" className="text-xs text-[#6E6864] hover:text-[#2C1B14]">Kembali ke dashboard</Link></div></header><main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"><h1 className="font-serif-display text-3xl font-bold text-[#2C1B14]">Deteksi anomali ulasan</h1><p className="mt-2 text-sm text-[#6E6864]">Review yang terdeteksi punya pola rating atau frekuensi tidak wajar.</p>{reviews.length === 0 ? <div className="mt-8 rounded-2xl border border-[#EAE6E1] bg-white p-10 text-center custom-shadow"><h2 className="font-serif-display text-lg font-bold text-[#2C1B14]">Tidak ada anomali</h2><p className="mt-2 text-xs text-[#6E6864]">Semua ulasan terdeteksi aman.</p></div> : <div className="mt-8 overflow-hidden rounded-2xl border border-red-100 bg-white custom-shadow"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-red-100 bg-red-50"><tr><th className="p-4">Kafe</th><th className="p-4">User</th><th className="p-4">Rating</th><th className="p-4">Komentar</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y divide-[#EAE6E1]">{reviews.map((review) => <tr key={review.id}><td className="p-4 font-semibold text-[#2C1B14]">{review.cafe.name}</td><td className="p-4">{review.user.name || review.user.email}</td><td className="p-4 text-amber-600">{review.rating}/5</td><td className="max-w-[360px] p-4 italic text-[#6E6864]">{review.comment || "Tanpa komentar"}</td><td className="p-4"><AdminActionButton endpoint={`/api/admin/reviews/${review.id}`} label="Hapus ulasan" confirmMessage="Hapus ulasan mencurigakan ini?" /></td></tr>)}</tbody></table></div></div>}</main></div>
}
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"
import CafeActions from "./CafeActions"
import { Icon } from "@/app/components/Icon"
import UserBottomNav from "@/app/components/UserBottomNav"
import DetailBottomActions from "./DetailBottomActions"

const getPublicCafe = unstable_cache(
  async (cafeId: string) => prisma.cafe.findFirst({
    where: { id: cafeId, isVerified: true },
    include: {
      images: { orderBy: { isPrimary: "desc" } },
      menuItems: { where: { isAvailable: true }, orderBy: { category: "asc" } },
      reviews: { where: { isAnomaly: false }, take: 50, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  }),
  ["public-cafe-detail"],
  { revalidate: 60, tags: ["cafes"] },
)

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cafe = await getPublicCafe(params.id)
  return { title: cafe?.name ? `${cafe.name} - KopiKarawang` : "Cafe Detail" }
}

export default async function CafeDetailPage({ params }: { params: { id: string } }) {
  const cafe = await getPublicCafe(params.id)

  if (!cafe) notFound()

  const mapQuery = encodeURIComponent(`${cafe.name}, ${cafe.address}, Karawang`)
  const formatPrice = (price: number | null) => price == null ? "Harga cek di tempat" : `Rp${new Intl.NumberFormat("id-ID").format(price)}`
  const operatingLines = (cafe.operatingHours || "Jam buka belum diinput").split("|").map((line) => line.trim()).filter(Boolean)
  const tags = cafe.tags
  const reviewCount = cafe.totalReviews || cafe.reviews.length

  return (
    <div className="detail-page">
      <main className="detail-main container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {cafe.images.length > 0 ? (
          <div className="detail-gallery mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cafe.images.slice(0, 3).map((image) => (
              <div key={image.id} className="group relative h-48 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-cover bg-center transition-transform duration-500 sm:h-56" style={{ backgroundImage: `url(${JSON.stringify(image.url)})` }} aria-label={`Foto ${cafe.name}`}>
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="detail-layout grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="detail-sections space-y-6">
            <section className="detail-intro rounded-xl border border-[var(--outline-variant)] bg-[var(--paper)] p-6 custom-shadow sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-serif-display text-4xl font-bold leading-[1.05] text-[var(--primary)]">{cafe.name}</h1>
                  <div className="mt-3 flex items-start gap-2 text-sm text-[var(--on-surface-variant)]"><Icon name="mapPin" size="sm" /> <span>{cafe.address}</span></div>
                </div>
                <span className="detail-rating-pill shrink-0"><Icon name="star" size="xs" filled /> <strong>{cafe.rating.toFixed(1)}</strong> <small>({reviewCount})</small></span>
              </div>
              {tags.length ? <div className="detail-tags mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
              {cafe.description ? <p className="mt-5 text-sm leading-relaxed text-[var(--on-surface-variant)]">{cafe.description}</p> : null}
            </section>

            <section className="detail-operating rounded-xl border border-[var(--outline-variant)] bg-[var(--paper)] p-6 custom-shadow sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-serif-display text-2xl font-bold text-[var(--primary)]">Operating Hours</h2><span className="detail-open-status"><Icon name="check" size="xs" filled /> Open Now</span></div>
              <div className="detail-hours-list">{operatingLines.map((line) => <p key={line}>{line}</p>)}</div>
              {cafe.closeOrder ? <div className="detail-close-order"><span><Icon name="warning" size="xs" /> Close Order</span><strong>{cafe.closeOrder}</strong></div> : null}
              <div className="detail-contact-row"><span><Icon name="phone" size="sm" /> {cafe.phone || "Telepon belum diinput"}</span><span><Icon name="check" size="sm" filled /> Terverifikasi</span></div>
            </section>

            <section className="detail-section detail-facilities">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-serif-display text-2xl font-bold text-[var(--primary)]">Facilities</h2><span className="text-xs text-[var(--on-surface-variant)]">Info lokasi</span></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div className="facility-card"><div className={`facility-icon ${cafe.hasParking ? "facility-icon-success" : "facility-icon-neutral"}`}><Icon name="directionsCar" size="md" filled /></div><div><span>Car Parking</span><strong className={cafe.hasParking ? "facility-success" : ""}>{cafe.hasParking ? "Available (Luas)" : "Limited / check"}</strong></div></div>
                <div className={`facility-card ${cafe.hasWifi ? "facility-card-available" : ""}`}><div className={`facility-icon ${cafe.hasWifi ? "facility-icon-latte" : "facility-icon-neutral"}`}><Icon name="wifi" size="md" filled /></div><div><span>Fast WiFi</span><strong>{cafe.hasWifi ? "Free" : "Info belum diinput"}</strong></div></div>
                <div className={`facility-card ${cafe.hasPowerOutlets ? "facility-card-available" : ""}`}><div className={`facility-icon ${cafe.hasPowerOutlets ? "facility-icon-orange" : "facility-icon-neutral"}`}><Icon name="power" size="md" filled /></div><div><span>Power Outlets</span><strong>{cafe.hasPowerOutlets ? "Many spots" : "Info belum diinput"}</strong></div></div>
                <div className={`facility-card ${cafe.hasMushola ? "facility-card-available" : ""}`}><div className={`facility-icon ${cafe.hasMushola ? "facility-icon-orange" : "facility-icon-neutral"}`}><Icon name="mosque" size="md" filled /></div><div><span>Mushola</span><strong>{cafe.hasMushola ? "Available" : "Info belum diinput"}</strong></div></div>
                <div className={`facility-card ${cafe.hasSmokingRoom ? "facility-card-available" : ""}`}><div className={`facility-icon ${cafe.hasSmokingRoom ? "facility-icon-orange" : "facility-icon-neutral"}`}><Icon name="smoking" size="md" filled /></div><div><span>Smoking Room</span><strong>{cafe.hasSmokingRoom ? "Available" : "Not available"}</strong></div></div>
                <div className={`facility-card ${cafe.hasToilet ? "facility-card-available" : ""}`}><div className={`facility-icon ${cafe.hasToilet ? "facility-icon-success" : "facility-icon-neutral"}`}><Icon name="toilet" size="md" filled /></div><div><span>Toilet</span><strong>{cafe.hasToilet ? "Available" : "Not available"}</strong></div></div>
              </div>
            </section>

            <section className="detail-menu rounded-xl border border-[var(--outline-variant)] bg-[var(--paper)] p-6 custom-shadow sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-serif-display text-2xl font-bold text-[var(--primary)]">Popular Menu</h2><span className="text-xs text-[var(--on-surface-variant)]">View Full Menu</span></div>
              {cafe.menuItems.length ? <div className="detail-menu-list grid grid-cols-2 gap-3">{cafe.menuItems.map((item, index) => <div key={item.id} className="menu-card group overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--paper-bg)] transition-colors hover:border-[#D77A44]/50"><div className="menu-card-image bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(item.image || cafe.images[index % Math.max(cafe.images.length, 1)]?.url || "")})` }} /><div className="p-3"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-[var(--primary)]">{item.name}</h3><span className="shrink-0 text-xs font-semibold text-[#A04000]">{formatPrice(item.price)}</span></div>{item.category ? <p className="mt-1 text-[11px] uppercase tracking-wider text-[#A04000]">{item.category}</p> : null}{item.description ? <p className="mt-2 text-xs leading-relaxed text-[var(--on-surface-variant)]">{item.description}</p> : null}</div></div>)}</div> : <p className="text-xs text-[var(--on-surface-variant)]">Menu belum diinput. Update menyusul setelah kunjungan lokasi.</p>}
            </section>

            <section className="detail-reviews rounded-xl border border-[var(--outline-variant)] bg-[var(--paper)] p-6 custom-shadow sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3"><h2 className="font-serif-display text-2xl font-bold text-[var(--primary)]">Authentic Voices</h2><span className="detail-verified-label"><Icon name="check" size="xs" filled /> Verified Visits</span></div>
              {cafe.reviews.length ? <div className="space-y-4">{cafe.reviews.map((review) => <article key={review.id} className="review-card"><div className="review-heading"><div className="flex items-center gap-3"><div className="review-avatar">{(review.user?.name || "A").charAt(0).toUpperCase()}</div><div><strong>{review.user?.name || "User KopiKarawang"}</strong><div className="review-stars">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size="sm" className={i < review.rating ? "text-amber-500" : "text-[#EAE6E1]"} filled />)}</div></div></div><span className="review-badge">{tags[0] || "Coffee spot"}</span></div><p>{review.comment || "Tidak ada komentar."}</p></article>)}</div> : <p className="text-xs text-[var(--on-surface-variant)]">Belum ada ulasan. Be the first one.</p>}
              <div className="detail-read-reviews">Read all {reviewCount} reviews</div><CafeActions cafeId={cafe.id} />
            </section>

            <section className="detail-location rounded-xl border border-[var(--outline-variant)] bg-[var(--paper)] p-6 custom-shadow sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-serif-display text-2xl font-bold text-[var(--primary)]">Location</h2><Icon name="mapPin" size="md" className="text-[var(--burnt-orange)]" /></div>
              <div className="mb-4 h-52 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-high)]"><iframe title={`Map lokasi ${cafe.name}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="h-full w-full border-0" loading="lazy" /></div>
              <p className="mb-4 text-sm leading-relaxed text-[var(--on-surface-variant)]">{cafe.address}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--burnt-orange)]"><Icon name="directions" size="sm" />Open directions</a>
            </section>
          </div>

          <aside className="space-y-6"><div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--paper)] p-6 text-center custom-shadow"><span className="text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">Rating rata-rata</span><p className="mt-3 font-serif-display text-5xl font-bold text-[var(--primary)]">{cafe.rating.toFixed(1)}</p><div className="mt-2 flex justify-center text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size="sm" className={i < cafe.rating ? "text-amber-500" : "text-[#EAE6E1]"} filled />)}</div></div><div className="rounded-2xl bg-[var(--primary)] p-6 text-center text-white custom-shadow"><h3 className="mb-2 font-serif-display text-lg font-bold">Punya update info?</h3><p className="mb-4 text-xs leading-relaxed text-gray-300">Jam buka atau menu berubah? Tell us supaya data tetap reliable.</p><a href="mailto:hello@kopikarawang.local?subject=Update%20info%20cafe" className="block w-full rounded-xl bg-[#D77A44] py-2.5 text-xs font-semibold transition-colors hover:bg-amber-600">Kirim laporan</a></div></aside>
        </div>
      </main>
      <DetailBottomActions cafeId={cafe.id} mapQuery={mapQuery} />
      <UserBottomNav active="home" />
    </div>
  )
}



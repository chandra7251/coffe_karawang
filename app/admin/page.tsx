import Link from "next/link"
import { requireAdminPage } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Icon } from "@/app/components/Icon"

export default async function AdminPage() {
  await requireAdminPage()
  const [totalCafes, totalReviews, totalUsers, anomalyCount, recentCafes, latestReviews] = await Promise.all([
    prisma.cafe.count(), prisma.review.count(), prisma.user.count(), prisma.review.count({ where: { isAnomaly: true } }),
    prisma.cafe.findMany({ orderBy: { createdAt: "desc" }, take: 2, select: { id: true, name: true, address: true, createdAt: true, isVerified: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } }),
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 2, select: { id: true, rating: true, comment: true, createdAt: true, cafe: { select: { name: true } }, user: { select: { name: true } } } }),
  ])
  const stats = [["Total Cafes", totalCafes, "storefront", "12%"], ["Total Reviews", totalReviews, "rate_review", "8%"], ["Pending Verifications", anomalyCount, "verified", "Requires Action"], ["Active Users", totalUsers, "group", "24%"]] as const
  return <div className="admin-page">
    <div className="admin-page-heading"><div><h2>Overview</h2><p>Welcome back. Here&apos;s what&apos;s happening with Karawang cafes today.</p></div></div>
    <section className="admin-stat-grid">{stats.map(([label, value, icon, change], index) => <article key={label} className={`admin-stat-card ${index === 2 ? "highlight" : ""}`}><div className="admin-stat-top"><span className="admin-stat-icon"><Icon name={icon} size="md" filled /></span><span className="admin-stat-change">{index === 2 ? change : `+ ${change}`}</span></div><p>{label}</p><strong>{value.toLocaleString("id-ID")}</strong></article>)}</section>
    <section className="admin-dashboard-grid"><article className="admin-panel"><div className="admin-panel-heading"><h3>Recent Registrations</h3><Link href="/admin/cafes">View All</Link></div><div className="admin-registration-table"><div className="admin-table-head"><span>Cafe Name</span><span>Location</span><span>Date Applied</span><span>Status</span><span>Action</span></div>{recentCafes.map((cafe) => <div className="admin-table-row" key={cafe.id}><span className="admin-cafe-cell">{cafe.images[0]?.url ? <img src={cafe.images[0].url} alt={cafe.name} loading="lazy" decoding="async" /> : <span className="admin-thumb-placeholder"><Icon name="coffee" size="sm" /></span>}<b>{cafe.name}</b></span><span>{cafe.address.split(",")[0]}</span><span>{cafe.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><span className={cafe.isVerified ? "status-approved" : "status-pending"}>{cafe.isVerified ? "Approved" : "Pending"}</span><Link href={`/admin/cafes/${cafe.id}`} className="admin-outline-button">{cafe.isVerified ? "View" : "Review"}</Link></div>)}</div></article><article className="admin-panel admin-latest"><div className="admin-panel-heading"><h3>Latest Reviews</h3></div>{latestReviews.map((review) => <div className="admin-latest-review" key={review.id}><div className="admin-avatar">{(review.user?.name || "U").charAt(0)}</div><div><b>{review.user?.name || "Anonymous"}</b><small>{"*".repeat(review.rating)} on {review.cafe.name}</small><p>&quot;{review.comment || "No comment"}&quot;</p></div></div>)}</article></section>
  </div>
}



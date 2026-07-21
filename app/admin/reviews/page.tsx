import { requireAdminPage } from "@/lib/auth"
import prisma from "@/lib/prisma"
import AdminActionButton from "@/app/admin/components/AdminActionButton"
import { Icon } from "@/app/components/Icon"
import ReviewModerationActions from "@/app/admin/components/ReviewModerationActions"

function repairText(value: string) {
  return value
}

export default async function ReviewsAdminPage() {
  await requireAdminPage()
  const reviews = await prisma.review.findMany({ select: { id: true, rating: true, comment: true, isAnomaly: true, createdAt: true, cafe: { select: { name: true } }, user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 })
  return <div className="admin-page"><div className="admin-page-heading admin-heading-with-action"><div><h2>Review Moderation</h2><p>Review flagged content and anomalies detected by the system.</p></div><div className="admin-heading-actions"><button type="button" className="admin-secondary-button"><Icon name="tune" size="sm" /> Filter</button><button type="button" className="admin-primary-button">Show Flagged ({reviews.filter((review) => review.isAnomaly).length})</button></div></div>{reviews.length === 0 ? <div className="admin-empty-state">No reviews yet.</div> : <div className="admin-review-list">{reviews.map((review) => <article className={`admin-review-card ${review.isAnomaly ? "anomaly" : ""}`} key={review.id}><div className="admin-review-body"><div className="admin-review-meta"><div className="admin-avatar">{(review.user?.name || "U").charAt(0).toUpperCase()}</div><div><b>{review.user?.name || review.user?.email}</b><small>Reviewing: <strong>{review.cafe.name}</strong></small></div><span className={review.isAnomaly ? "admin-alert-badge" : "admin-flag-badge"}>{review.isAnomaly ? "Anomaly Detected" : "User Review"}</span></div><div className="admin-review-stars">{Array.from({ length: 5 }).map((_, index) => <Icon key={index} name="star" size="sm" filled={index < review.rating} />)}</div><blockquote>{repairText(review.comment || "No comment provided.")}</blockquote><div className="admin-system-note"><Icon name={review.isAnomaly ? "warning" : "info"} size="sm" /><span><b>{review.isAnomaly ? "System Note:" : "Review Note:"}</b> {review.isAnomaly ? "Review flagged for anomaly detection." : "No anomaly detected."}</span></div></div><div className="admin-review-actions"><ReviewModerationActions reviewId={review.id} anomaly={review.isAnomaly} /><AdminActionButton endpoint={`/api/admin/reviews/${review.id}`} label="Delete" confirmMessage="Hapus ulasan ini?" /></div></article>)}</div>}</div>
}


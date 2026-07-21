"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/app/components/Icon"

export default function ReviewModerationActions({ reviewId, anomaly }: { reviewId: string; anomaly: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")
  async function update(action: "approve" | "reject") {
    setLoading(action); setError("")
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Update review gagal")
      router.refresh()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Update review gagal") } finally { setLoading("") }
  }
  return <div className="admin-review-action-stack"><button type="button" className="admin-approve-button" onClick={() => update("approve")} disabled={Boolean(loading)}><Icon name="check" size="sm" />{loading === "approve" ? "Saving..." : "Approve"}</button>{anomaly ? <button type="button" className="admin-secondary-button" onClick={() => update("reject")} disabled={Boolean(loading)}>Keep Flagged</button> : <button type="button" className="admin-secondary-button" disabled>View</button>}{error ? <small className="admin-action-error">{error}</small> : null}</div>
}

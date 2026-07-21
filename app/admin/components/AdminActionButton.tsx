"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  endpoint: string
  method?: "DELETE" | "PATCH"
  label: string
  confirmMessage: string
  className?: string
}

export default function AdminActionButton({ endpoint, method = "DELETE", label, confirmMessage, className = "" }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Action failed")
      router.refresh()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={handleClick} disabled={loading} className={className || "rounded bg-red-600 px-3 py-1 text-[10px] text-white hover:bg-red-700 disabled:opacity-50"}>
        {loading ? "Memproses..." : label}
      </button>
      {error ? <span className="text-[10px] text-red-700">{error}</span> : null}
    </span>
  )
}
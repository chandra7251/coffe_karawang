"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Global application error", error) }, [error])

  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#fbf7f1", color: "#2b211d", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
          <section style={{ maxWidth: 520, textAlign: "center" }}>
            <p style={{ color: "#9c4f2f", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" }}>500 · KopiKarawang</p>
            <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", lineHeight: 1.02, margin: "14px 0" }}>Server lagi rebrew.</h1>
            <p style={{ color: "#6f625a", lineHeight: 1.7 }}>Aplikasi mengalami gangguan. Coba lagi atau kembali ke halaman utama.</p>
            <button onClick={reset} style={{ marginTop: 24, minHeight: 48, border: 0, borderRadius: 999, padding: "0 24px", background: "#553025", color: "white", fontWeight: 700, cursor: "pointer" }}>Coba lagi</button>
          </section>
        </main>
      </body>
    </html>
  )
}

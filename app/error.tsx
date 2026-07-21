"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Icon } from "@/app/components/Icon"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Unhandled application error", error) }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-5 py-12">
      <section className="w-full max-w-xl rounded-[28px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center custom-shadow sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-700"><Icon name="info" size="lg" /></div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-red-700">500 · Something went off</p>
        <h1 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">Page lagi butuh rebrew.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--ink-soft)]">Ada gangguan di sisi aplikasi. Coba reload dulu. Kalau masih error, kirim screenshot dan URL ke admin.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm">Coba lagi</button>
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--coffee)] hover:text-[var(--coffee)]">Kembali ke home</Link>
        </div>
      </section>
    </main>
  )
}

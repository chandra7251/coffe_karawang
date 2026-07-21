import Link from "next/link"
import { Icon } from "@/app/components/Icon"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-5 py-12">
      <section className="w-full max-w-xl rounded-[28px] border border-[var(--line)] bg-[var(--paper)] p-8 text-center custom-shadow sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--peach)] text-[var(--coffee)]">
          <Icon name="mapPin" size="lg" />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-[var(--coffee)]">404 · Spot tidak ditemukan</p>
        <h1 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">Halaman ini lagi ngopi entah di mana.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--ink-soft)]">URL-nya mungkin typo, atau spot sudah dipindahkan. Balik ke directory buat cari tempat lain.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm">Kembali ke home</Link>
          <Link href="/map" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--coffee)] hover:text-[var(--coffee)]">Buka peta</Link>
        </div>
      </section>
    </main>
  )
}

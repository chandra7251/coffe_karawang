import { Icon } from "@/app/components/Icon"

type PageLoadingProps = { message: string; icon?: string }

export default function PageLoading({ message, icon = "coffee" }: PageLoadingProps) {
  return <main className="page-loading flex min-h-[60vh] items-center justify-center bg-[var(--paper-bg)] px-6" aria-busy="true" aria-live="polite"><div className="flex flex-col items-center gap-4 text-center"><span className="page-loading__icon flex h-14 w-14 items-center justify-center rounded-full bg-[var(--latte-creme)] text-[var(--primary)] shadow-sm"><Icon name={icon} size="lg" /></span><div><p className="text-sm font-semibold text-[var(--on-surface-variant)]">{message}</p><span className="mt-2 flex justify-center gap-1" aria-hidden="true"><i className="page-loading__dot h-1.5 w-1.5 rounded-full bg-[var(--burnt-orange)]" /><i className="page-loading__dot h-1.5 w-1.5 rounded-full bg-[var(--burnt-orange)]" /><i className="page-loading__dot h-1.5 w-1.5 rounded-full bg-[var(--burnt-orange)]" /></span></div></div></main>
}

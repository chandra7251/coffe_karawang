"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/app/components/Icon"
import LogoutButton from "@/app/admin/components/LogoutButton"

const navItems = [
  ["/admin", "Dashboard", "dashboard"],
  ["/admin/cafes", "Manage Cafes", "storefront"],
  ["/admin/reviews", "Review Moderation", "rate_review"],
  ["/admin/users", "User Analytics", "analytics"],
  ["/admin/anomalies", "Review Anomalies", "warning"],
] as const

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activePath = pathname === "/admin" ? "/admin" : navItems.find(([href]) => href !== "/admin" && pathname.startsWith(href))?.[0]
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand"><span>Karawang Cafe<br />Admin</span><small>Management Portal</small></Link>
      <nav className="admin-nav" aria-label="Admin navigation">{navItems.map(([href, label, icon]) => <Link key={href} href={href} className={activePath === href ? "active" : ""}><Icon name={icon} size="md" filled={activePath === href} /><span>{label}</span></Link>)}</nav>
      <div className="admin-sidebar-footer"><div className="admin-avatar">K</div><LogoutButton /></div>
    </aside>
    <div className="admin-content">
      <header className="admin-topbar"><h1>Admin Dashboard</h1><div className="admin-topbar-actions"><input aria-label="Search admin" placeholder="Search..." /><button type="button" aria-label="Notifications"><Icon name="notifications" size="md" /></button><button type="button" aria-label="Help"><Icon name="info" size="md" /></button><div className="admin-avatar admin-avatar-small">K</div></div></header>
      <main className="admin-main">{children}</main>
    </div>
  </div>
}


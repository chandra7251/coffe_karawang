import type { Metadata } from "next"
import "./globals.css"
import UserHeader from "@/app/components/UserHeader"
import { PreferencesProvider } from "@/app/components/PreferencesProvider"

export const metadata: Metadata = {
  title: "Karawang Cafe & Coffeeshop Directory",
  description: "Kumpulan cafe dan coffeeshop terbaik di Karawang",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased text-[#2E2A27]">
        <PreferencesProvider><UserHeader />{children}</PreferencesProvider>
      </body>
    </html>
  )
}

import { requireAdminPage } from "@/lib/auth"

export default async function NewCafeLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage()
  return children
}
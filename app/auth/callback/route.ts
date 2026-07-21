import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/"
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"))

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
  }

  const fallbackPath = nextPath.startsWith("/admin") ? "/admin/login?error=oauth" : "/login?error=oauth"
  return NextResponse.redirect(new URL(fallbackPath, requestUrl.origin))
}
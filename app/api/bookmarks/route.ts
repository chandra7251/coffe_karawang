import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentProfile, AuthError } from "@/lib/auth"

function authResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const current = await getCurrentProfile()
    if (!current) throw new AuthError()
    const payload = await request.json().catch(() => ({}))
    const CafeId = typeof payload.CafeId === "string" ? payload.CafeId : ""
    if (!CafeId) return NextResponse.json({ error: "CafeId required" }, { status: 400 })
    const cafe = await prisma.cafe.findUnique({ where: { id: CafeId, isVerified: true } })
    if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    const existing = await prisma.bookmark.findUnique({ where: { CafeId_UserId: { CafeId, UserId: current.profile.id } } })
    if (existing) return NextResponse.json({ error: "Already bookmarked" }, { status: 409 })
    const bookmark = await prisma.bookmark.create({ data: { CafeId, UserId: current.profile.id }, include: { cafe: true } })
    return NextResponse.json({ bookmark }, { status: 201 })
  } catch (error) {
    return authResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const current = await getCurrentProfile()
    if (!current) throw new AuthError()
    const CafeId = new URL(request.url).searchParams.get("CafeId")
    if (!CafeId) return NextResponse.json({ error: "CafeId required" }, { status: 400 })
    await prisma.bookmark.deleteMany({ where: { CafeId, UserId: current.profile.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return authResponse(error)
  }
}

export async function GET() {
  try {
    const current = await getCurrentProfile()
    if (!current) throw new AuthError()
    const bookmarks = await prisma.bookmark.findMany({ where: { UserId: current.profile.id }, include: { cafe: true }, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ bookmarks })
  } catch (error) {
    return authResponse(error)
  }
}
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentProfile, AuthError } from "@/lib/auth"
import { z } from "zod"

const updateProfileSchema = z.object({ name: z.string().trim().min(2).max(80), bio: z.string().trim().max(120).optional().default("") })

export async function PATCH(request: NextRequest) {
  try {
    const current = await getCurrentProfile()
    if (!current) throw new AuthError()
    const parsed = updateProfileSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 })
    const profile = await prisma.user.update({ where: { id: current.profile.id }, data: { name: parsed.data.name, bio: parsed.data.bio || null }, select: { id: true, name: true, bio: true, email: true, image: true } })
    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: "Gagal update profile" }, { status: 500 })
  }
}


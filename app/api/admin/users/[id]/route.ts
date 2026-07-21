import prisma from "@/lib/prisma"
import { requireAdminApi, AuthError } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminApi()
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const updated = await prisma.user.update({ where: { id: params.id }, data: { blacklisted: !user.blacklisted } })
    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
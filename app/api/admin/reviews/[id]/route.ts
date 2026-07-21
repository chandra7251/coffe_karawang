import { revalidateTag } from "next/cache"
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminApi()
    const body = await request.json().catch(() => ({})) as { action?: string }
    if (!["approve", "reject"].includes(body.action || "")) return NextResponse.json({ error: "Action review tidak valid" }, { status: 400 })
    const review = await prisma.review.update({ where: { id: params.id }, data: { isAnomaly: body.action === "reject" } })
    revalidateTag("cafes")
    return NextResponse.json({ review })
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

import prisma from "@/lib/prisma"
import { requireAdminApi, AuthError } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminApi()
    const review = await prisma.review.findUnique({ where: { id: params.id } })
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 })
    await prisma.$transaction(async (transactionClient: any) => {
      await transactionClient.review.delete({ where: { id: params.id } })
      const aggregate = await transactionClient.review.aggregate({ where: { CafeId: review.CafeId }, _avg: { rating: true }, _count: { _all: true } })
      await transactionClient.cafe.update({ where: { id: review.CafeId }, data: { rating: aggregate._avg.rating || 0, totalReviews: aggregate._count._all } })
    })
    revalidateTag("cafes")
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
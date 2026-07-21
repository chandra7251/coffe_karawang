import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdminApi, AuthError } from "@/lib/auth"
import { detectReviewAnomaly } from "@/lib/reviews"

function authResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi()
    const { cafeId, userId } = await request.json().catch(() => ({}))
    if (!cafeId || !userId) return NextResponse.json({ error: "cafeId and userId required" }, { status: 400 })
    const [recentUserReviews, cafeReviews] = await Promise.all([
      prisma.review.count({ where: { CafeId: cafeId, UserId: userId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.review.findMany({ where: { CafeId: cafeId }, select: { rating: true } }),
    ])
    const result = detectReviewAnomaly({ recentUserReviews, cafeRatings: cafeReviews.map((review) => review.rating), userRating: 5 })
    return NextResponse.json(result)
  } catch (error) {
    return authResponse(error)
  }
}

export async function GET() {
  try {
    await requireAdminApi()
    const suspiciousReviews = await prisma.review.findMany({ where: { isAnomaly: true }, include: { user: true, cafe: true }, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ suspiciousReviews, stats: { totalReviews: await prisma.review.count(), suspiciousCount: suspiciousReviews.length } })
  } catch (error) {
    return authResponse(error)
  }
}
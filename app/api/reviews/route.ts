import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentProfile, AuthError } from "@/lib/auth"
import { detectReviewAnomaly } from "@/lib/reviews"
import { z } from "zod"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
  CafeId: z.string().min(1),
})

function authResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const current = await getCurrentProfile()
    if (!current) throw new AuthError()
    if (current.profile.blacklisted) throw new AuthError("Akun diblokir", 403)

    const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: "Data ulasan tidak valid" }, { status: 400 })
    const { rating, comment, CafeId } = parsed.data

    const cafe = await prisma.cafe.findUnique({ where: { id: CafeId, isVerified: true } })
    if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 })

    const existingReview = await prisma.review.findFirst({ where: { CafeId, UserId: current.profile.id } })
    if (existingReview) return NextResponse.json({ error: "Anda sudah mengulas cafe ini" }, { status: 409 })

    const [recentUserReviews, cafeReviews] = await Promise.all([
      prisma.review.count({ where: { UserId: current.profile.id, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.review.findMany({ where: { CafeId }, select: { rating: true } }),
    ])
    const anomaly = detectReviewAnomaly({
      recentUserReviews,
      cafeRatings: cafeReviews.map((review) => review.rating),
      userRating: rating,
    })

    const review = await prisma.$transaction(async (transactionClient) => {
      const created = await transactionClient.review.create({
        data: { rating, comment: comment || "", CafeId, UserId: current.profile.id, isAnomaly: anomaly.isAnomaly },
        include: { user: { select: { name: true, image: true } } },
      })
      const aggregate = await transactionClient.review.aggregate({ where: { CafeId, isAnomaly: false }, _avg: { rating: true }, _count: { _all: true } })
      await transactionClient.cafe.update({ where: { id: CafeId }, data: { rating: aggregate._avg.rating || 0, totalReviews: aggregate._count._all } })
      return created
    })

    revalidateTag("cafes")
    return NextResponse.json({ review, isAnomaly: anomaly.isAnomaly }, { status: 201 })
  } catch (error) {
    return authResponse(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const cafeId = new URL(request.url).searchParams.get("cafeId")
    if (!cafeId) return NextResponse.json({ error: "cafeId required" }, { status: 400 })
    const reviews = await prisma.review.findMany({
      where: { CafeId: cafeId, isAnomaly: false },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
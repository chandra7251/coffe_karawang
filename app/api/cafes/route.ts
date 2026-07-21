import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdminApi, AuthError } from "@/lib/auth"
import { z } from "zod"

const menuItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().max(60).optional(),
  price: z.number().int().nonnegative().optional(),
  image: z.string().url().max(500).optional(),
  isAvailable: z.boolean().optional(),
})

const cafeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(240),
  description: z.string().trim().max(2000).optional(),
  phone: z.string().trim().max(40).optional(),
  operatingHours: z.string().trim().max(120).optional(),
  closeOrder: z.string().trim().max(40).optional(),
  hasParking: z.boolean().optional(),
  hasSmokingRoom: z.boolean().optional(),
  hasToilet: z.boolean().optional(),
  hasPowerOutlets: z.boolean().optional(),
  hasMushola: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  category: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  isVerified: z.boolean().optional(),
  googlePlaceId: z.string().trim().max(200).optional(),
  googleMapsUrl: z.string().url().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  menuItems: z.array(menuItemSchema).max(100).default([]),
  images: z.array(z.object({ url: z.string().url().max(500), isPrimary: z.boolean().optional() })).max(20).default([]),
})

const allowedSorts = new Set(["createdAt", "rating", "totalReviews", "name"])
const publicCacheHeaders = { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function authResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "12", 10) || 12))
    const search = searchParams.get("search")?.trim() || ""
    const category = searchParams.get("category")?.trim() || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"
    const where = {
      isVerified: true,
      ...(search ? { OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } },
        { tags: { has: search } },
      ] } : {}),
      ...(category ? { category: { has: category } } : {}),
    }
    const sort = allowedSorts.has(sortBy) ? sortBy : "createdAt"
    const [cafes, total] = await Promise.all([
      prisma.cafe.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: sortOrder },
        include: { images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true } }, _count: { select: { reviews: true } } },
      }),
      prisma.cafe.count({ where }),
    ])

    return NextResponse.json({
      cafes: cafes.map((cafe: { rating: number; _count: { reviews: number } }) => ({ ...cafe, avgRating: cafe.rating, totalReviews: cafe._count.reviews })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { headers: publicCacheHeaders })
  } catch {
    return NextResponse.json({ error: "Failed to fetch cafes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi()
    const parsed = cafeSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: "Data cafe tidak valid" }, { status: 400 })

    const { menuItems, images, ...cafeData } = parsed.data
    if (cafeData.googlePlaceId) {
      const duplicate = await prisma.cafe.findUnique({ where: { googlePlaceId: cafeData.googlePlaceId } })
      if (duplicate) return NextResponse.json({ error: "Cafe ini sudah pernah diimport", cafe: duplicate }, { status: 409 })
    }
    const baseSlug = slugify(cafeData.name) || `cafe-${Date.now()}`
    const existingSlugCount = await prisma.cafe.count({ where: { slug: { startsWith: baseSlug } } })
    const slug = existingSlugCount ? `${baseSlug}-${existingSlugCount + 1}` : baseSlug
    const cafe = await prisma.cafe.create({
      data: {
        ...cafeData,
        slug,
        isVerified: cafeData.isVerified ?? false,
        menuItems: { create: menuItems },
        images: { create: images.map((image, index) => ({ url: image.url, isPrimary: image.isPrimary ?? index === 0 })) },
      },
      include: { menuItems: true },
    })
    revalidateTag("cafes")
    return NextResponse.json({ cafe }, { status: 201 })
  } catch (error) {
    return authResponse(error)
  }
}
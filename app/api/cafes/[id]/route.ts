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

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().min(1).max(240).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  operatingHours: z.string().trim().max(120).nullable().optional(),
  closeOrder: z.string().trim().max(40).nullable().optional(),
  hasParking: z.boolean().optional(),
  hasSmokingRoom: z.boolean().optional(),
  hasToilet: z.boolean().optional(),
  hasPowerOutlets: z.boolean().optional(),
  hasMushola: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  googleMapsUrl: z.string().url().max(500).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  category: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  isVerified: z.boolean().optional(),
  menuItems: z.array(menuItemSchema).max(100).optional(),
})

function authResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cafe = await prisma.cafe.findFirst({
      where: { id: params.id, isVerified: true },
      include: {
        images: true,
        menuItems: { where: { isAvailable: true }, orderBy: { category: "asc" } },
        reviews: { where: { isAnomaly: false }, take: 50, include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      },
    })
    if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    return NextResponse.json({ cafe: { ...cafe, avgRating: cafe.rating, totalReviews: cafe.totalReviews } })
  } catch {
    return NextResponse.json({ error: "Failed to fetch cafe" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminApi()
    const parsed = updateSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: "Data cafe tidak valid" }, { status: 400 })
    const { menuItems, ...cafeData } = parsed.data
    const cafe = await prisma.$transaction(async (transactionClient) => {
      if (menuItems) await transactionClient.menuItem.deleteMany({ where: { CafeId: params.id } })
      return transactionClient.cafe.update({
        where: { id: params.id },
        data: { ...cafeData, ...(menuItems ? { menuItems: { create: menuItems } } : {}) },
        include: { menuItems: true },
      })
    })
    revalidateTag("cafes")
    return NextResponse.json({ cafe })
  } catch (error) {
    return authResponse(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminApi()
    await prisma.cafe.delete({ where: { id: params.id } })
    revalidateTag("cafes")
    return NextResponse.json({ success: true })
  } catch (error) {
    return authResponse(error)
  }
}
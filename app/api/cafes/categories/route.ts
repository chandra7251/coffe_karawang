import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const cafes = await prisma.cafe.findMany({
      select: { category: true }
    })

    const categories = [...new Set(cafes.flatMap((c: { category: string[] }) => c.category || []))]

    return NextResponse.json({ categories }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

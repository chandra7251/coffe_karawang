import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const cafes = await prisma.cafe.findMany({
      select: { tags: true }
    })

    const tags = [...new Set(cafes.flatMap((c: { tags: string[] }) => c.tags || []))]

    return NextResponse.json({ tags }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

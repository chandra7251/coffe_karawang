import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminApi, AuthError } from "@/lib/auth"
import prisma from "@/lib/prisma"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

function authResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi()
    const formData = await request.formData()
    const file = formData.get("file")
    const cafeId = formData.get("cafeId")
    const menuItemId = formData.get("menuItemId")

    if (!(file instanceof File) || typeof cafeId !== "string" || !cafeId.trim()) {
      return NextResponse.json({ error: "File and cafeId required" }, { status: 400 })
    }
    const cafe = await prisma.cafe.findUnique({ where: { id: cafeId }, select: { id: true } })
    if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Only JPG, PNG, or WebP files are allowed" }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File size must be 5 MB or less" }, { status: 400 })

    const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1]
    let menuItem = null
    if (menuItemId) {
      if (typeof menuItemId !== "string") return NextResponse.json({ error: "Invalid menuItemId" }, { status: 400 })
      menuItem = await prisma.menuItem.findFirst({ where: { id: menuItemId, CafeId: cafeId }, select: { id: true } })
      if (!menuItem) return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }
    const fileName = `${crypto.randomUUID()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
    const storagePath = menuItem ? `${cafeId}/menu/${fileName}` : `${cafeId}/${fileName}`
    const { data, error } = await supabase.storage.from("cafes").upload(storagePath, buffer, { contentType: file.type, upsert: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const publicUrl = supabase.storage.from("cafes").getPublicUrl(data.path).data.publicUrl
    if (menuItem) {
      const updatedMenuItem = await prisma.menuItem.update({ where: { id: menuItem.id }, data: { image: publicUrl } })
      revalidateTag("cafes")
      return NextResponse.json({ path: data.path, url: publicUrl, menuItem: updatedMenuItem }, { status: 201 })
    }
    const imageCount = await prisma.cafeImage.count({ where: { CafeId: cafeId } })
    const image = await prisma.cafeImage.create({ data: { CafeId: cafeId, url: publicUrl, isPrimary: imageCount === 0 } })
    revalidateTag("cafes")
    return NextResponse.json({ path: data.path, url: publicUrl, image }, { status: 201 })
  } catch (error) {
    return authResponse(error)
  }
}
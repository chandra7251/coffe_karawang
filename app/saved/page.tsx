export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { getCurrentProfile } from "@/lib/auth"
import ProfileContent from "@/app/profile/ProfileContent"

export default async function SavedPage() {
  const current = await getCurrentProfile()
  if (!current) redirect("/login?next=/saved")
  const profile = await prisma.user.findUnique({
    where: { id: current.profile.id },
    select: {
      name: true, bio: true, email: true, image: true,
      bookmarks: { where: { cafe: { isVerified: true } }, include: { cafe: { select: { id: true, name: true, address: true, rating: true, tags: true, hasParking: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } } }, orderBy: { createdAt: "desc" } },
    },
  })
  if (!profile) redirect("/login?next=/saved")
  return <ProfileContent profile={{ ...profile, reviews: [] }} active="saved" />
}


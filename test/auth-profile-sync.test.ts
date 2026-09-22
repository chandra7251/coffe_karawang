import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}))

vi.mock("@/lib/supabase", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}))

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
    },
  },
}))

vi.mock("next/navigation", () => ({ redirect: vi.fn() }))

import { getCurrentProfile } from "../lib/auth"

const oauthUser = {
  id: "supabase-user-1",
  email: "user@example.com",
  user_metadata: { name: "OAuth Name", avatar_url: "https://provider.example/avatar.jpg" },
}

describe("OAuth profile synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: oauthUser } })
    mocks.create.mockImplementation(async ({ data }) => data)
    mocks.update.mockImplementation(async ({ where, data }) => ({ id: where.id, ...data }))
    process.env.ADMIN_EMAILS = ""
  })

  it("uses OAuth name and image when creating a user for the first time", async () => {
    mocks.findUnique.mockResolvedValue(null)

    await getCurrentProfile()

    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "supabase-user-1",
        email: "user@example.com",
        name: "OAuth Name",
        image: "https://provider.example/avatar.jpg",
        role: "USER",
      }),
    })
  })

  it("keeps a custom name when an existing user signs in again", async () => {
    mocks.findUnique.mockResolvedValue({ id: "profile-1", email: oauthUser.email, name: "Nama Pilihan", image: null, role: "USER" })

    const current = await getCurrentProfile()

    expect(mocks.update).not.toHaveBeenCalled()
    expect(current?.profile.name).toBe("Nama Pilihan")
  })

  it("keeps a custom image when an existing user signs in again", async () => {
    mocks.findUnique.mockResolvedValue({ id: "profile-1", email: oauthUser.email, name: null, image: "https://cdn.example/custom-avatar.jpg", role: "USER" })

    const current = await getCurrentProfile()

    expect(mocks.update).not.toHaveBeenCalled()
    expect(current?.profile.image).toBe("https://cdn.example/custom-avatar.jpg")
  })
})

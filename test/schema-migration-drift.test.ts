import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const migrationPath = resolve("supabase/migrations/20260922000000_align_prisma_schema.sql")
const expectedColumns = [
  '"bio" TEXT',
  '"hasParking" BOOLEAN NOT NULL DEFAULT false',
  '"hasSmokingRoom" BOOLEAN NOT NULL DEFAULT false',
  '"hasToilet" BOOLEAN NOT NULL DEFAULT false',
  '"hasPowerOutlets" BOOLEAN NOT NULL DEFAULT false',
  '"hasMushola" BOOLEAN NOT NULL DEFAULT false',
  '"hasWifi" BOOLEAN NOT NULL DEFAULT false',
]

describe("Prisma schema alignment migration", () => {
  it("adds every Prisma field missing from earlier Supabase migrations", () => {
    expect(existsSync(migrationPath)).toBe(true)

    const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : ""
    expect(migration).toContain('ALTER TABLE "User"')
    expect(migration).toContain('ALTER TABLE "Cafe"')
    expect(migration).toContain("IF NOT EXISTS")
    expectedColumns.forEach((column) => expect(migration).toContain(column))
  })

  it("does not include destructive schema operations", () => {
    const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : ""
    expect(migration).not.toMatch(/\bDROP\b|\bTRUNCATE\b|\bDELETE\b|\bRENAME\b/i)
  })
})

import { describe, expect, it } from "vitest"
import { authCallbackOrigin } from "../lib/auth-callback-origin"

describe("auth callback origin", () => {
  it("uses canonical production origin behind an internal upstream host", () => {
    expect(authCallbackOrigin(new URL("http://0.0.0.0:3000/auth/callback"))).toBe("https://kopikarawang.my.id")
  })

  it("preserves localhost for local OAuth development", () => {
    expect(authCallbackOrigin(new URL("http://localhost:3000/auth/callback"))).toBe("http://localhost:3000")
  })
})

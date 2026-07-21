import { describe, expect, it } from "vitest"
import { detectReviewAnomaly } from "../lib/reviews"

describe("detectReviewAnomaly", () => {
  it("flags burst reviews from one user", () => {
    expect(detectReviewAnomaly({ recentUserReviews: 5, cafeRatings: [4, 5], userRating: 4 })).toEqual({
      isAnomaly: true,
      reasons: ["Multiple reviews from same user in 24h"],
    })
  })

  it("flags a new perfect rating on an all-perfect cafe", () => {
    expect(detectReviewAnomaly({ recentUserReviews: 0, cafeRatings: [5, 5, 5, 5], userRating: 5 }).isAnomaly).toBe(true)
  })

  it("accepts normal review activity", () => {
    expect(detectReviewAnomaly({ recentUserReviews: 1, cafeRatings: [4, 5, 3], userRating: 4 })).toEqual({ isAnomaly: false, reasons: [] })
  })
})
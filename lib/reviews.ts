export type ReviewAnomalyInput = {
  recentUserReviews: number
  cafeRatings: number[]
  userRating: number
}

export function detectReviewAnomaly({ recentUserReviews, cafeRatings, userRating }: ReviewAnomalyInput) {
  const reasons: string[] = []
  if (recentUserReviews >= 5) reasons.push("Multiple reviews from same user in 24h")
  if (cafeRatings.length >= 4 && cafeRatings.every((rating) => rating === 5) && userRating === 5) {
    reasons.push("All reviews are perfect 5-star ratings")
  }
  return { isAnomaly: reasons.length > 0, reasons }
}
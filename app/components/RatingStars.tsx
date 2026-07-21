import { Icon } from "@/app/components/Icon"

export default function RatingStars({ rating, size = "sm" }: { rating: number; size?: "xs" | "sm" | "md" }) {
  return <span className="rating-stars" aria-label={`${rating.toFixed(1)} dari 5 bintang`}>
    {Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" size={size} filled={index < Math.round(rating)} className={index < rating ? "rating-star-filled" : "rating-star-empty"} />)}
  </span>
}

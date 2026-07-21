CREATE INDEX IF NOT EXISTS "Cafe_isVerified_rating_idx"
  ON "Cafe"("isVerified", "rating");

CREATE INDEX IF NOT EXISTS "Review_CafeId_isAnomaly_createdAt_idx"
  ON "Review"("CafeId", "isAnomaly", "createdAt");

CREATE INDEX IF NOT EXISTS "Review_UserId_createdAt_idx"
  ON "Review"("UserId", "createdAt");

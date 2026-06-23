-- Featured gym manual payment system
-- Run against Neon PostgreSQL if not using `prisma db push`

CREATE TYPE "FeatureRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE "Gym"
  ADD COLUMN IF NOT EXISTS "featuredAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "featuredUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "featuredPlan" TEXT;

CREATE INDEX IF NOT EXISTS "Gym_featuredUntil_idx" ON "Gym"("featuredUntil");

CREATE TABLE IF NOT EXISTS "FeaturedPlan" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeaturedPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FeaturedPlan_slug_key" ON "FeaturedPlan"("slug");
CREATE INDEX IF NOT EXISTS "FeaturedPlan_isActive_sortOrder_idx" ON "FeaturedPlan"("isActive", "sortOrder");

CREATE TABLE IF NOT EXISTS "FeatureRequest" (
  "id" TEXT NOT NULL,
  "gymId" TEXT NOT NULL,
  "planId" TEXT,
  "plan" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "transactionId" TEXT,
  "screenshotUrl" TEXT,
  "screenshotPublicId" TEXT,
  "notes" TEXT,
  "status" "FeatureRequestStatus" NOT NULL DEFAULT 'pending',
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FeatureRequest_gymId_idx" ON "FeatureRequest"("gymId");
CREATE INDEX IF NOT EXISTS "FeatureRequest_status_idx" ON "FeatureRequest"("status");
CREATE INDEX IF NOT EXISTS "FeatureRequest_createdAt_idx" ON "FeatureRequest"("createdAt");

ALTER TABLE "FeatureRequest"
  ADD CONSTRAINT "FeatureRequest_gymId_fkey"
  FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FeatureRequest"
  ADD CONSTRAINT "FeatureRequest_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "FeaturedPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "FeaturedPlan" ("id", "slug", "name", "durationDays", "amount", "benefits", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (
    'plan_weekly_default',
    'weekly',
    'Featured for 7 Days',
    7,
    999,
    ARRAY['Appears at top of listings', 'Featured badge', 'Increased visibility'],
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'plan_monthly_default',
    'monthly',
    'Featured for 30 Days',
    30,
    2999,
    ARRAY['Top placement', 'Featured badge', 'Priority visibility'],
    true,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("slug") DO NOTHING;

-- Additive GymBranch support. Does not alter existing Gym columns.
-- Apply schema with `npx prisma db push`, then run:
--   npx tsx prisma/backfill-gym-branches.ts

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GymBranchStatus') THEN
    CREATE TYPE "GymBranchStatus" AS ENUM ('ACTIVE', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "GymBranch" (
  "id" TEXT NOT NULL,
  "gymId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "phone" TEXT,
  "whatsappNumber" TEXT,
  "email" TEXT,
  "openingHours" TEXT,
  "ladiesHours" TEXT,
  "status" "GymBranchStatus" NOT NULL DEFAULT 'ACTIVE',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GymBranch_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GymBranch_gymId_slug_key'
  ) THEN
    ALTER TABLE "GymBranch" ADD CONSTRAINT "GymBranch_gymId_slug_key" UNIQUE ("gymId", "slug");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GymBranch_gymId_fkey'
  ) THEN
    ALTER TABLE "GymBranch"
      ADD CONSTRAINT "GymBranch_gymId_fkey"
      FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "GymBranch_gymId_idx" ON "GymBranch"("gymId");
CREATE INDEX IF NOT EXISTS "GymBranch_city_idx" ON "GymBranch"("city");
CREATE INDEX IF NOT EXISTS "GymBranch_area_idx" ON "GymBranch"("area");
CREATE INDEX IF NOT EXISTS "GymBranch_status_idx" ON "GymBranch"("status");
CREATE INDEX IF NOT EXISTS "GymBranch_gymId_isPrimary_idx" ON "GymBranch"("gymId", "isPrimary");
CREATE INDEX IF NOT EXISTS "GymBranch_latitude_longitude_idx" ON "GymBranch"("latitude", "longitude");

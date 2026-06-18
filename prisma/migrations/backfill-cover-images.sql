-- Run after `npx prisma db push` to backfill coverImage from the first gallery row per gym.
-- Safe to run multiple times (only updates gyms with no cover yet).

UPDATE "Gym" AS g
SET "coverImage" = sub."url"
FROM (
  SELECT DISTINCT ON ("gymId") "gymId", "url"
  FROM "GymImage"
  ORDER BY "gymId", "id"
) AS sub
WHERE g."id" = sub."gymId"
  AND g."coverImage" IS NULL;

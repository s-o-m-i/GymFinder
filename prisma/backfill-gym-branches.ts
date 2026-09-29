import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  buildMainBranchFromGym,
  buildUniqueBranchSlug,
} from "../src/lib/gym-branch-rules";

/**
 * Idempotent backfill: one Main Branch (slug `main`) for every Gym with zero branches.
 * Does not merge gyms, drop location columns, or change existing branch rows.
 *
 *   npx tsx prisma/backfill-gym-branches.ts
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const gyms = await prisma.gym.findMany({
      select: {
        id: true,
        address: true,
        area: true,
        city: true,
        latitude: true,
        longitude: true,
        whatsappNumber: true,
        openingHours: true,
        ladiesHours: true,
        _count: { select: { branches: true } },
      },
    });

    let created = 0;
    let skipped = 0;

    for (const gym of gyms) {
      if (gym._count.branches > 0) {
        skipped += 1;
        continue;
      }

      const existingSlugs = (
        await prisma.gymBranch.findMany({
          where: { gymId: gym.id },
          select: { slug: true },
        })
      ).map((branch) => branch.slug);

      const payload = buildMainBranchFromGym(gym);
      const slug = buildUniqueBranchSlug(payload.slug, existingSlugs);

      await prisma.gymBranch.create({
        data: {
          gymId: gym.id,
          ...payload,
          slug,
        },
      });
      created += 1;
    }

    console.log(
      `Gym branch backfill complete. created=${created} skipped=${skipped}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Gym branch backfill failed:", error);
  process.exit(1);
});

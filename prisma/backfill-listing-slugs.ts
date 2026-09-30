import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  buildBranchListingSlug,
  buildUniqueListingSlug,
} from "../src/lib/gym-branch-rules";

/**
 * Idempotent: give every branch its own public listing slug from name + area + city.
 * Primary branches reuse the parent gym slug so /gyms/{gymSlug}/main stays the same.
 *
 *   npx tsx prisma/backfill-listing-slugs.ts
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
    const branches = await prisma.gymBranch.findMany({
      include: { gym: { select: { id: true, slug: true } } },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    let updated = 0;
    let skipped = 0;

    for (const branch of branches) {
      if (branch.listingSlug) {
        skipped += 1;
        continue;
      }

      const [otherGyms, otherBranches] = await Promise.all([
        prisma.gym.findMany({
          where: { id: { not: branch.gymId } },
          select: { slug: true },
        }),
        prisma.gymBranch.findMany({
          where: { id: { not: branch.id } },
          select: { listingSlug: true },
        }),
      ]);

      const desired = branch.isPrimary
        ? branch.gym.slug
        : buildBranchListingSlug(branch);

      const listingSlug = buildUniqueListingSlug(desired, [
        ...otherGyms.map((gym) => gym.slug),
        ...otherBranches
          .map((item) => item.listingSlug)
          .filter((slug): slug is string => Boolean(slug)),
      ]);

      await prisma.gymBranch.update({
        where: { id: branch.id },
        data: { listingSlug },
      });
      updated += 1;
      console.log(`${branch.name} -> /gyms/${listingSlug}/main`);
    }

    console.log(JSON.stringify({ updated, skipped }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import "server-only";

import type { Gym, GymBranch, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildMainBranchFromGym,
  buildUniqueBranchSlug,
  canDeleteGymBranch,
  gymLocationUpdateFromBranch,
  primaryBranchLocationFromGym,
  shouldOverwriteGymLocation,
  type GymLocationCache,
} from "@/lib/gym-branch-rules";
import { resolveAmenityIds, resolveDisciplineIds } from "@/lib/gym-tags";
import { syncGymBranchImages } from "@/lib/gym-images";
import type { GymBranchFormValues } from "@/lib/validations/gym-branch";

export const GYM_LOCATION_SELECT = {
  id: true,
  address: true,
  area: true,
  city: true,
  latitude: true,
  longitude: true,
  whatsappNumber: true,
  openingHours: true,
  ladiesHours: true,
} satisfies Prisma.GymSelect;

type GymLocationRow = Pick<Gym, keyof typeof GYM_LOCATION_SELECT>;

type BranchWriteClient = Prisma.TransactionClient | typeof prisma;

function toLocationCache(gym: GymLocationRow): GymLocationCache {
  return {
    address: gym.address,
    area: gym.area,
    city: gym.city,
    latitude: gym.latitude,
    longitude: gym.longitude,
    whatsappNumber: gym.whatsappNumber,
    openingHours: gym.openingHours,
    ladiesHours: gym.ladiesHours,
  };
}

async function uniqueSlugForGym(
  client: BranchWriteClient,
  gymId: string,
  desired: string,
  excludeBranchId?: string
): Promise<string> {
  const existing = await client.gymBranch.findMany({
    where: {
      gymId,
      ...(excludeBranchId ? { id: { not: excludeBranchId } } : {}),
    },
    select: { slug: true },
  });
  return buildUniqueBranchSlug(
    desired,
    existing.map((branch) => branch.slug)
  );
}

export async function upsertPrimaryBranchFromGym(
  gymId: string,
  client: BranchWriteClient = prisma
): Promise<GymBranch> {
  const gym = await client.gym.findUnique({
    where: { id: gymId },
    select: GYM_LOCATION_SELECT,
  });

  if (!gym) {
    throw new Error("GYM_NOT_FOUND");
  }

  const location = primaryBranchLocationFromGym(toLocationCache(gym));
  const existingPrimary = await client.gymBranch.findFirst({
    where: { gymId, isPrimary: true },
  });

  if (existingPrimary) {
    return client.gymBranch.update({
      where: { id: existingPrimary.id },
      data: location,
    });
  }

  const anyBranch = await client.gymBranch.findFirst({
    where: { gymId },
    orderBy: { createdAt: "asc" },
  });

  if (anyBranch) {
    return client.gymBranch.update({
      where: { id: anyBranch.id },
      data: { ...location, isPrimary: true },
    });
  }

  const created = buildMainBranchFromGym(toLocationCache(gym));
  const slug = await uniqueSlugForGym(client, gymId, created.slug);
  return client.gymBranch.create({
    data: {
      gymId,
      ...created,
      slug,
    },
  });
}

export async function syncGymFromPrimaryBranch(
  gymId: string,
  branch: {
    isPrimary: boolean;
    address: string;
    area: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    whatsappNumber: string | null;
    openingHours: string | null;
    ladiesHours: string | null;
  },
  client: BranchWriteClient = prisma
): Promise<void> {
  if (!shouldOverwriteGymLocation({ branchIsPrimary: branch.isPrimary })) {
    return;
  }

  const gym = await client.gym.findUnique({
    where: { id: gymId },
    select: { whatsappNumber: true },
  });
  if (!gym) return;

  await client.gym.update({
    where: { id: gymId },
    data: gymLocationUpdateFromBranch(branch, gym.whatsappNumber),
  });
}

export async function setPrimaryGymBranchRecord(
  gymId: string,
  branchId: string,
  client: BranchWriteClient = prisma
): Promise<GymBranch> {
  const branch = await client.gymBranch.findFirst({
    where: { id: branchId, gymId },
  });
  if (!branch) {
    throw new Error("BRANCH_NOT_FOUND");
  }

  await client.gymBranch.updateMany({
    where: { gymId, NOT: { id: branchId } },
    data: { isPrimary: false },
  });

  const updated = await client.gymBranch.update({
    where: { id: branchId },
    data: { isPrimary: true },
  });

  await syncGymFromPrimaryBranch(gymId, updated, client);
  return updated;
}

export type GymBranchWriteInput = {
  name: string;
  slug?: string | null;
  description?: string | null;
  address: string;
  area: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  openingHours: string | null;
  ladiesHours: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  ladiesStatus?: GymBranch["ladiesStatus"];
  sizeCategory?: GymBranch["sizeCategory"];
  establishedYear?: number | null;
  memberCount?: number | null;
  coachInfo?: string | null;
  equipment?: string | null;
  transformations?: string | null;
  status: GymBranch["status"];
  isPrimary?: boolean;
  useCommonAmenities?: boolean;
  useCommonDisciplines?: boolean;
  useCommonHours?: boolean;
  disciplineIds?: string[];
  amenityIds?: string[];
};

function listingFieldsFromInput(input: GymBranchWriteInput) {
  return {
    description: input.description ?? null,
    priceMin: input.priceMin ?? null,
    priceMax: input.priceMax ?? null,
    ladiesStatus: input.ladiesStatus ?? null,
    sizeCategory: input.sizeCategory ?? null,
    establishedYear: input.establishedYear ?? null,
    memberCount: input.memberCount ?? null,
    coachInfo: input.coachInfo ?? null,
    equipment: input.equipment ?? null,
    transformations: input.transformations ?? null,
    useCommonAmenities: input.useCommonAmenities ?? true,
    useCommonDisciplines: input.useCommonDisciplines ?? true,
    useCommonHours: input.useCommonHours ?? true,
  };
}

async function syncBranchTags(
  client: BranchWriteClient,
  gymBranchId: string,
  input: GymBranchWriteInput
) {
  const useCommonAmenities = input.useCommonAmenities ?? true;
  const useCommonDisciplines = input.useCommonDisciplines ?? true;

  await client.gymBranchAmenity.deleteMany({ where: { gymBranchId } });
  await client.gymBranchDiscipline.deleteMany({ where: { gymBranchId } });

  if (!useCommonAmenities && input.amenityIds?.length) {
    await client.gymBranchAmenity.createMany({
      data: input.amenityIds.map((amenityId) => ({ gymBranchId, amenityId })),
    });
  }

  if (!useCommonDisciplines && input.disciplineIds?.length) {
    await client.gymBranchDiscipline.createMany({
      data: input.disciplineIds.map((disciplineId) => ({
        gymBranchId,
        disciplineId,
      })),
    });
  }
}

export async function createGymBranchRecord(
  gymId: string,
  input: GymBranchWriteInput,
  client: BranchWriteClient = prisma
): Promise<GymBranch> {
  const existingCount = await client.gymBranch.count({ where: { gymId } });
  const makePrimary = existingCount === 0 || Boolean(input.isPrimary);
  const slug = await uniqueSlugForGym(
    client,
    gymId,
    input.slug || input.name
  );

  const created = await client.gymBranch.create({
    data: {
      gymId,
      name: input.name,
      slug,
      address: input.address,
      area: input.area,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      phone: input.phone,
      whatsappNumber: input.whatsappNumber,
      email: input.email,
      openingHours: input.openingHours,
      ladiesHours: input.ladiesHours,
      status: input.status,
      isPrimary: makePrimary,
      ...listingFieldsFromInput(input),
    },
  });

  await syncBranchTags(client, created.id, input);

  if (makePrimary) {
    await client.gymBranch.updateMany({
      where: { gymId, NOT: { id: created.id } },
      data: { isPrimary: false },
    });
    await syncGymFromPrimaryBranch(gymId, created, client);
  }

  return created;
}

export async function updateGymBranchRecord(
  gymId: string,
  branchId: string,
  input: GymBranchWriteInput,
  client: BranchWriteClient = prisma
): Promise<GymBranch> {
  const existing = await client.gymBranch.findFirst({
    where: { id: branchId, gymId },
  });
  if (!existing) {
    throw new Error("BRANCH_NOT_FOUND");
  }

  const slug = await uniqueSlugForGym(
    client,
    gymId,
    input.slug || input.name,
    branchId
  );
  const makePrimary = Boolean(input.isPrimary) || existing.isPrimary;

  const updated = await client.gymBranch.update({
    where: { id: branchId },
    data: {
      name: input.name,
      slug,
      address: input.address,
      area: input.area,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      phone: input.phone,
      whatsappNumber: input.whatsappNumber,
      email: input.email,
      openingHours: input.openingHours,
      ladiesHours: input.ladiesHours,
      status: input.status,
      isPrimary: makePrimary,
      ...listingFieldsFromInput(input),
    },
  });

  await syncBranchTags(client, branchId, input);

  if (makePrimary) {
    await client.gymBranch.updateMany({
      where: { gymId, NOT: { id: branchId } },
      data: { isPrimary: false },
    });
    await syncGymFromPrimaryBranch(gymId, updated, client);
  }

  return updated;
}

export async function deleteGymBranchRecord(
  gymId: string,
  branchId: string,
  client: BranchWriteClient = prisma
): Promise<void> {
  const existing = await client.gymBranch.findFirst({
    where: { id: branchId, gymId },
  });
  if (!existing) {
    throw new Error("BRANCH_NOT_FOUND");
  }

  const totalBranchCount = await client.gymBranch.count({ where: { gymId } });
  const allowed = canDeleteGymBranch({
    isPrimary: existing.isPrimary,
    totalBranchCount,
  });
  if (!allowed.ok) {
    throw new Error(allowed.reason);
  }

  await client.gymBranch.delete({ where: { id: branchId } });
}

/**
 * Idempotent backfill: create a Main Branch for every gym that has zero branches.
 * Safe to run multiple times. Never merges gyms or overwrites existing branches.
 */
export async function backfillMissingPrimaryBranches(
  client: BranchWriteClient = prisma
): Promise<{ created: number; skipped: number }> {
  const gyms = await client.gym.findMany({
    select: {
      ...GYM_LOCATION_SELECT,
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

    const payload = buildMainBranchFromGym(toLocationCache(gym));
    const slug = await uniqueSlugForGym(client, gym.id, payload.slug);
    await client.gymBranch.create({
      data: {
        gymId: gym.id,
        ...payload,
        slug,
      },
    });
    created += 1;
  }

  return { created, skipped };
}

export const ACTIVE_BRANCH_WHERE = {
  status: "ACTIVE" as const,
};

export async function persistGymBranchFromParsed(
  gymId: string,
  parsed: GymBranchFormValues,
  branchId?: string
): Promise<GymBranch> {
  const disciplineIds = parsed.useCommonDisciplines
    ? []
    : await resolveDisciplineIds(
        prisma,
        parsed.disciplines ?? [],
        parsed.customDisciplines ?? []
      );
  const amenityIds = parsed.useCommonAmenities
    ? []
    : await resolveAmenityIds(
        prisma,
        parsed.amenities ?? [],
        parsed.customAmenities ?? []
      );

  const writeInput: GymBranchWriteInput = {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    address: parsed.address,
    area: parsed.area,
    city: parsed.city,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    phone: parsed.phone,
    whatsappNumber: parsed.whatsappNumber,
    email: parsed.email,
    openingHours: parsed.openingHours,
    ladiesHours: parsed.ladiesHours,
    priceMin: parsed.priceMin,
    priceMax: parsed.priceMax,
    ladiesStatus: (parsed.ladiesStatus || null) as GymBranchWriteInput["ladiesStatus"],
    sizeCategory: (parsed.sizeCategory || null) as GymBranchWriteInput["sizeCategory"],
    establishedYear: parsed.establishedYear,
    memberCount: parsed.memberCount,
    coachInfo: parsed.coachInfo,
    equipment: parsed.equipment,
    transformations: parsed.transformations,
    status: parsed.status,
    isPrimary: parsed.isPrimary,
    useCommonAmenities: parsed.useCommonAmenities,
    useCommonDisciplines: parsed.useCommonDisciplines,
    useCommonHours: parsed.useCommonHours,
    disciplineIds,
    amenityIds,
  };

  const branch = await prisma.$transaction((tx) =>
    branchId
      ? updateGymBranchRecord(gymId, branchId, writeInput, tx)
      : createGymBranchRecord(gymId, writeInput, tx)
  );

  await syncGymBranchImages(
    gymId,
    branch.id,
    parsed.coverImage,
    parsed.galleryImages
  );
  return branch;
}

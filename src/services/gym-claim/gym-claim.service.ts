import "server-only";

import type { GymClaimStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { GymClaimSubmitInput } from "@/lib/validations/gym-claim";

export class GymClaimError extends Error {
  constructor(
    message: string,
    public code:
      | "NOT_FOUND"
      | "ALREADY_CLAIMED"
      | "DUPLICATE_PENDING"
      | "OWNER_HAS_GYM"
      | "NOT_PENDING"
      | "CLAIMANT_HAS_GYM"
      | "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "GymClaimError";
  }
}

export async function submitGymClaim(input: GymClaimSubmitInput, claimantOwnerId: string) {
  const gym = await prisma.gym.findUnique({
    where: { id: input.gymId },
    select: { id: true, name: true, slug: true, claimed: true, ownerId: true, listingStatus: true },
  });

  if (!gym || gym.listingStatus !== "approved") {
    throw new GymClaimError("Gym not found.", "NOT_FOUND");
  }

  if (gym.claimed || gym.ownerId) {
    throw new GymClaimError("This gym profile is already managed by an owner.", "ALREADY_CLAIMED");
  }

  const ownerExistingGym = await prisma.gym.findUnique({
    where: { ownerId: claimantOwnerId },
    select: { id: true },
  });
  if (ownerExistingGym && ownerExistingGym.id !== gym.id) {
    throw new GymClaimError(
      "You already manage a gym listing. Each account can claim one gym.",
      "OWNER_HAS_GYM"
    );
  }

  const pending = await prisma.gymClaimRequest.findFirst({
    where: {
      gymId: gym.id,
      claimantOwnerId,
      status: "PENDING",
    },
    select: { id: true },
  });
  if (pending) {
    throw new GymClaimError("You already have a pending claim for this gym.", "DUPLICATE_PENDING");
  }

  const claim = await prisma.gymClaimRequest.create({
    data: {
      gymId: gym.id,
      claimantOwnerId,
      fullName: input.fullName,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      whatsapp: input.whatsapp,
      position: input.position,
      instagramUrl: input.instagramUrl?.trim() || null,
      facebookUrl: input.facebookUrl?.trim() || null,
      message: input.message?.trim() || null,
    },
    include: {
      gym: { select: { name: true, slug: true } },
    },
  });

  return claim;
}

export async function approveGymClaim(claimId: string, reviewedBy = "admin", adminNotes?: string) {
  const claim = await prisma.gymClaimRequest.findUnique({
    where: { id: claimId },
    include: {
      gym: { select: { id: true, name: true, slug: true, claimed: true, ownerId: true } },
      claimant: { select: { id: true, email: true, name: true } },
    },
  });

  if (!claim) throw new GymClaimError("Claim not found.", "NOT_FOUND");
  if (claim.status !== "PENDING") throw new GymClaimError("This claim was already reviewed.", "NOT_PENDING");
  if (claim.gym.claimed || claim.gym.ownerId) {
    throw new GymClaimError("This gym is already claimed.", "ALREADY_CLAIMED");
  }
  if (!claim.claimantOwnerId || !claim.claimant) {
    throw new GymClaimError("Claimant account is required for approval.", "UNAUTHORIZED");
  }

  const otherGym = await prisma.gym.findUnique({
    where: { ownerId: claim.claimantOwnerId },
    select: { id: true },
  });
  if (otherGym && otherGym.id !== claim.gym.id) {
    throw new GymClaimError("Claimant already manages another gym listing.", "CLAIMANT_HAS_GYM");
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.gymClaimRequest.update({
      where: { id: claimId },
      data: {
        status: "APPROVED",
        reviewedAt: now,
        reviewedBy,
        adminNotes: adminNotes?.trim() || claim.adminNotes,
      },
    }),
    prisma.gym.update({
      where: { id: claim.gym.id },
      data: {
        ownerId: claim.claimantOwnerId,
        claimed: true,
        claimedAt: now,
      },
    }),
  ]);

  return {
    claimId,
    gymId: claim.gym.id,
    gymName: claim.gym.name,
    gymSlug: claim.gym.slug,
    claimantOwnerId: claim.claimantOwnerId,
    claimantEmail: claim.claimant.email,
    claimantName: claim.claimant.name,
  };
}

export async function rejectGymClaim(
  claimId: string,
  reviewedBy = "admin",
  rejectionReason?: string,
  adminNotes?: string
) {
  const claim = await prisma.gymClaimRequest.findUnique({
    where: { id: claimId },
    include: {
      gym: { select: { name: true, slug: true } },
      claimant: { select: { email: true, name: true } },
    },
  });

  if (!claim) throw new GymClaimError("Claim not found.", "NOT_FOUND");
  if (claim.status !== "PENDING") throw new GymClaimError("This claim was already reviewed.", "NOT_PENDING");

  await prisma.gymClaimRequest.update({
    where: { id: claimId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy,
      rejectionReason: rejectionReason?.trim() || null,
      adminNotes: adminNotes?.trim() || null,
    },
  });

  return {
    claimId,
    gymName: claim.gym.name,
    claimantEmail: claim.email,
    claimantName: claim.fullName,
    claimantAccountEmail: claim.claimant?.email,
    rejectionReason: rejectionReason?.trim(),
  };
}

export interface AdminClaimListFilters {
  status?: GymClaimStatus | "ALL";
  q?: string;
  city?: string;
  sort?: "newest" | "oldest";
}

export async function listGymClaimsForAdmin(filters: AdminClaimListFilters = {}) {
  const where: Prisma.GymClaimRequestWhereInput = {
    ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.city ? { gym: { city: { equals: filters.city, mode: "insensitive" } } } : {}),
    ...(filters.q
      ? {
          OR: [
            { fullName: { contains: filters.q, mode: "insensitive" } },
            { email: { contains: filters.q, mode: "insensitive" } },
            { phone: { contains: filters.q, mode: "insensitive" } },
            { whatsapp: { contains: filters.q, mode: "insensitive" } },
            { gym: { name: { contains: filters.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  return prisma.gymClaimRequest.findMany({
    where,
    orderBy: { submittedAt: filters.sort === "oldest" ? "asc" : "desc" },
    take: 200,
    include: {
      gym: {
        select: { id: true, name: true, slug: true, city: true, whatsappNumber: true },
      },
      claimant: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getGymClaimById(claimId: string) {
  return prisma.gymClaimRequest.findUnique({
    where: { id: claimId },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          area: true,
          address: true,
          whatsappNumber: true,
          listingStatus: true,
          claimed: true,
          ownerId: true,
        },
      },
      claimant: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
}

export async function getOwnerClaimRequests(ownerId: string) {
  return prisma.gymClaimRequest.findMany({
    where: { claimantOwnerId: ownerId },
    orderBy: { submittedAt: "desc" },
    include: {
      gym: { select: { id: true, name: true, slug: true, city: true } },
    },
  });
}

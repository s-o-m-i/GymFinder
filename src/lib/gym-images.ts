import { deleteImage, deleteImages } from "@/lib/cloudinary";
import "server-only";
import { prisma } from "@/lib/prisma";

export interface ImagePayload {
  imageUrl: string;
  publicId?: string | null;
  id?:       string;
  alt?:      string | null;
}

export interface CoverImagePayload {
  imageUrl: string;
  publicId?: string | null;
}

export const GYM_LEVEL_IMAGE_WHERE = { branchId: null } as const;

export async function deleteGymCloudinaryAssets(gymId: string): Promise<void> {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      coverImagePublicId: true,
      galleryImages: { select: { publicId: true } },
      branches: { select: { coverImagePublicId: true } },
    },
  });

  if (!gym) return;

  const publicIds = [
    gym.coverImagePublicId,
    ...gym.galleryImages.map((img) => img.publicId),
    ...gym.branches.map((branch) => branch.coverImagePublicId),
  ].filter((id): id is string => Boolean(id));

  await deleteImages(publicIds);
}

export async function syncGymImages(
  gymId: string,
  cover: CoverImagePayload | null | undefined,
  gallery: ImagePayload[] | undefined,
  removedPublicIds: string[] = []
): Promise<void> {
  for (const publicId of removedPublicIds) {
    try {
      await deleteImage(publicId);
    } catch (err) {
      console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
    }
  }

  if (cover !== undefined) {
    const existing = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { coverImagePublicId: true },
    });

    if (
      existing?.coverImagePublicId &&
      existing.coverImagePublicId !== cover?.publicId
    ) {
      try {
        await deleteImage(existing.coverImagePublicId);
      } catch (err) {
        console.error("Failed to delete old cover image:", err);
      }
    }

    await prisma.gym.update({
      where: { id: gymId },
      data: {
        coverImage:         cover?.imageUrl ?? null,
        coverImagePublicId: cover?.publicId ?? null,
      },
    });
  }

  if (gallery !== undefined) {
    const existingGallery = await prisma.gymImage.findMany({
      where: { gymId, branchId: null },
      select: { id: true, publicId: true },
    });

    const incomingIds = new Set(
      gallery.filter((g) => g.id).map((g) => g.id!)
    );

    const toRemove = existingGallery.filter((img) => !incomingIds.has(img.id));
    for (const img of toRemove) {
      if (img.publicId) {
        try {
          await deleteImage(img.publicId);
        } catch (err) {
          console.error(`Failed to delete gallery image ${img.publicId}:`, err);
        }
      }
    }

    await prisma.gymImage.deleteMany({
      where: { gymId, branchId: null, id: { in: toRemove.map((i) => i.id) } },
    });

    const toCreate = gallery.filter((g) => !g.id);
    if (toCreate.length > 0) {
      await prisma.gymImage.createMany({
        data: toCreate.map((g) => ({
          gymId,
          branchId: null,
          imageUrl: g.imageUrl,
          publicId: g.publicId ?? null,
          alt:      g.alt ?? null,
        })),
      });
    }
  }
}

export async function syncGymBranchImages(
  gymId: string,
  branchId: string,
  cover: CoverImagePayload | null | undefined,
  gallery: ImagePayload[] | undefined,
  removedPublicIds: string[] = []
): Promise<void> {
  for (const publicId of removedPublicIds) {
    try {
      await deleteImage(publicId);
    } catch (err) {
      console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
    }
  }

  if (cover !== undefined) {
    const existing = await prisma.gymBranch.findUnique({
      where: { id: branchId },
      select: { coverImagePublicId: true, gymId: true },
    });
    if (!existing || existing.gymId !== gymId) return;

    if (
      existing.coverImagePublicId &&
      existing.coverImagePublicId !== cover?.publicId
    ) {
      try {
        await deleteImage(existing.coverImagePublicId);
      } catch (err) {
        console.error("Failed to delete old branch cover image:", err);
      }
    }

    await prisma.gymBranch.update({
      where: { id: branchId },
      data: {
        coverImage: cover?.imageUrl ?? null,
        coverImagePublicId: cover?.publicId ?? null,
      },
    });
  }

  if (gallery !== undefined) {
    const existingGallery = await prisma.gymImage.findMany({
      where: { gymId, branchId },
      select: { id: true, publicId: true },
    });

    const incomingIds = new Set(
      gallery.filter((g) => g.id).map((g) => g.id!)
    );

    const toRemove = existingGallery.filter((img) => !incomingIds.has(img.id));
    for (const img of toRemove) {
      if (img.publicId) {
        try {
          await deleteImage(img.publicId);
        } catch (err) {
          console.error(`Failed to delete branch gallery image ${img.publicId}:`, err);
        }
      }
    }

    await prisma.gymImage.deleteMany({
      where: { gymId, branchId, id: { in: toRemove.map((i) => i.id) } },
    });

    const toCreate = gallery.filter((g) => !g.id);
    if (toCreate.length > 0) {
      await prisma.gymImage.createMany({
        data: toCreate.map((g) => ({
          gymId,
          branchId,
          imageUrl: g.imageUrl,
          publicId: g.publicId ?? null,
          alt: g.alt ?? null,
        })),
      });
    }
  }
}

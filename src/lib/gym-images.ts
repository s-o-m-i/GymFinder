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

export async function deleteGymCloudinaryAssets(gymId: string): Promise<void> {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      coverImagePublicId: true,
      galleryImages: { select: { publicId: true } },
    },
  });

  if (!gym) return;

  const publicIds = [
    gym.coverImagePublicId,
    ...gym.galleryImages.map((img) => img.publicId),
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
      where: { gymId },
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
      where: { gymId, id: { in: toRemove.map((i) => i.id) } },
    });

    const toCreate = gallery.filter((g) => !g.id);
    if (toCreate.length > 0) {
      await prisma.gymImage.createMany({
        data: toCreate.map((g) => ({
          gymId,
          imageUrl: g.imageUrl,
          publicId: g.publicId ?? null,
          alt:      g.alt ?? null,
        })),
      });
    }
  }
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { GymForm } from "@/components/admin/GymForm";
import { toUploaded } from "@/lib/gym-images-form";
import { businessCategoryLabel } from "@/lib/owner-constants";

async function getData(ownerId: string) {
  const [owner, disciplines, amenities, gym] = await Promise.all([
    prisma.gymOwner.findUnique({ where: { id: ownerId } }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
    prisma.gym.findUnique({
      where: { ownerId },
      include: {
        galleryImages: true,
        disciplines: { include: { discipline: true } },
        amenities: { include: { amenity: true } },
      },
    }),
  ]);
  return { owner, disciplines, amenities, gym };
}

export default async function OwnerGymPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const { owner, disciplines, amenities, gym } = await getData(session.ownerId);
  if (!owner) redirect("/owner/login");

  const isEdit = !!gym;
  const listingLabel = owner.businessCategory === "fighting_club" ? "Fighting Club" : "Gym";

  const initialData = gym
    ? {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        type: gym.type,
        description: gym.description,
        address: gym.address,
        area: gym.area,
        city: gym.city,
        latitude: gym.latitude?.toString() ?? "",
        longitude: gym.longitude?.toString() ?? "",
        priceMin: gym.priceMin.toString(),
        priceMax: gym.priceMax.toString(),
        ladiesStatus: gym.ladiesStatus,
        sizeCategory: gym.sizeCategory,
        whatsappNumber: gym.whatsappNumber,
        openingHours: gym.openingHours ?? "",
        coachInfo: gym.coachInfo ?? "",
        coverImage: gym.coverImage
          ? toUploaded({ imageUrl: gym.coverImage, publicId: gym.coverImagePublicId ?? undefined })
          : null,
        galleryImages: gym.galleryImages.map((img) =>
          toUploaded({ id: img.id, imageUrl: img.imageUrl, publicId: img.publicId ?? undefined })
        ),
        disciplineIds: gym.disciplines.map((d) => d.disciplineId),
        amenityIds: gym.amenities.map((a) => a.amenityId),
      }
    : undefined;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
          {isEdit ? `Edit Your ${listingLabel}` : `Add Your ${listingLabel}`}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {businessCategoryLabel(owner.businessCategory)} · One listing per account
        </p>
      </div>

      <GymForm
        initialData={initialData}
        disciplines={disciplines}
        amenities={amenities}
        mode={isEdit ? "edit" : "create"}
        variant="owner"
      />
    </div>
  );
}

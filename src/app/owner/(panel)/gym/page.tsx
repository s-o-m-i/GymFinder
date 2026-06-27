export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { GymForm } from "@/components/admin/GymForm";
import { buildGymFormImageState } from "@/lib/gym-images-form";
import {
  businessCategoryLabel,
  isDisciplineAllowedForOwner,
} from "@/lib/owner-constants";
import { splitLinkedTags } from "@/lib/gym-tags";

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
  const visibleDisciplines = disciplines.filter((item) =>
    isDisciplineAllowedForOwner(item.name, owner.businessCategory)
  );

  const disciplineTags = gym
    ? splitLinkedTags(
        gym.disciplines.map((item) => ({
          id: item.disciplineId,
          name: item.discipline.name,
        })),
        visibleDisciplines
      )
    : { selectedIds: [], customNames: [] };

  const amenityTags = gym
    ? splitLinkedTags(
        gym.amenities.map((item) => ({
          id: item.amenityId,
          name: item.amenity.name,
        })),
        amenities
      )
    : { selectedIds: [], customNames: [] };

  const initialData = gym
    ? (() => {
        const { coverImage, galleryImages } = buildGymFormImageState({
          coverImage: gym.coverImage,
          coverImagePublicId: gym.coverImagePublicId,
          galleryImages: gym.galleryImages,
        });

        return {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        type: gym.type,
        customTypeLabel: gym.customTypeLabel ?? "",
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
        establishedYear: gym.establishedYear?.toString() ?? "",
        memberCount: gym.memberCount?.toString() ?? "",
        whatsappNumber: gym.whatsappNumber,
        openingHours: gym.openingHours ?? "",
        ladiesHours: gym.ladiesHours ?? "",
        coachInfo: gym.coachInfo ?? "",
        coverImage,
        galleryImages,
        disciplineIds: disciplineTags.selectedIds,
        customDisciplineNames: disciplineTags.customNames,
        amenityIds: amenityTags.selectedIds,
        customAmenityNames: amenityTags.customNames,
      };
      })()
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
        businessCategory={owner.businessCategory}
      />
    </div>
  );
}

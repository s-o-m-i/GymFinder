export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GymForm } from "@/components/admin/GymForm";
import { toUploaded } from "@/lib/gym-images-form";
import { splitLinkedTags } from "@/lib/gym-tags";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  const [gym, disciplines, amenities] = await Promise.all([
    prisma.gym.findUnique({
      where: { id },
      include: {
        galleryImages: true,
        disciplines: { include: { discipline: true } },
        amenities: { include: { amenity: true } },
      },
    }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { gym, disciplines, amenities };
}

export default async function EditGymPage({ params }: PageProps) {
  const { id } = await params;
  const { gym, disciplines, amenities } = await getData(id);

  if (!gym) notFound();

  const disciplineTags = splitLinkedTags(
    gym.disciplines.map((item) => ({
      id: item.disciplineId,
      name: item.discipline.name,
    })),
    disciplines
  );

  const amenityTags = splitLinkedTags(
    gym.amenities.map((item) => ({
      id: item.amenityId,
      name: item.amenity.name,
    })),
    amenities
  );

  const initialData = {
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
    featured: gym.featured,
    rating: gym.rating?.toString() ?? "",
    coverImage: gym.coverImage
      ? toUploaded({ imageUrl: gym.coverImage, publicId: gym.coverImagePublicId ?? undefined })
      : null,
    galleryImages: gym.galleryImages.map((img) =>
      toUploaded({ id: img.id, imageUrl: img.imageUrl, publicId: img.publicId ?? undefined })
    ),
    disciplineIds: disciplineTags.selectedIds,
    customDisciplineNames: disciplineTags.customNames,
    amenityIds: amenityTags.selectedIds,
    customAmenityNames: amenityTags.customNames,
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
          Edit: {gym.name}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Update gym information below.
        </p>
      </div>

      <GymForm
        initialData={initialData}
        disciplines={disciplines}
        amenities={amenities}
        mode="edit"
      />
    </div>
  );
}

import "server-only";

import { prisma } from "@/lib/prisma";
import { buildGymFormImageState } from "@/lib/gym-images-form";
import { splitLinkedTags } from "@/lib/gym-tags";
import { branchToForm } from "@/lib/gym-branch-form-state";

export async function getGymTagCatalog() {
  const [disciplines, amenities] = await Promise.all([
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { disciplines, amenities };
}

export async function getBranchFormInitialData(
  gymId: string,
  branchId: string,
  catalog: {
    disciplines: { id: string; name: string }[];
    amenities: { id: string; name: string }[];
  }
) {
  const branch = await prisma.gymBranch.findFirst({
    where: { id: branchId, gymId },
    include: {
      galleryImages: true,
      disciplines: { include: { discipline: true } },
      amenities: { include: { amenity: true } },
    },
  });
  if (!branch) return null;

  const { coverImage, galleryImages } = buildGymFormImageState({
    coverImage: branch.coverImage,
    coverImagePublicId: branch.coverImagePublicId,
    galleryImages: branch.galleryImages,
  });

  const disciplineTags = splitLinkedTags(
    branch.disciplines.map((item) => ({
      id: item.disciplineId,
      name: item.discipline.name,
    })),
    catalog.disciplines
  );
  const amenityTags = splitLinkedTags(
    branch.amenities.map((item) => ({
      id: item.amenityId,
      name: item.amenity.name,
    })),
    catalog.amenities
  );

  return branchToForm(branch, {
    coverImage,
    galleryImages,
    disciplineIds: disciplineTags.selectedIds,
    customDisciplineNames: disciplineTags.customNames,
    amenityIds: amenityTags.selectedIds,
    customAmenityNames: amenityTags.customNames,
  });
}

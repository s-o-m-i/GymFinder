import "server-only";

import { prisma } from "@/lib/prisma";
import { resolveAmenityIds, resolveDisciplineIds } from "@/lib/gym-tags";
import type { GymCommonSettingsValues } from "@/lib/validations/gym-common";

export async function persistGymCommonSettings(
  gymId: string,
  parsed: GymCommonSettingsValues
) {
  const disciplineIds = await resolveDisciplineIds(
    prisma,
    parsed.disciplines ?? [],
    parsed.customDisciplines ?? []
  );
  const amenityIds = await resolveAmenityIds(
    prisma,
    parsed.amenities ?? [],
    parsed.customAmenities ?? []
  );

  await prisma.gym.update({
    where: { id: gymId },
    data: {
      openingHours: parsed.openingHours,
      ladiesHours: parsed.ladiesHours,
      ladiesStatus: parsed.ladiesStatus,
      disciplines: {
        deleteMany: {},
        create: disciplineIds.map((disciplineId) => ({
          discipline: { connect: { id: disciplineId } },
        })),
      },
      amenities: {
        deleteMany: {},
        create: amenityIds.map((amenityId) => ({
          amenity: { connect: { id: amenityId } },
        })),
      },
    },
  });
}

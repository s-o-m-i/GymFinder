"use client";

import { updateAdminGymCommonSettings } from "@/app/actions/admin/gym-common";
import {
  GymCommonSettingsForm,
  type GymCommonSettingsFormState,
} from "@/components/gym-branch/GymCommonSettingsForm";
import type { LadiesStatus } from "@prisma/client";

interface AdminGymCommonSettingsFormProps {
  gymId: string;
  gym: {
    openingHours: string | null;
    ladiesHours: string | null;
    ladiesStatus: LadiesStatus;
  };
  disciplines: { id: string; name: string }[];
  amenities: { id: string; name: string }[];
  disciplineTags: { selectedIds: string[]; customNames: string[] };
  amenityTags: { selectedIds: string[]; customNames: string[] };
}

export function AdminGymCommonSettingsForm({
  gymId,
  gym,
  disciplines,
  amenities,
  disciplineTags,
  amenityTags,
}: AdminGymCommonSettingsFormProps) {
  const initialData: GymCommonSettingsFormState = {
    openingHours: gym.openingHours ?? "",
    ladiesHours: gym.ladiesHours ?? "",
    ladiesStatus: gym.ladiesStatus,
    disciplineIds: disciplineTags.selectedIds,
    customDisciplineNames: disciplineTags.customNames,
    amenityIds: amenityTags.selectedIds,
    customAmenityNames: amenityTags.customNames,
  };

  return (
    <GymCommonSettingsForm
      initialData={initialData}
      disciplines={disciplines}
      amenities={amenities}
      membershipsHref={`/admin/edit-gym/${gymId}`}
      onSubmit={(input) => updateAdminGymCommonSettings(gymId, input)}
    />
  );
}

import { z } from "zod";

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const gymCommonSettingsSchema = z.object({
  openingHours: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(200).nullable()),
  ladiesHours: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(200).nullable()),
  ladiesStatus: z.enum(["mixed", "ladies_only", "ladies_timings", "men_only"]),
  disciplines: z.array(z.string()).optional().default([]),
  customDisciplines: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  customAmenities: z.array(z.string()).optional().default([]),
});

export type GymCommonSettingsInput = z.input<typeof gymCommonSettingsSchema>;
export type GymCommonSettingsValues = z.output<typeof gymCommonSettingsSchema>;

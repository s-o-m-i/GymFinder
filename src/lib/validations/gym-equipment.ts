import { z } from "zod";
import {
  GYM_EQUIPMENT_ITEM_MAX_CHARS,
  GYM_EQUIPMENT_ITEM_MAX_WORDS,
  GYM_EQUIPMENT_MAX_ITEMS,
  countEquipmentWords,
} from "@/lib/gym-equipment";

const equipmentItemSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Equipment name is required")
    .max(
      GYM_EQUIPMENT_ITEM_MAX_CHARS,
      `Each item must be ${GYM_EQUIPMENT_ITEM_MAX_CHARS} characters or less`
    )
    .superRefine((val, ctx) => {
      const words = countEquipmentWords(val);
      if (words > GYM_EQUIPMENT_ITEM_MAX_WORDS) {
        ctx.addIssue({
          code: "custom",
          message: `Each item must be ${GYM_EQUIPMENT_ITEM_MAX_WORDS} words or less`,
        });
      }
    }),
});

export const gymEquipmentSchema = z
  .array(equipmentItemSchema)
  .max(GYM_EQUIPMENT_MAX_ITEMS, `Maximum ${GYM_EQUIPMENT_MAX_ITEMS} equipment items allowed`);

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

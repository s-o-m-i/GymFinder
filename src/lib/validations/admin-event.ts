import { createEventSchema } from "@/lib/validations/event";
import { z } from "zod";

export const adminEventSchema = createEventSchema.extend({
  gymId: z.string().optional().nullable(),
});

export type AdminEventInput = z.infer<typeof adminEventSchema>;

import { z } from "zod";

export const trainerAnalyticsRedirectSchema = z.object({
  trainerId: z.string().min(1),
  event: z.enum(["WHATSAPP_CLICK", "PHONE_CLICK", "CONTACT_CLICK"]),
});

import { z } from "zod";

export const analyticsPeriodSchema = z.enum(["7d", "30d", "90d", "all"]);

export type AnalyticsPeriod = z.infer<typeof analyticsPeriodSchema>;

export const analyticsRedirectSchema = z.object({
  gymId: z.string().min(1),
  event: z.enum([
    "WHATSAPP_CLICK",
    "PHONE_CLICK",
    "DIRECTIONS_CLICK",
  ]),
});

export const analyticsTrackSchema = z.object({
  gymId: z.string().min(1),
  event: z.enum([
    "WHATSAPP_CLICK",
    "PHONE_CLICK",
    "DIRECTIONS_CLICK",
  ]),
});

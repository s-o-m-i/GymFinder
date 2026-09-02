import { z } from "zod";
import { EVENT_TYPES } from "@/lib/event-constants";
import { CITIES } from "@/lib/constants";
import type { EventType } from "@prisma/client";

const eventTypeValues = EVENT_TYPES.map((t) => t.value) as [EventType, ...EventType[]];

export const createEventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().max(5000).optional().nullable(),
    type: z.enum(eventTypeValues),
    city: z.enum(CITIES as unknown as [string, ...string[]]),
    area: z.string().max(80).optional().nullable(),
    address: z.string().max(200).optional().nullable(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
    cloudinaryId: z.string().optional().nullable(),
    price: z.coerce.number().int().min(0).optional().nullable(),
    isFeatured: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] }
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const eventsListingQuerySchema = z.object({
  time: z.enum(["upcoming", "past"]).optional().default("upcoming"),
  city: z.string().optional(),
  type: z.enum(eventTypeValues).optional(),
  featured: z.enum(["0", "1"]).optional(),
  search: z.string().max(100).optional(),
  gymId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date").optional(),
  timeOfDay: z.enum(["day", "night"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type EventsListingQuery = z.infer<typeof eventsListingQuerySchema>;

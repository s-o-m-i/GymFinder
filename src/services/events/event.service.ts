import "server-only";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { EVENTS_PAGE_SIZE } from "@/lib/event-constants";
import type { EventsListingQuery } from "@/lib/validations/event";
import type { City } from "@/lib/constants";
import type { EventTimeOfDay } from "@/lib/event-constants";
import type { EventType, Prisma } from "@prisma/client";

export const eventCardSelect = {
  id: true,
  title: true,
  slug: true,
  type: true,
  city: true,
  area: true,
  startDate: true,
  endDate: true,
  image: true,
  price: true,
  isFeatured: true,
  gym: {
    select: {
      id: true,
      name: true,
      slug: true,
      whatsappNumber: true,
    },
  },
} satisfies Prisma.EventSelect;

export type EventCardData = Prisma.EventGetPayload<{ select: typeof eventCardSelect }>;

export async function generateUniqueEventSlug(title: string, city: string): Promise<string> {
  const base = slugify(`${title}-${city}`);
  let slug = base;
  let attempt = 0;

  while (attempt < 8) {
    const existing = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    attempt += 1;
    slug = `${base}-${Date.now().toString(36).slice(-4)}${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

function buildTimeFilter(time: "upcoming" | "past", now: Date): Prisma.EventWhereInput {
  if (time === "upcoming") {
    return { startDate: { gt: now } };
  }

  return {
    OR: [
      { endDate: { lt: now } },
      { AND: [{ endDate: null }, { startDate: { lt: now } }] },
    ],
  };
}

function buildDateFilter(dateStr: string): Prisma.EventWhereInput {
  const dayStart = new Date(`${dateStr}T00:00:00+05:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999+05:00`);

  return {
    AND: [
      { startDate: { lte: dayEnd } },
      {
        OR: [
          { endDate: { gte: dayStart } },
          {
            AND: [{ endDate: null }, { startDate: { gte: dayStart, lte: dayEnd } }],
          },
        ],
      },
    ],
  };
}

async function getEventIdsForTimeOfDay(period: EventTimeOfDay): Promise<string[]> {
  const rows =
    period === "day"
      ? await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Event"
          WHERE EXTRACT(HOUR FROM "startDate" AT TIME ZONE 'Asia/Karachi') >= 6
            AND EXTRACT(HOUR FROM "startDate" AT TIME ZONE 'Asia/Karachi') < 18
        `
      : await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Event"
          WHERE EXTRACT(HOUR FROM "startDate" AT TIME ZONE 'Asia/Karachi') >= 18
             OR EXTRACT(HOUR FROM "startDate" AT TIME ZONE 'Asia/Karachi') < 6
        `;
  return rows.map((r) => r.id);
}

export function buildEventsWhere(
  filters: EventsListingQuery & { cityName?: City; gymId?: string },
  now: Date = new Date()
): Prisma.EventWhereInput {
  const conditions: Prisma.EventWhereInput[] = [
    buildTimeFilter(filters.time ?? "upcoming", now),
  ];

  if (filters.cityName) {
    conditions.push({ city: filters.cityName });
  } else if (filters.city) {
    conditions.push({ city: { equals: filters.city, mode: "insensitive" } });
  }

  if (filters.type) {
    conditions.push({ type: filters.type as EventType });
  }

  if (filters.featured === "1") {
    conditions.push({ isFeatured: true });
  }

  if (filters.gymId) {
    conditions.push({ gymId: filters.gymId });
  }

  if (filters.date) {
    conditions.push(buildDateFilter(filters.date));
  }

  const search = filters.search?.trim();
  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { area: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { gym: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  return conditions.length === 1 ? conditions[0]! : { AND: conditions };
}

function eventsOrderBy(time: "upcoming" | "past"): Prisma.EventOrderByWithRelationInput[] {
  if (time === "past") {
    return [{ startDate: "desc" }];
  }
  return [{ isFeatured: "desc" }, { startDate: "asc" }];
}

export async function getEventFilterGyms(fixedCity?: City) {
  return prisma.gym.findMany({
    where: {
      listingStatus: "approved",
      events: { some: {} },
      ...(fixedCity ? { city: fixedCity } : {}),
    },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });
}

export async function getEventsListing(
  searchParams: Record<string, string | string[] | undefined>,
  fixedCity?: City
) {
  const raw = {
    time: typeof searchParams.time === "string" ? searchParams.time : "upcoming",
    city: fixedCity ?? (typeof searchParams.city === "string" ? searchParams.city : undefined),
    type: typeof searchParams.type === "string" ? searchParams.type : undefined,
    featured: typeof searchParams.featured === "string" ? searchParams.featured : undefined,
    search: typeof searchParams.search === "string" ? searchParams.search : undefined,
    gymId: typeof searchParams.gymId === "string" ? searchParams.gymId : undefined,
    date: typeof searchParams.date === "string" ? searchParams.date : undefined,
    timeOfDay:
      searchParams.timeOfDay === "day" || searchParams.timeOfDay === "night"
        ? searchParams.timeOfDay
        : undefined,
    page: typeof searchParams.page === "string" ? searchParams.page : "1",
  };

  const time = raw.time === "past" ? "past" : "upcoming";
  const page = Math.max(1, parseInt(raw.page, 10) || 1);
  const now = new Date();

  const filters: EventsListingQuery & { cityName?: City } = {
    time,
    city: raw.city,
    type: raw.type as EventType | undefined,
    featured: raw.featured === "1" ? "1" : undefined,
    search: raw.search,
    gymId: raw.gymId,
    date: raw.date,
    timeOfDay:
      raw.timeOfDay === "day" || raw.timeOfDay === "night" ? raw.timeOfDay : undefined,
    page,
  };

  if (fixedCity) filters.cityName = fixedCity;

  let where = buildEventsWhere(filters, now);

  if (raw.timeOfDay === "day" || raw.timeOfDay === "night") {
    const ids = await getEventIdsForTimeOfDay(raw.timeOfDay);
    where = {
      AND: [where, { id: { in: ids.length > 0 ? ids : ["__no_match__"] } }],
    };
  }

  const skip = (page - 1) * EVENTS_PAGE_SIZE;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: eventCardSelect,
      orderBy: eventsOrderBy(time),
      skip,
      take: EVENTS_PAGE_SIZE,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / EVENTS_PAGE_SIZE)),
    filters: {
      time,
      city: fixedCity ?? raw.city,
      type: raw.type as EventType | undefined,
      featured: raw.featured === "1",
      search: raw.search,
      gymId: raw.gymId,
      date: raw.date,
      timeOfDay:
      raw.timeOfDay === "day" || raw.timeOfDay === "night" ? raw.timeOfDay : undefined,
    },
  };
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          slug: true,
          whatsappNumber: true,
          address: true,
          area: true,
          city: true,
          coverImage: true,
          listingStatus: true,
        },
      },
    },
  });
}

export async function getGymEvents(gymId: string, limit = 6) {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { gymId, ...buildTimeFilter("upcoming", now) },
      select: eventCardSelect,
      orderBy: [{ isFeatured: "desc" }, { startDate: "asc" }],
      take: limit,
    }),
    prisma.event.findMany({
      where: { gymId, ...buildTimeFilter("past", now) },
      select: eventCardSelect,
      orderBy: { startDate: "desc" },
      take: limit,
    }),
  ]);

  return { upcoming, past };
}

export async function getOwnerEvents(ownerId: string) {
  return prisma.event.findMany({
    where: { createdByOwnerId: ownerId },
    select: {
      ...eventCardSelect,
      createdAt: true,
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getAdminEvents() {
  return prisma.event.findMany({
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      city: true,
      area: true,
      gym: {
        select: { id: true, name: true },
      },
      createdByOwner: {
        select: { name: true },
      },
      startDate: true,
      endDate: true,
      isFeatured: true,
    },
  });
}

export async function getAdminEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      type: true,
      city: true,
      area: true,
      address: true,
      startDate: true,
      endDate: true,
      price: true,
      isFeatured: true,
      gymId: true,
      image: true,
      cloudinaryId: true,
      createdByOwner: {
        select: { name: true },
      },
    },
  });
}

export async function getEventSlugsForSitemap() {
  return prisma.event.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApprovedGymsForEventForm() {
  return prisma.gym.findMany({
    where: { listingStatus: "approved" },
    select: { id: true, name: true, city: true, area: true },
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });
}

export async function createEvent(data: {
  title: string;
  slug: string;
  description?: string | null;
  type: EventType;
  city: string;
  area?: string | null;
  address?: string | null;
  startDate: Date;
  endDate?: Date | null;
  image?: string | null;
  cloudinaryId?: string | null;
  price?: number | null;
  isFeatured?: boolean;
  gymId?: string | null;
  createdByOwnerId?: string | null;
}) {
  return prisma.event.create({ data });
}

export async function createEventByAdmin(data: {
  title: string;
  description?: string | null;
  type: EventType;
  city: string;
  area?: string | null;
  address?: string | null;
  startDate: Date;
  endDate?: Date | null;
  image?: string | null;
  cloudinaryId?: string | null;
  price?: number | null;
  isFeatured?: boolean;
  gymId?: string | null;
}) {
  const slug = await generateUniqueEventSlug(data.title, data.city);
  return prisma.event.create({
    data: {
      ...data,
      slug,
      createdByOwnerId: null,
    },
  });
}

export async function updateEventByAdmin(
  eventId: string,
  data: {
    title: string;
    description?: string | null;
    type: EventType;
    city: string;
    area?: string | null;
    address?: string | null;
    startDate: Date;
    endDate?: Date | null;
    image?: string | null;
    cloudinaryId?: string | null;
    price?: number | null;
    isFeatured?: boolean;
    gymId?: string | null;
  }
) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) return null;

  let slug = existing.slug;
  if (existing.title !== data.title || existing.city !== data.city) {
    slug = await generateUniqueEventSlug(data.title, data.city);
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
      slug,
    },
  });
}

export async function deleteEventByAdmin(id: string) {
  return prisma.event.delete({
    where: { id },
    select: {
      id: true,
      slug: true,
    },
  });
}

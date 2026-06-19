import type { PrismaClient } from "@prisma/client";

export function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function splitLinkedTags(
  linked: { id: string; name: string }[],
  predefined: { id: string; name: string }[]
): { selectedIds: string[]; customNames: string[] } {
  const predefinedIds = new Set(predefined.map((item) => item.id));
  const predefinedNames = new Set(
    predefined.map((item) => item.name.trim().toLowerCase())
  );

  const selectedIds: string[] = [];
  const customNames: string[] = [];

  for (const item of linked) {
    if (predefinedIds.has(item.id)) {
      selectedIds.push(item.id);
      continue;
    }

    const normalized = normalizeTagName(item.name);
    if (!normalized) continue;

    if (predefinedNames.has(normalized.toLowerCase())) continue;
    if (!customNames.some((n) => n.toLowerCase() === normalized.toLowerCase())) {
      customNames.push(normalized);
    }
  }

  return { selectedIds, customNames };
}

async function upsertDisciplineNames(
  prisma: PrismaClient,
  names: string[],
  existingIds: string[]
): Promise<string[]> {
  const resolved = new Set(existingIds);

  for (const rawName of names) {
    const name = normalizeTagName(rawName);
    if (!name) continue;

    const existing = await prisma.discipline.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      resolved.add(existing.id);
      continue;
    }

    const created = await prisma.discipline.create({ data: { name } });
    resolved.add(created.id);
  }

  return [...resolved];
}

async function upsertAmenityNames(
  prisma: PrismaClient,
  names: string[],
  existingIds: string[]
): Promise<string[]> {
  const resolved = new Set(existingIds);

  for (const rawName of names) {
    const name = normalizeTagName(rawName);
    if (!name) continue;

    const existing = await prisma.amenity.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      resolved.add(existing.id);
      continue;
    }

    const created = await prisma.amenity.create({ data: { name } });
    resolved.add(created.id);
  }

  return [...resolved];
}

export async function resolveDisciplineIds(
  prisma: PrismaClient,
  disciplineIds: string[],
  customDisciplines: string[] = []
): Promise<string[]> {
  return upsertDisciplineNames(prisma, customDisciplines, disciplineIds);
}

export async function resolveAmenityIds(
  prisma: PrismaClient,
  amenityIds: string[],
  customAmenities: string[] = []
): Promise<string[]> {
  return upsertAmenityNames(prisma, customAmenities, amenityIds);
}

export function dedupeCustomNames(
  names: string[],
  predefined: { name: string }[]
): string[] {
  const predefinedNames = new Set(
    predefined.map((item) => item.name.trim().toLowerCase())
  );
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of names) {
    const name = normalizeTagName(raw);
    if (!name) continue;
    const key = name.toLowerCase();
    if (predefinedNames.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

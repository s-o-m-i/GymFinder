export const STAFF_BIO_MAX_CHARS = 500;
export const STAFF_BIO_MAX_WORDS = 80;

export const STAFF_LIST_MAX_ITEMS = 10;
export const STAFF_LIST_ITEM_MAX_CHARS = 120;
export const STAFF_LIST_ITEM_MAX_WORDS = 20;

export type StaffCertificationItem = {
  id: string;
  name: string;
  imageUrl?: string | null;
  cloudinaryId?: string | null;
};

export type StaffAchievementItem = {
  id: string;
  name: string;
};

export function countStaffBioWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countListItemWords(text: string): number {
  return countStaffBioWords(text);
}

export function isStaffBioWithinLimits(text: string): boolean {
  return text.length <= STAFF_BIO_MAX_CHARS && countStaffBioWords(text) <= STAFF_BIO_MAX_WORDS;
}

export function isListItemWithinLimits(text: string): boolean {
  return (
    text.length <= STAFF_LIST_ITEM_MAX_CHARS &&
    countListItemWords(text) <= STAFF_LIST_ITEM_MAX_WORDS
  );
}

function isCertificationItem(value: unknown): value is StaffCertificationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as StaffCertificationItem;
  return typeof item.id === "string" && typeof item.name === "string" && item.name.trim().length > 0;
}

function isAchievementItem(value: unknown): value is StaffAchievementItem {
  if (!value || typeof value !== "object") return false;
  const item = value as StaffAchievementItem;
  return typeof item.id === "string" && typeof item.name === "string" && item.name.trim().length > 0;
}

function legacyLinesToItems(raw: string): { id: string; name: string }[] {
  return raw
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ id: crypto.randomUUID(), name }));
}

export function parseCertifications(raw: string | null | undefined): StaffCertificationItem[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(isCertificationItem).map((item) => ({
        id: item.id,
        name: item.name.trim(),
        imageUrl: item.imageUrl ?? null,
        cloudinaryId: item.cloudinaryId ?? null,
      }));
    }
  } catch {
    // fall through to legacy plain text
  }

  return legacyLinesToItems(raw);
}

export function parseAchievements(raw: string | null | undefined): StaffAchievementItem[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(isAchievementItem).map((item) => ({
        id: item.id,
        name: item.name.trim(),
      }));
    }
  } catch {
    // fall through to legacy plain text
  }

  return legacyLinesToItems(raw);
}

export function serializeCertifications(items: StaffCertificationItem[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(items);
}

export function serializeAchievements(items: StaffAchievementItem[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(items);
}

export function collectCertificationCloudinaryIds(raw: string | null | undefined): string[] {
  return parseCertifications(raw)
    .map((item) => item.cloudinaryId)
    .filter((id): id is string => Boolean(id));
}

export function diffRemovedCloudinaryIds(
  previousRaw: string | null | undefined,
  nextRaw: string | null | undefined
): string[] {
  const previous = new Set(collectCertificationCloudinaryIds(previousRaw));
  const next = new Set(collectCertificationCloudinaryIds(nextRaw));
  return [...previous].filter((id) => !next.has(id));
}

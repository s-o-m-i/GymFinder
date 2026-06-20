export const GYM_EQUIPMENT_MAX_ITEMS = 30;
export const GYM_EQUIPMENT_ITEM_MAX_CHARS = 100;
export const GYM_EQUIPMENT_ITEM_MAX_WORDS = 15;

export type GymEquipmentItem = {
  id: string;
  name: string;
};

export function countEquipmentWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isEquipmentItemWithinLimits(text: string): boolean {
  return (
    text.length <= GYM_EQUIPMENT_ITEM_MAX_CHARS &&
    countEquipmentWords(text) <= GYM_EQUIPMENT_ITEM_MAX_WORDS
  );
}

function isEquipmentItem(value: unknown): value is GymEquipmentItem {
  if (!value || typeof value !== "object") return false;
  const item = value as GymEquipmentItem;
  return typeof item.id === "string" && typeof item.name === "string" && item.name.trim().length > 0;
}

function legacyLinesToItems(raw: string): GymEquipmentItem[] {
  return raw
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ id: crypto.randomUUID(), name }));
}

export function parseGymEquipment(raw: string | null | undefined): GymEquipmentItem[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(isEquipmentItem).map((item) => ({
        id: item.id,
        name: item.name.trim(),
      }));
    }
  } catch {
    // fall through to legacy plain text
  }

  return legacyLinesToItems(raw);
}

export function serializeGymEquipment(items: GymEquipmentItem[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(items);
}

import type { ProgressImage } from "@/lib/success-stories/types";

export function parseProgressImages(raw: string | null | undefined): ProgressImage[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ProgressImage =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ProgressImage).id === "string" &&
        typeof (item as ProgressImage).imageUrl === "string"
    );
  } catch {
    return [];
  }
}

export function serializeProgressImages(images: ProgressImage[]): string {
  return JSON.stringify(images);
}

export function calculateWeightLost(
  startWeight?: number | null,
  currentWeight?: number | null
): number | null {
  if (startWeight == null || currentWeight == null) return null;
  const lost = startWeight - currentWeight;
  return lost > 0 ? Math.round(lost * 10) / 10 : null;
}

export function stripStoryHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function plainStoryLength(html: string): number {
  return stripStoryHtml(html).length;
}

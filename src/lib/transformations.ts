export const TRANSFORMATION_MAX_ITEMS = 20;
export const TRANSFORMATION_STORY_MAX_CHARS = 2000;
export const TRANSFORMATION_STORY_MAX_WORDS = 300;
export const TRANSFORMATION_CLIENT_NAME_MAX_CHARS = 80;

export type TransformationItem = {
  id: string;
  clientName?: string | null;
  story: string;
  beforeImageUrl: string;
  beforeCloudinaryId?: string | null;
  afterImageUrl: string;
  afterCloudinaryId?: string | null;
};

export function countTransformationWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isTransformationStoryWithinLimits(text: string): boolean {
  return (
    text.length <= TRANSFORMATION_STORY_MAX_CHARS &&
    countTransformationWords(text) <= TRANSFORMATION_STORY_MAX_WORDS
  );
}

function isTransformationItem(value: unknown): value is TransformationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as TransformationItem;
  return (
    typeof item.id === "string" &&
    typeof item.story === "string" &&
    item.story.trim().length > 0 &&
    typeof item.beforeImageUrl === "string" &&
    item.beforeImageUrl.trim().length > 0 &&
    typeof item.afterImageUrl === "string" &&
    item.afterImageUrl.trim().length > 0
  );
}

export function parseTransformations(raw: string | null | undefined): TransformationItem[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(isTransformationItem).map((item) => ({
        id: item.id,
        clientName: item.clientName?.trim() || null,
        story: item.story.trim(),
        beforeImageUrl: item.beforeImageUrl.trim(),
        beforeCloudinaryId: item.beforeCloudinaryId?.trim() || null,
        afterImageUrl: item.afterImageUrl.trim(),
        afterCloudinaryId: item.afterCloudinaryId?.trim() || null,
      }));
    }
  } catch {
    // ignore invalid JSON
  }

  return [];
}

export function serializeTransformations(items: TransformationItem[]): string | null {
  if (items.length === 0) return null;
  return JSON.stringify(
    items.map((item) => ({
      id: item.id,
      clientName: item.clientName?.trim() || null,
      story: item.story.trim(),
      beforeImageUrl: item.beforeImageUrl.trim(),
      beforeCloudinaryId: item.beforeCloudinaryId?.trim() || null,
      afterImageUrl: item.afterImageUrl.trim(),
      afterCloudinaryId: item.afterCloudinaryId?.trim() || null,
    }))
  );
}

export function collectTransformationCloudinaryIds(raw: string | null | undefined): string[] {
  return parseTransformations(raw).flatMap((item) =>
    [item.beforeCloudinaryId, item.afterCloudinaryId].filter(
      (id): id is string => Boolean(id?.trim())
    )
  );
}

export function diffRemovedTransformationCloudinaryIds(
  previousRaw: string | null | undefined,
  nextRaw: string | null | undefined
): string[] {
  const previous = new Set(collectTransformationCloudinaryIds(previousRaw));
  const next = new Set(collectTransformationCloudinaryIds(nextRaw));
  return [...previous].filter((id) => !next.has(id));
}

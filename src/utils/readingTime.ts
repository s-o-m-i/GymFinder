const WORDS_PER_MINUTE = 200;

export function countWords(text: string): number {
  const stripped = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
}

export function estimateReadingTime(content: string): number {
  const words = countWords(content);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

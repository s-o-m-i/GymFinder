/** Decode HTML entities from WordPress rendered fields (titles, excerpts, etc.). */
export function decodeHtmlEntities(text: string): string {
  let result = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014");

  result = result.replace(/&#(\d+);/g, (_, code: string) => {
    const num = Number.parseInt(code, 10);
    return Number.isFinite(num) ? String.fromCodePoint(num) : `&#${code};`;
  });

  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
    const num = Number.parseInt(hex, 16);
    return Number.isFinite(num) ? String.fromCodePoint(num) : `&#x${hex};`;
  });

  return result;
}

/** Strip HTML tags, decode entities, and normalize whitespace. */
export function stripAndDecodeHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

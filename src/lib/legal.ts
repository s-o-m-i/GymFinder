import { SITE_NAME } from "@/lib/constants";

export const LEGAL_EMAIL =
  process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "legal@fitnessadda.pk";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@fitnessadda.pk";

/** Display date for “Last updated” on legal documents */
export const LEGAL_LAST_UPDATED = "25 June 2026";

export const LEGAL_JURISDICTION = "Islamic Republic of Pakistan";

export const LEGAL_PAGES = [
  { href: "/legal/terms", label: "Terms of Service", slug: "terms" },
  { href: "/legal/privacy", label: "Privacy Policy", slug: "privacy" },
  { href: "/legal/cookies", label: "Cookie Policy", slug: "cookies" },
  { href: "/legal/disclaimer", label: "Disclaimer", slug: "disclaimer" },
  { href: "/legal/acceptable-use", label: "Acceptable Use Policy", slug: "acceptable-use" },
] as const;

export type LegalPageSlug = (typeof LEGAL_PAGES)[number]["slug"];

export function legalPageTitle(slug: LegalPageSlug): string {
  return LEGAL_PAGES.find((p) => p.slug === slug)?.label ?? "Legal";
}

export const LEGAL_INTRO = `${SITE_NAME} (“we”, “us”, “our”) operates an online directory and marketplace that helps people in Pakistan discover gyms, fighting clubs, personal trainers, and fitness events. These policies explain your rights and responsibilities when using our website and related services.`;

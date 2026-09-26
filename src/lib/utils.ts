import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { WHATSAPP_DEFAULT_MESSAGE } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export function formatPrice(min: number, max: number): string {
  if (min === max) return `PKR ${min.toLocaleString()}`;
  return `PKR ${min.toLocaleString()} – ${max.toLocaleString()}`;
}

export function formatPriceShort(min: number, max: number): string {
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`);
  return `${fmt(min)}–${fmt(max)}/mo`;
}

export function buildWhatsAppUrl(
  number: string,
  gymName?: string,
  customMessage?: string
): string {
  const cleaned = number.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("92")
    ? cleaned
    : cleaned.startsWith("0")
    ? `92${cleaned.slice(1)}`
    : `92${cleaned}`;
  const message =
    customMessage ??
    (gymName
      ? `Hi, I found ${gymName} on FitnessAdda PK. I want more details about membership.`
      : WHATSAPP_DEFAULT_MESSAGE);
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function buildGoogleMapsUrl(address: string, lat?: number | null, lng?: number | null): string {
  if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function gymTypeLabel(type: string, customTypeLabel?: string | null): string {
  if (customTypeLabel?.trim()) return customTypeLabel.trim();
  const map: Record<string, string> = {
    gym:          "Gym",
    boxing:       "Boxing",
    mma:          "MMA",
    muay_thai:    "Muay Thai",
    kickboxing:   "Kickboxing",
    martial_arts: "Martial Arts",
  };
  return map[type] ?? type;
}

export function ladiesStatusLabel(status: string): string {
  const map: Record<string, string> = {
    mixed:           "Mixed",
    ladies_only:     "Ladies Only",
    ladies_timings:  "Ladies-Only Hours",
    men_only:        "Men Only",
  };
  return map[status] ?? status;
}

export function sizeCategoryLabel(size: string): string {
  const map: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  return map[size] ?? size;
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export function formatRegistrationDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

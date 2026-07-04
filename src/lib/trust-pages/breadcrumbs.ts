import { getAppBaseUrl } from "@/lib/resend";

export type TrustBreadcrumbItem = {
  label: string;
  href?: string;
};

export function buildBreadcrumbSchema(items: TrustBreadcrumbItem[]) {
  const baseUrl = getAppBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };
}

export const ABOUT_BREADCRUMBS: TrustBreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us" },
];

export const CONTACT_BREADCRUMBS: TrustBreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Contact Us" },
];

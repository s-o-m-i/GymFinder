import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  buildBreadcrumbSchema,
  type TrustBreadcrumbItem,
} from "@/lib/trust-pages/breadcrumbs";

interface PageBreadcrumbsProps {
  items: TrustBreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(items)} />
      <Breadcrumbs items={items} className={className} />
    </>
  );
}

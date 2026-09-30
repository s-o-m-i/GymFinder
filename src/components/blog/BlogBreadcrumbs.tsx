import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildBlogBreadcrumbSchema, type BlogBreadcrumbItem } from "@/lib/blogs-routes";

interface BlogBreadcrumbsProps {
  items: BlogBreadcrumbItem[];
  className?: string;
}

export function BlogBreadcrumbs({ items, className }: BlogBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={buildBlogBreadcrumbSchema(items)} />
      <Breadcrumbs items={items} className={className} />
    </>
  );
}

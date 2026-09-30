import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { GymFilters } from "@/components/gym/GymFilters";
import { GymsResultsSection } from "@/components/gym/GymsResultsSection";
import { getGymsListing } from "@/lib/getGymsListing";
import { gymTypeLabel } from "@/lib/utils";
import type { City } from "@/lib/constants";
import { TYPE_SEO, getGymCitySeo, getGymsBasePath } from "@/lib/gyms-routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";

interface GymsListingPageProps {
  searchParams: Record<string, string | string[] | undefined>;
  city?: City;
  fixedType?: string;
  fixedTypes?: readonly string[];
  listingLabel?: string;
  pagePath?: string;
  seoDescription?: string;
}

function sortLabel(sort?: string) {
  const map: Record<string, string> = {
    featured:   "Featured",
    price_asc:  "Price: Low → High",
    price_desc: "Price: High → Low",
    rating:     "Top Rated",
  };
  return map[sort ?? "featured"] ?? "Featured";
}

export async function GymsListingPage({
  searchParams,
  city,
  fixedType,
  fixedTypes,
  listingLabel,
  pagePath: pagePathOverride,
  seoDescription,
}: GymsListingPageProps) {
  const { gyms, total, page, totalPages, filters } = await getGymsListing(
    searchParams,
    city,
    fixedType,
    fixedTypes
  );
  const amenities = await prisma.amenity.findMany({
    where: {
      gyms: { some: { gym: { listingStatus: "approved" } } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const type = filters.type;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pagePath = pagePathOverride ?? getGymsBasePath({ city, type: fixedType });
  const canonical = `${baseUrl}${pagePath}`;

  const h1 = listingLabel
    ? city
      ? `${listingLabel} in ${city}`
      : `${listingLabel} in Pakistan`
    : city
    ? `Gyms & Fighting Clubs in ${city}`
    : type
    ? `${gymTypeLabel(type)} Gyms & Clubs`
    : "All Gyms & Fighting Clubs in Pakistan";

  const seoIntro = seoDescription
    ? { description: seoDescription }
    : city
    ? getGymCitySeo(city)
    : type
    ? TYPE_SEO[type]
    : null;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    name:       h1,
    url:        canonical,
    numberOfItems: total,
    itemListElement: gyms.map((gym, i) => ({
      "@type":    "ListItem",
      position:   (page - 1) * 12 + i + 1,
      url:        gym.listingSlug
        ? `${baseUrl}/gyms/${gym.listingSlug}/main`
        : gym.branchSlug
        ? `${baseUrl}/gyms/${gym.slug}/${gym.branchSlug}`
        : `${baseUrl}/gyms/${gym.slug}`,
      name:       gym.branchName ?? gym.name,
    })),
  };

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
    { "@type": "ListItem", position: 2, name: "Gyms", item: `${baseUrl}/gyms` },
  ];
  if (listingLabel && !city) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: listingLabel,
      item: `${baseUrl}${pagePath}`,
    });
  } else if (type && !city) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: gymTypeLabel(type),
      item: `${baseUrl}${getGymsBasePath({ type })}`,
    });
  }
  if (city) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: city,
      item: `${baseUrl}${getGymsBasePath({ city })}`,
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] max-lg:overflow-x-hidden">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Breadcrumbs
              className="mb-3"
              items={[
                { label: "Home", href: "/" },
                { label: "Gyms", href: "/gyms" },
                ...(listingLabel && !city
                  ? [{ label: listingLabel }]
                  : type && !city && !listingLabel
                    ? [{ label: gymTypeLabel(type) }]
                    : []),
                ...(city ? [{ label: city }] : []),
              ]}
            />

            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--text)] break-words">
              {type && city && !listingLabel
                ? `${gymTypeLabel(type)} in ${city}`
                : h1}
            </h1>

            <p className="text-[var(--text-muted)] text-sm mt-1 break-words">
              <span className="font-mono-nums font-semibold text-[var(--text)]">{total}</span>{" "}
              {total === 1 ? "gym" : "gyms"} found · Sorted by {sortLabel(filters.sort)}
            </p>

            {seoIntro && (
              <p className="text-sm text-[var(--text-muted)] mt-3 max-w-3xl leading-relaxed">
                {seoIntro.description}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start w-full min-w-0">
            <Suspense
              fallback={
                <div className="hidden lg:block w-72 h-48 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse shrink-0" />
              }
            >
              <GymFilters fixedCity={city} fixedType={fixedType} amenities={amenities} />
            </Suspense>

            <div className="flex-1 min-w-0 w-full">
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 w-full min-w-0">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse"
                      >
                        <div className="h-48 bg-[var(--bg)]" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-[var(--bg)] rounded-lg w-3/4" />
                          <div className="h-3 bg-[var(--bg)] rounded-lg w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <GymsResultsSection
                  key={`${filters.search ?? ""}-${filters.area ?? ""}-${filters.type ?? ""}-${filters.amenity ?? ""}-${filters.rating ?? ""}-${filters.ladiesStatus ?? ""}-${filters.sort ?? "featured"}-${page}`}
                  initialGyms={gyms}
                  total={total}
                  page={page}
                  totalPages={totalPages}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

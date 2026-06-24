import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrainerFilters } from "@/components/trainers/TrainerFilters";
import { TrainersResultsSection } from "@/components/trainers/TrainersResultsSection";
import { getTrainersListing } from "@/services/trainer/trainer.service";
import { TRAINER_CITY_SEO, getTrainersBasePath } from "@/lib/trainers-routes";
import type { City } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { specializationLabel } from "@/lib/trainer-constants";

interface TrainersListingPageProps {
  searchParams: Record<string, string | string[] | undefined>;
  city?: City;
}

export async function TrainersListingPage({ searchParams, city }: TrainersListingPageProps) {
  const { trainers, total, page, totalPages, filters } = await getTrainersListing(
    searchParams,
    city
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pagePath = getTrainersBasePath({ city });
  const canonical = `${baseUrl}${pagePath}`;
  const h1 = city ? `Personal Trainers in ${city}` : "Find Trainers & Coaches";
  const seoIntro = city ? TRAINER_CITY_SEO[city] : null;
  const specLabel = filters.specialization
    ? specializationLabel(filters.specialization)
    : null;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: h1,
    url: canonical,
    numberOfItems: total,
    itemListElement: trainers.map((trainer, i) => ({
      "@type": "ListItem",
      position: (page - 1) * 12 + i + 1,
      url: `${baseUrl}/trainer/${trainer.slug}`,
      name: trainer.fullName,
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
              <Link href="/" className="hover:text-[var(--text)] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/trainers" className="hover:text-[var(--text)] transition-colors">
                Trainers
              </Link>
              {city && (
                <>
                  <span>/</span>
                  <span className="text-[var(--text)]">{city}</span>
                </>
              )}
            </nav>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">{h1}</h1>
            <p className="text-[var(--text-muted)] text-sm mt-2 max-w-2xl">
              {seoIntro?.description ??
                (specLabel
                  ? `Browse ${specLabel.toLowerCase()} coaches across the platform. Contact directly — no booking fees.`
                  : "Discover certified personal trainers, boxing coaches, and fitness experts. Filter by city, specialization, and experience.")}
            </p>
            <div className="mt-4">
              <Link
                href="/trainer/register"
                className="inline-flex items-center px-4 py-2 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528]"
              >
                Join as a Trainer
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <Suspense fallback={<div className="hidden lg:block w-72 h-48 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse shrink-0" />}>
              <TrainerFilters basePath={pagePath} fixedCity={city} />
            </Suspense>
            <div className="flex-1 min-w-0 w-full">
              <TrainersResultsSection
                trainers={trainers}
                total={total}
                page={page}
                totalPages={totalPages}
                basePath={pagePath}
                searchParams={searchParams}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

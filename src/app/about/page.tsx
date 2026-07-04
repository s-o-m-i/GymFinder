import type { Metadata } from "next";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageBreadcrumbs } from "@/components/trust/PageBreadcrumbs";
import { AboutPageSections } from "@/components/trust/about/AboutPageSections";
import { ABOUT_BREADCRUMBS } from "@/lib/trust-pages/breadcrumbs";
import { getPlatformStats } from "@/lib/trust-pages/platform-stats";
import { buildAboutPageSchema } from "@/lib/trust-pages/schema";

export const metadata: Metadata = {
  title: "About FitnessAdda PK | Pakistan's Fitness Marketplace",
  description:
    "Learn about FitnessAdda PK, Pakistan's largest fitness discovery platform connecting people with gyms, trainers, fighting clubs, and fitness events across the country.",
  openGraph: {
    title: "About FitnessAdda PK | Pakistan's Fitness Marketplace",
    description:
      "Learn about FitnessAdda PK, Pakistan's largest fitness discovery platform connecting people with gyms, trainers, fighting clubs, and fitness events across the country.",
  },
};

export default async function AboutPage() {
  const stats = await getPlatformStats();

  return (
    <>
      <JsonLd data={buildAboutPageSchema()} />
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <PageBreadcrumbs items={ABOUT_BREADCRUMBS} />
          </div>
        </div>
        <AboutPageSections stats={stats} />
      </main>
      <Footer />
    </>
  );
}

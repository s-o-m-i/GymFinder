import type { Metadata } from "next";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageBreadcrumbs } from "@/components/trust/PageBreadcrumbs";
import { ContactPageSections } from "@/components/trust/contact/ContactPageSections";
import { CONTACT_BREADCRUMBS } from "@/lib/trust-pages/breadcrumbs";
import { buildContactPageSchema } from "@/lib/trust-pages/schema";

export const metadata: Metadata = {
  title: "Contact FitnessAdda PK",
  description:
    "Get in touch with FitnessAdda PK for support, partnerships, business inquiries, or feedback.",
  openGraph: {
    title: "Contact FitnessAdda PK",
    description:
      "Get in touch with FitnessAdda PK for support, partnerships, business inquiries, or feedback.",
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={buildContactPageSchema()} />
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <PageBreadcrumbs items={CONTACT_BREADCRUMBS} />
          </div>
        </div>
        <ContactPageSections />
      </main>
      <Footer />
    </>
  );
}

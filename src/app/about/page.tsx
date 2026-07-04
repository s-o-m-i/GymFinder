import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `About | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-[var(--text)]">About FitnessAdda</h1>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">{SITE_DESCRIPTION}</p>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            We connect Pakistan&apos;s fitness community — gyms, fighting clubs, trainers, and
            everyday members — through real stories, events, and trusted local listings.
          </p>
          <Link href="/contact" className="mt-8 inline-flex font-semibold text-[#FF6A3D] hover:underline">
            Contact us →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

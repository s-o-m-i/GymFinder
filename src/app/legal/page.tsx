import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Cookie, AlertTriangle, Scale } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LEGAL_INTRO, LEGAL_LAST_UPDATED, LEGAL_PAGES } from "@/lib/legal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Legal",
  description: `Terms, privacy, cookies, and other legal policies for ${SITE_NAME}.`,
  robots: { index: true, follow: true },
};

const ICONS = {
  terms: Scale,
  privacy: Shield,
  cookies: Cookie,
  disclaimer: AlertTriangle,
  "acceptable-use": FileText,
} as const;

export default function LegalIndexPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Legal &amp; Policies
            </p>
            <h1 className="font-heading mt-3 text-3xl font-bold text-[var(--text)] sm:text-4xl">
              Legal Information
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {LEGAL_INTRO}
            </p>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {LEGAL_PAGES.map((page) => {
              const Icon = ICONS[page.slug];
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[#FF6A3D]/35 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A3D]/10 text-[#FF6A3D] transition-colors group-hover:bg-[#FF6A3D] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="font-heading block font-bold text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors">
                      {page.label}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--text-muted)]">
                      Read document →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LEGAL_LAST_UPDATED, LEGAL_PAGES } from "@/lib/legal";
import { cn } from "@/lib/utils";

interface LegalPageLayoutProps {
  title: string;
  description?: string;
  currentSlug?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  description,
  currentSlug,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <Link
              href="/legal"
              className="text-sm font-medium text-[#FF6A3D] hover:underline"
            >
              ← All legal documents
            </Link>
            <h1 className="font-heading mt-4 text-3xl font-bold text-[var(--text)] sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                {description}
              </p>
            )}
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
            <aside className="lg:w-56 shrink-0">
              <nav
                className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
                aria-label="Legal documents"
              >
                <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Documents
                </p>
                <ul className="space-y-1">
                  {LEGAL_PAGES.map((page) => (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          currentSlug === page.slug
                            ? "bg-[#FF6A3D]/10 text-[#FF6A3D]"
                            : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                        )}
                      >
                        {page.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <article className="legal-prose min-w-0 flex-1 max-w-3xl">{children}</article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

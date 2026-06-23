import Link from "next/link";
import { HOME_SEO_LINKS } from "@/lib/home-data";

export function SeoFooterLinksSection() {
  return (
    <section className="bg-[var(--bg)] py-14 sm:py-16" aria-labelledby="seo-links-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 card-shadow">
          <h2
            id="seo-links-heading"
            className="font-heading mb-2 text-xl font-bold text-[var(--text)] sm:text-2xl"
          >
            Popular Searches in Pakistan
          </h2>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Explore gyms, MMA clubs, boxing gyms, and fitness trainers across Pakistan.
          </p>

          <nav aria-label="Popular fitness searches">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {HOME_SEO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[#FF6A3D]/8 hover:text-[#FF6A3D]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/layout/SiteLogo";

function isNavActive(pathname: string, href: string, searchParams: URLSearchParams) {
  const [path, queryString] = href.split("?");

  if (pathname !== path) return false;

  // Path-only links
  if (!queryString) {
    if (href === "/gyms") return !searchParams.get("type") && !searchParams.get("city");
    if (href === "/events") return pathname === "/events" || pathname.startsWith("/events/");
    if (href === "/blogs") return pathname === "/blogs" || pathname.startsWith("/blogs/");
    return true;
  }

  const hrefParams = new URLSearchParams(queryString);
  for (const [key, value] of hrefParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

const navLinks = [
  { href: "/gyms", label: "Find Gyms" },
  { href: "/gyms/fighting-clubs", label: "Fighting Clubs" },
  { href: "/trainers", label: "Trainers" },
  { href: "/events", label: "Events" },
  { href: "/blogs", label: "Blog" },
];

export function Navbar({ variant }: { variant?: "default" | "hero" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHero = variant === "hero" || pathname === "/";
  const heroMenuOpen = isHero && mobileOpen;

  return (
    <>
    <header
      className={cn(
        "z-50",
        isHero
          ? cn(
              "absolute top-0 left-0 right-0 border-b",
              heroMenuOpen
                ? "border-white/15 bg-[#0B2545]/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                : "border-white/10 bg-transparent"
            )
          : "sticky top-0 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo */}
          <SiteLogo size="xl" priority darkBackground={!isHero} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isHero
                    ? isNavActive(pathname, link.href, searchParams)
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    : isNavActive(pathname, link.href, searchParams)
                      ? "text-[#FF6A3D] bg-orange-50"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/owner/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              List your gym
            </Link>
            <Link
              href="/trainer/register"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors",
                isHero
                  ? "border border-white/30 text-white hover:bg-white/10"
                  : "border border-[#0B2545] text-[#0B2545] hover:bg-[#0B2545] hover:text-white"
              )}
            >
              Join as Trainer
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                isHero
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg)]"
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu — hero: fixed glass panel; default: inline dropdown */}
        {mobileOpen && isHero && (
          <div
            className="fixed inset-0 top-18 sm:top-20 z-40 md:hidden bg-[#050d18]/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {mobileOpen && (
          <div
            className={cn(
              "md:hidden pb-4 pt-3",
              isHero
                ? "fixed left-0 right-0 top-18 sm:top-20 z-50 border-b border-white/10 bg-[#0B2545]/80 px-4 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:px-6"
                : cn("border-t mt-0", "border-[var(--border)]")
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-1",
                isHero && "rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md"
              )}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isHero
                      ? isNavActive(pathname, link.href, searchParams)
                        ? "text-white bg-white/10"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                      : isNavActive(pathname, link.href, searchParams)
                        ? "text-[#FF6A3D] bg-orange-50"
                        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/owner/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  List your gym
                </Link>
                <Link
                  href="/trainer/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors",
                    isHero
                      ? "border border-white/30 text-white hover:bg-white/10"
                      : "border border-[#0B2545] text-[#0B2545] hover:bg-[#0B2545] hover:text-white"
                  )}
                >
                  Join as Trainer
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
    </>
  );
}

function NavbarFallback({ variant }: { variant?: "default" | "hero" }) {
  const isHero = variant === "hero";

  return (
    <header
      className={cn(
        "z-50",
        isHero
          ? "absolute top-0 left-0 right-0 border-b border-white/10 bg-transparent"
          : "sticky top-0 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md"
      )}
      aria-hidden
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 sm:h-20" />
      </nav>
    </header>
  );
}

/** Use on statically prerendered pages — Navbar reads search params for active links. */
export function NavbarWithSuspense(props: { variant?: "default" | "hero" }) {
  return (
    <Suspense fallback={<NavbarFallback variant={props.variant} />}>
      <Navbar {...props} />
    </Suspense>
  );
}

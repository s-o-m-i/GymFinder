"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X, Dumbbell, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

function isNavActive(pathname: string, href: string, searchParams: URLSearchParams) {
  const [path, queryString] = href.split("?");

  if (pathname !== path) return false;

  // Path-only links
  if (!queryString) {
    if (href === "/gyms") return !searchParams.get("type") && !searchParams.get("city");
    if (href === "/events") return pathname === "/events" || pathname.startsWith("/events/");
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
];

export function Navbar({ variant }: { variant?: "default" | "hero" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHero = variant === "hero" || pathname === "/";

  return (
    <header
      className={cn(
        "z-50",
        isHero
          ? "absolute top-0 left-0 right-0 border-b border-white/10 bg-transparent"
          : "sticky top-0 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 font-heading font-bold text-xl",
              isHero ? "text-white" : "text-[var(--navy)]"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isHero ? "bg-[#FF6A3D]" : "bg-[#0B2545]"
              )}
            >
              <Dumbbell className={cn("w-4 h-4", isHero ? "text-white" : "text-[#FF6A3D]")} />
            </div>
            <span className="hidden sm:block">{SITE_NAME}</span>
          </Link>

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
              href="/trainer/auth"
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

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className={cn(
              "md:hidden pb-4 border-t mt-0 pt-3",
              isHero ? "border-white/10" : "border-[var(--border)]"
            )}
          >
            <div className="flex flex-col gap-1">
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
              <Link
                href="/owner/register"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                List your gym
              </Link>
              <Link
                href="/trainer/auth"
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
        )}
      </nav>
    </header>
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
        <div className="h-16" />
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

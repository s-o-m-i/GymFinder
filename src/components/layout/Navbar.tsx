"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Menu, X, Dumbbell, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

function isNavActive(pathname: string, href: string, searchParams: URLSearchParams) {
  const [path, queryString] = href.split("?");

  if (pathname !== path) return false;

  // Path-only links
  if (!queryString) {
    if (href === "/gyms") return !searchParams.get("type") && !searchParams.get("city");
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
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-[var(--navy)]">
            <div className="w-8 h-8 bg-[#0B2545] rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[#FF6A3D]" />
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
                  isNavActive(pathname, link.href, searchParams)
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0B2545] text-[#0B2545] text-sm font-semibold rounded-xl hover:bg-[#0B2545] hover:text-white transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              List Your Gym
            </Link>
            <Link
              href="/trainer/auth"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
            >
              Join as Trainer
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[var(--border)] mt-0 pt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isNavActive(pathname, link.href, searchParams)
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
                className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#0B2545] text-[#0B2545] text-sm font-semibold rounded-xl hover:bg-[#0B2545] hover:text-white transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                List Your Gym
              </Link>
              <Link
                href="/trainer/auth"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors text-center"
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

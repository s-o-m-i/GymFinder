"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/gyms", label: "Browse Gyms" },
  { href: "/gyms?type=boxing", label: "Boxing" },
  { href: "/gyms?type=mma", label: "MMA" },
  { href: "/gyms?city=Islamabad", label: "Islamabad" },
  { href: "/gyms?city=Rawalpindi", label: "Rawalpindi" },
];

export function Navbar() {
  const pathname = usePathname();
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
                  pathname === link.href
                    ? "text-[#FF6A3D] bg-orange-50"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/gyms"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
            >
              Find a Gym
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
                    pathname === link.href
                      ? "text-[#FF6A3D] bg-orange-50"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/gyms"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors text-center"
              >
                Find a Gym
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

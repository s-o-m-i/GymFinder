"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { NavbarDropdown, NavbarMobileSection } from "@/components/layout/NavbarDropdown";
import { ShareStoryNavButton } from "@/components/layout/ShareStoryNavButton";
import { SignInNavButton } from "@/components/layout/SignInNavButton";
import {
  AUTH_PATHS,
  DISCOVER_LINKS,
  FOR_BUSINESS_LINKS,
  RESOURCES_LINKS,
  TOP_LEVEL_NAV,
} from "@/lib/nav-config";

function isPathActive(pathname: string, href: string) {
  if (href === "/gyms") {
    return (
      pathname === "/gyms" ||
      (pathname.startsWith("/gyms/") &&
        !pathname.startsWith("/gyms/fighting-clubs") &&
        href === "/gyms")
    );
  }
  if (href === "/gyms/fighting-clubs") return pathname.startsWith("/gyms/fighting-clubs");
  if (href === "/trainers") return pathname === "/trainers" || pathname.startsWith("/trainers/");
  if (href === "/blogs") return pathname === "/blogs" || pathname.startsWith("/blogs/");
  if (href.startsWith("/blogs/category/")) return pathname.startsWith(href);
  if (href.startsWith("/resources")) return pathname.startsWith("/resources");
  if (href === "/about") return pathname === "/about";
  if (href === "/contact") return pathname === "/contact";
  if (href === TOP_LEVEL_NAV.successStories.href) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === TOP_LEVEL_NAV.events.href) {
    return pathname === href || pathname.startsWith("/events/") || pathname.startsWith("/event/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isDiscoverActive(pathname: string) {
  return DISCOVER_LINKS.some((item) => isPathActive(pathname, item.href));
}

function isResourcesActive(pathname: string) {
  return RESOURCES_LINKS.some((item) => isPathActive(pathname, item.href));
}

function navLinkClass(isHero: boolean, active: boolean) {
  return cn(
    "whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3",
    isHero
      ? active
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white"
      : active
        ? "bg-orange-50 text-[#FF6A3D]"
        : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
  );
}

export function Navbar({ variant }: { variant?: "default" | "hero" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHero = variant === "hero" || pathname === "/";
  const heroMenuOpen = isHero && mobileOpen;

  void searchParams;

  function closeMobile() {
    setMobileOpen(false);
  }

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
        <nav className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex h-18 items-center gap-3 sm:h-20 lg:gap-4">
            <SiteLogo
              size="lg"
              priority
              darkBackground={!isHero}
              className="shrink-0"
            />

            {/* Desktop — xl+ so nav links and CTAs never collide */}
            <div className="hidden min-w-0 flex-1 items-center xl:flex">
              <div className="flex min-w-0 flex-1 items-center gap-0.5 pr-6 2xl:gap-1">
                <NavbarDropdown
                  label="Discover"
                  items={DISCOVER_LINKS}
                  isHero={isHero}
                  isActive={isDiscoverActive(pathname)}
                />
                <Link
                  href={TOP_LEVEL_NAV.successStories.href}
                  className={navLinkClass(
                    isHero,
                    isPathActive(pathname, TOP_LEVEL_NAV.successStories.href)
                  )}
                >
                  {TOP_LEVEL_NAV.successStories.label}
                </Link>
                <Link
                  href={TOP_LEVEL_NAV.events.href}
                  className={navLinkClass(isHero, isPathActive(pathname, TOP_LEVEL_NAV.events.href))}
                >
                  {TOP_LEVEL_NAV.events.label}
                </Link>
                <NavbarDropdown
                  label="Resources"
                  items={RESOURCES_LINKS}
                  isHero={isHero}
                  isActive={isResourcesActive(pathname)}
                />
              </div>

              <div
                className={cn(
                  "flex shrink-0 items-center gap-2 border-l pl-5 2xl:gap-2.5 2xl:pl-6",
                  isHero ? "border-white/15" : "border-[var(--border)]"
                )}
              >
                <ShareStoryNavButton isHero={isHero} />
                <NavbarDropdown
                  label="For Businesses"
                  items={FOR_BUSINESS_LINKS}
                  isHero={isHero}
                  align="right"
                  variant="cta"
                />
                <SignInNavButton isHero={isHero} />
              </div>
            </div>

            {/* Mobile / tablet */}
            <div className="ml-auto flex items-center gap-2 xl:hidden">
              <ShareStoryNavButton isHero={isHero} className="hidden sm:inline-flex" />
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  isHero
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg)]"
                )}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && isHero && (
            <div
              className="fixed inset-0 top-18 z-40 bg-[#050d18]/50 backdrop-blur-sm sm:top-20 xl:hidden"
              onClick={closeMobile}
              aria-hidden
            />
          )}

          {mobileOpen && (
            <div
              className={cn(
                "pb-4 pt-3 xl:hidden",
                isHero
                  ? "fixed left-0 right-0 top-18 z-50 border-b border-white/10 bg-[#0B2545]/80 px-4 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:top-20 sm:px-6"
                  : "mt-0 border-t border-[var(--border)]"
              )}
            >
              <div
                className={cn(
                  "flex flex-col gap-1",
                  isHero && "rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md"
                )}
              >
                <NavbarMobileSection
                  title="Discover"
                  items={DISCOVER_LINKS}
                  isHero={isHero}
                  onNavigate={closeMobile}
                />
                <Link
                  href={TOP_LEVEL_NAV.successStories.href}
                  onClick={closeMobile}
                  className={navLinkClass(
                    isHero,
                    isPathActive(pathname, TOP_LEVEL_NAV.successStories.href)
                  )}
                >
                  {TOP_LEVEL_NAV.successStories.label}
                </Link>
                <Link
                  href={TOP_LEVEL_NAV.events.href}
                  onClick={closeMobile}
                  className={navLinkClass(isHero, isPathActive(pathname, TOP_LEVEL_NAV.events.href))}
                >
                  {TOP_LEVEL_NAV.events.label}
                </Link>
                <NavbarMobileSection
                  title="Resources"
                  items={RESOURCES_LINKS}
                  isHero={isHero}
                  onNavigate={closeMobile}
                />

                <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3">
                  <ShareStoryNavButton isHero={isHero} onNavigate={closeMobile} />
                  <NavbarMobileSection
                    title="For Businesses"
                    items={FOR_BUSINESS_LINKS}
                    isHero={isHero}
                    onNavigate={closeMobile}
                  />
                  <SignInNavButton isHero={isHero} onNavigate={closeMobile} className="justify-center" />
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
      <nav className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="h-18 sm:h-20" />
      </nav>
    </header>
  );
}

export function NavbarWithSuspense(props: { variant?: "default" | "hero" }) {
  return (
    <Suspense fallback={<NavbarFallback variant={props.variant} />}>
      <Navbar {...props} />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { NavbarSidebar } from "@/components/layout/NavbarSidebar";
import { ShareStoryNavButton } from "@/components/layout/ShareStoryNavButton";
import { SignInNavButton } from "@/components/layout/SignInNavButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  BUSINESS_CTA_LINKS,
  PRIMARY_NAV_LINKS,
  SIDEBAR_MENU_SECTIONS,
} from "@/lib/nav-config";

function isPathActive(pathname: string, href: string) {
  if (href === "/gyms") {
    return (
      pathname === "/gyms" ||
      (pathname.startsWith("/gyms/") && !pathname.startsWith("/gyms/fighting-clubs"))
    );
  }
  if (href === "/gyms/fighting-clubs") return pathname.startsWith("/gyms/fighting-clubs");
  if (href === "/trainers") return pathname === "/trainers" || pathname.startsWith("/trainers/");
  if (href === "/success-stories") {
    return pathname === "/success-stories" || pathname.startsWith("/success-stories/");
  }
  if (href === "/events") {
    return pathname === "/events" || pathname.startsWith("/events/") || pathname.startsWith("/event/");
  }
  if (href === "/blogs") return pathname === "/blogs" || pathname.startsWith("/blogs/");
  if (href.startsWith("/blogs/category/")) return pathname.startsWith(href);
  if (href.startsWith("/resources")) return pathname.startsWith("/resources");
  if (href === "/about") return pathname === "/about";
  if (href === "/contact") return pathname === "/contact";
  if (href === "/ai-gym-finder") return pathname.startsWith("/ai-gym-finder");
  if (href.startsWith("/for-businesses")) return pathname === "/for-businesses";
  if (href.startsWith("/owner/register")) return pathname === "/owner/register";
  if (href === "/trainer/register") return pathname === "/trainer/register";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(isHero: boolean, active: boolean) {
  return cn(
    "whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors lg:px-2.5 xl:px-3",
    isHero
      ? active
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white"
      : active
        ? "bg-orange-50 text-[#FF6A3D]"
        : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
  );
}

function businessCtaClass(isHero: boolean, emphasized: boolean) {
  if (emphasized) {
    return cn(
      "inline-flex items-center whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
      isHero
        ? "bg-[#FF6A3D] text-white hover:bg-[#e85528]"
        : "bg-[#0B2545] text-white hover:bg-[#071832]"
    );
  }
  return cn(
    "inline-flex items-center whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
    isHero
      ? "border-white/30 text-white hover:bg-white/10"
      : "border-[var(--border)] text-[var(--text)] hover:border-[#0B2545]/30 hover:bg-[var(--bg)]"
  );
}

export function Navbar({ variant }: { variant?: "default" | "hero" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompactNav, setIsCompactNav] = useState(false);

  const isHero = variant === "hero" || pathname === "/";
  void searchParams;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsCompactNav(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function checkActive(href: string) {
    return isPathActive(pathname, href);
  }

  const sidebarFooter = (
    <>
      <div className="flex justify-center">
        <NotificationBell isHero={isHero} />
      </div>
      <ShareStoryNavButton isHero={isHero} onNavigate={closeSidebar} className="w-full justify-center" />
      <div className="grid grid-cols-2 gap-2">
        {BUSINESS_CTA_LINKS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeSidebar}
            className={cn(businessCtaClass(isHero, index === 0), "justify-center text-center")}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <SignInNavButton isHero={isHero} onNavigate={closeSidebar} className="w-full justify-center" />
    </>
  );

  return (
    <>
      <header
        data-hero-nav={isHero ? "" : undefined}
        className={cn(
          "z-50",
          isHero
            ? cn(
                "absolute top-0 left-0 right-0 ",
                sidebarOpen
                  ? "border-white/15 bg-[#0B2545]/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                  : "border-white/10 bg-transparent"
              )
            : "sticky top-0 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md"
        )}
      >
        <nav className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex h-18 items-center gap-2 sm:h-20 lg:gap-3">
            <span data-hero-nav-logo={isHero ? "" : undefined} className="shrink-0">
              <SiteLogo size="lg" priority darkBackground={!isHero} />
            </span>

            {/* Primary discovery links — desktop only */}
            <div className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex xl:gap-1">
              {PRIMARY_NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-hero-nav-link={isHero ? "" : undefined}
                  className={navLinkClass(isHero, checkActive(item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <span data-hero-nav-action={isHero ? "" : undefined} className="hidden sm:contents">
                <ShareStoryNavButton isHero={isHero} className="hidden sm:inline-flex" />
              </span>

              {BUSINESS_CTA_LINKS.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-hero-nav-action={isHero ? "" : undefined}
                  data-magnetic={index === 0 ? "" : undefined}
                  className={cn(
                    businessCtaClass(isHero, index === 0),
                    "hidden md:inline-flex"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <SignInNavButton isHero={isHero} className="hidden md:inline-flex" />

              <NotificationBell isHero={isHero} />

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className={cn(
                  "rounded-xl p-2.5 transition-colors",
                  isHero
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                )}
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <NavbarSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        isHero={isHero}
        sections={SIDEBAR_MENU_SECTIONS}
        primaryLinks={isCompactNav ? PRIMARY_NAV_LINKS : undefined}
        isPathActive={checkActive}
        footer={sidebarFooter}
      />
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

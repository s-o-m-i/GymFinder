"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  ShieldCheck,
  CalendarDays,
  Users,
  Flame,
} from "lucide-react";
import { CITIES, cityNameToSlug } from "@/lib/constants";
import { formatHeroStatCount, type HeroStats } from "@/lib/hero-data";
import { HeroBackgroundCarousel } from "@/components/home/HeroBackgroundCarousel";
import { cn } from "@/lib/utils";

type HeroCategory = "all" | "gyms" | "trainers" | "fighting-clubs" | "events";

const CATEGORY_PILLS: { id: HeroCategory; label: string; href?: string }[] = [
  { id: "all", label: "All" },
  { id: "gyms", label: "Gyms", href: "/gyms" },
  { id: "trainers", label: "Trainers", href: "/trainers" },
  { id: "fighting-clubs", label: "Fighting Clubs", href: "/gyms/fighting-clubs" },
  { id: "events", label: "Events", href: "/events" },
];

const MORE_LINKS = [
  { label: "Success Stories", href: "/success-stories" },
  { label: "AI Gym Search", href: "/ai-gym-finder" },
  { label: "Blog", href: "/blogs" },
] as const;

const FEATURE_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    description: "100% verified businesses",
  },
  {
    icon: CalendarDays,
    title: "Easy Booking",
    description: "Book & connect instantly",
  },
  {
    icon: Users,
    title: "Trusted Community",
    description: "Real reviews & ratings",
  },
  {
    icon: Flame,
    title: "Best Experience",
    description: "Built for fitness lovers",
  },
] as const;

const CATEGORY_SEARCH_PATH: Record<HeroCategory, string> = {
  all: "/gyms",
  gyms: "/gyms",
  trainers: "/trainers",
  "fighting-clubs": "/gyms/fighting-clubs",
  events: "/events",
};

/** Search bar — slightly lighter charcoal */
const HERO_SEARCH_SURFACE =
  "rounded-2xl border border-[rgba(255, 255, 255, 0.16)]  bg-[#1c1c1c] shadow-[0_8px_32px_rgba(0,0,0,0.35)] complete-bar";

/** Pills & stat cards — darker near-black with independent subtle borders */
const HERO_CHIP_SURFACE =
  "rounded-xl  chip-card";

interface HeroSectionProps {
  stats: HeroStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [activeCategory, setActiveCategory] = useState<HeroCategory>("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const basePath = CATEGORY_SEARCH_PATH[activeCategory];
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const statItems = [
    { value: stats.gyms, display: formatHeroStatCount(stats.gyms), label: "Gyms", suffix: "+" },
    { value: stats.trainers, display: formatHeroStatCount(stats.trainers), label: "Trainers", suffix: "+" },
    { value: stats.clubs, display: formatHeroStatCount(stats.clubs), label: "Clubs", suffix: "+" },
    { value: stats.users, display: formatHeroStatCount(stats.users), label: "Users", suffix: "+" },
  ];

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black" data-hero>
      <HeroBackgroundCarousel />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-black via-black/90 to-black/25 lg:from-black lg:via-black/75 lg:to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-transparent to-black/40"
        aria-hidden
      />
      <div
        data-hero-glow
        className="pointer-events-none absolute right-0 top-1/3 z-[1] h-80 w-80 rounded-full bg-[#FF6A3D]/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6">
          <div className="max-w-xl lg:max-w-none">
            <p
              data-hero-label
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#FF6A3D] sm:text-xs"
            >
              Discover. Connect. Transform.
            </p>

            <h1
              data-hero-headline
              className="font-heading text-left text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]"
            >
              <span data-hero-line className="block">
                Find Your Perfect
              </span>
              <span data-hero-line className="mt-1 block sm:mt-2">
                <span data-hero-accent className="text-[#FF6A3D]">
                  Gym, Trainer, Event, or Club
                </span>
              </span>
            </h1>

            <p
              data-hero-sub
              className="mt-4 max-w-md text-left text-sm leading-relaxed text-white/55 sm:text-base"
            >
              Discover fitness gyms, personal trainers, and upcoming events across Pakistan.
            </p>

            <form
              onSubmit={handleSearch}
              className={cn("relative mt-8 space-y-3", locationOpen || moreOpen ? "z-50" : "z-30")}
            >
              {/* Search — independent bordered bar, not connected to pills below */}
              <div
                data-hero-search
                className={cn(
                  "flex h-14 items-center gap-3 px-4 sm:h-[3.75rem] sm:px-5",
                  HERO_SEARCH_SURFACE,
                  locationOpen && "relative z-50"
                )}
              >
                <Search
                  data-hero-search-icon
                  className="pointer-events-none h-4 w-4 shrink-0 text-white/35"
                />
                <input
                  data-hero-search-input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search gyms by name, area, or city"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                />

                <div className="h-8 w-px shrink-0 bg-white/12" />

                <div className={cn("relative shrink-0", locationOpen && "z-50")}>
                  <button
                    type="button"
                    onClick={() => setLocationOpen((v) => !v)}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-white/85 transition-colors hover:bg-white/5 sm:px-3"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-[#FF6A3D]" />
                    <span className="max-w-28 truncate">{selectedCity || "All Pakistan"}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-white/45 transition-transform",
                        locationOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {locationOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setLocationOpen(false)}
                        aria-hidden
                      />
                      <div className="absolute right-0 top-full z-50 mt-2 max-h-64 w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#111111]/95 py-1 shadow-xl backdrop-blur-xl">
                        <Link
                          href="/gyms"
                          onClick={() => {
                            setSelectedCity("");
                            setLocationOpen(false);
                          }}
                          className="block border-b border-white/10 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                        >
                          All Pakistan
                        </Link>
                        {CITIES.map((city) => {
                          const slug = cityNameToSlug(city);
                          return (
                            <Link
                              key={city}
                              href={slug ? `/gyms/${slug}` : `/gyms?city=${encodeURIComponent(city)}`}
                              onClick={() => {
                                setSelectedCity(city);
                                setLocationOpen(false);
                              }}
                              className="block px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                            >
                              {city}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Category pills — separate row, each with its own border */}
              <div className="flex flex-wrap gap-2">
                {CATEGORY_PILLS.map(({ id, label, href }) => (
                  <button
                    key={id}
                    type="button"
                    data-hero-chip
                    onClick={() => {
                      setActiveCategory(id);
                      if (href && id !== "all") router.push(href);
                    }}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
                      activeCategory === id
                        ? " text-white shadow-[0_4px_16px_rgba(255,106,61,0.35)]"
                        : cn(HERO_CHIP_SURFACE, "text-white/80 hover:border-white/20 hover:text-white")
                    )}
                  >
                    {label}
                  </button>
                ))}

                <div className="relative">
                  <button
                    type="button"
                    data-hero-chip
                    onClick={() => setMoreOpen((v) => !v)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:border-white/20 hover:text-white sm:text-sm",
                      HERO_CHIP_SURFACE
                    )}
                  >
                    More
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-white/45 transition-transform",
                        moreOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {moreOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMoreOpen(false)}
                        aria-hidden
                      />
                      <div className="absolute left-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-[#111111]/95 py-1 shadow-xl backdrop-blur-xl">
                        {MORE_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMoreOpen(false)}
                            className="block px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </form>

            {/* Stats — same independent bordered card style as inactive pills */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {statItems.map((stat) => (
                <div
                  key={stat.label}
                  data-hero-stat
                  data-stat-value={stat.value}
                  data-stat-suffix={stat.suffix}
                  className={cn("px-3 py-4 text-center sm:px-4 sm:py-5", HERO_CHIP_SURFACE)}
                >
                  <div
                    data-hero-stat-value
                    className="font-heading text-xl font-bold text-[#FF6A3D] sm:text-2xl"
                  >
                    {stat.display}
                  </div>
                  <div className="mt-1 text-xs text-white/45 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden min-h-[320px] lg:block" aria-hidden />
        </div>

        {/* Scroll hint — full-width row so it doesn't collide with stat cards on mobile */}
        <div data-hero-scroll className="mt-5 flex w-full justify-center sm:mt-6 lg:mt-4">
          <a
            href="#explore-center"
            className="inline-flex flex-col items-center gap-2 text-white/45 transition-colors hover:text-white/70 sm:flex-row sm:gap-2.5"
          >
            <span className="hidden h-8 w-[18px] items-start justify-center rounded-full border-2 border-white/45 pt-1 sm:flex">
              <span className="h-1.5 w-0.5 animate-bounce rounded-full bg-white/70" />
            </span>
            <ChevronDown
              className="h-5 w-5 animate-bounce text-white/55 sm:hidden"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-xs font-medium sm:text-sm">Scroll to explore</span>
          </a>
        </div>

        

        {/* Trusted bar — centered rounded container with vertical dividers */}
        <div className="mx-auto mt-8 w-full max-w-5xl sm:mt-10 lg:mt-12">
          <div
            className={cn(
              "flex flex-col overflow-hidden rounded-[22px] sm:flex-row",
              " bg-[#0A0D10] backdrop-blur-sm chip-card"
            )}
          >
            {FEATURE_ITEMS.map(({ icon: Icon, title, description }, index) => (
              <Fragment key={title}>
                {index > 0 && (
                  <>
                    <div className="mx-5 h-px bg-white/[0.08] sm:hidden" aria-hidden />
                    <div
                      className="mx-1 hidden h-10 w-px shrink-0 self-center bg-white/[0.1] sm:block"
                      aria-hidden
                    />
                  </>
                )}
                <div className="flex flex-1 items-center gap-3 px-5 py-5 sm:gap-4 sm:px-6 sm:py-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] ring-1 ring-white/[0.06]">
                    <Icon className="h-5 w-5 text-[#FF6A3D]" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs text-white/40 sm:text-[13px]">{description}</p>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

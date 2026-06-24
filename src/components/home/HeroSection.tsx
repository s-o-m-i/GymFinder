"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  Dumbbell,
  Swords,
  Flower2,
  Users,
  Target,
  Sparkles,
  CalendarDays,
  Trophy,
} from "lucide-react";
import { CITIES, cityNameToSlug } from "@/lib/constants";
import { formatHeroStatCount, type HeroStats } from "@/lib/hero-data";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "AI Gym Search", icon: Sparkles, href: "/ai-gym-finder" },
  { label: "Events", icon: CalendarDays, href: "/events" },
  { label: "Fighting Clubs", icon: Trophy, href: "/gyms/fighting-clubs" },
] as const;

const CATEGORY_PILLS = [
  { label: "Weightlifting", icon: Dumbbell, href: "/gyms?type=gym" },
  { label: "MMA", icon: Swords, href: "/gyms/mma" },
  { label: "Yoga", icon: Flower2, href: "/gyms?search=yoga" },
  { label: "Personal Training", icon: Users, href: "/gyms?search=personal+training" },
  { label: "Boxing", icon: Target, href: "/gyms/boxing" },
] as const;

interface HeroSectionProps {
  stats: HeroStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    router.push(`/gyms?${params.toString()}`);
  };

  const statItems = [
    { value: formatHeroStatCount(stats.gyms), label: "Gyms" },
    { value: formatHeroStatCount(stats.trainers), label: "Trainers" },
    { value: formatHeroStatCount(stats.clubs), label: "Clubs" },
    { value: String(stats.cities), label: "Cities" },
  ];

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/Hero_Bg.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#050d18]/55" aria-hidden />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#FF6A3D]/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-32 sm:pb-16">
        {/* Headline */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="font-heading font-bold text-3xl sm:text-5xl lg:text-[3.25rem] text-white leading-[1.15] tracking-tight max-w-4xl mx-auto">
            Find Your Perfect{" "}
            <span className="text-[#FF6A3D]">Gym</span>,{" "}
            <span className="text-[#FF6A3D]">Trainer</span>,{" "}
            <span className="text-[#FF6A3D]">Event</span>, or{" "}
            <span className="text-[#FF6A3D]">Fighting Club</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/60 max-w-2xl mx-auto">
            Discover fitness gyms, personal trainers, and upcoming events across Pakistan.
          </p>
        </div>

        {/* Glass search card */}
        <form
          onSubmit={handleSearch}
          className={cn("relative max-w-3xl mx-auto mb-10", locationOpen ? "z-50" : "z-30")}
        >
          <div className="overflow-visible rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 sm:p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search gyms by name, area, or city"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/10 bg-white/[0.06] text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/50 focus:border-[#FF6A3D]/40"
                />
              </div>

              <div className={cn("relative sm:w-56 shrink-0", locationOpen && "z-50")}>
                <button
                  type="button"
                  onClick={() => setLocationOpen((v) => !v)}
                  className="w-full h-12 flex items-center justify-between gap-2 px-4 rounded-xl border border-white/10 bg-white/[0.06] text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-[#FF6A3D] shrink-0" />
                    <span className="truncate">
                      {selectedCity || "All Pakistan"}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-white/50 shrink-0 transition-transform",
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
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-white/10 bg-[#0B2545]/95 backdrop-blur-xl py-1 shadow-xl max-h-64 overflow-y-auto">
                      <Link
                        href="/gyms"
                        onClick={() => {
                          setSelectedCity("");
                          setLocationOpen(false);
                        }}
                        className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors border-b border-white/10"
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
                            className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
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

            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map(({ label, icon: Icon, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF6A3D]/40 bg-[#FF6A3D]/10 text-xs sm:text-sm text-white hover:bg-[#FF6A3D]/20 hover:border-[#FF6A3D]/60 transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-[#FF6A3D]" />
                  {label}
                </Link>
              ))}
              {CATEGORY_PILLS.map(({ label, icon: Icon, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs sm:text-sm text-white/75 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-white/50" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </form>

        {/* Stats */}
        <div className="relative z-0 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm py-4 px-3 sm:px-4 text-center"
            >
              <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-white/45 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-12 sm:mt-14">
          <a
            href="#explore-categories"
            className="inline-flex flex-col items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors"
          >
            Scroll Down
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}

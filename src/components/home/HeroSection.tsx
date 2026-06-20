"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Users } from "lucide-react";

const QUICK_SEARCHES = [
  { label: "Personal Trainers", href: "/trainers" },
  { label: "Boxing in Islamabad", href: "/gyms/islamabad?type=boxing" },
  { label: "MMA Rawalpindi", href: "/gyms/rawalpindi?type=mma" },
  { label: "Ladies Only", href: "/gyms?ladiesStatus=ladies_only" },
  { label: "Budget Gyms", href: "/gyms?priceMax=3000" },
  { label: "Muay Thai", href: "/gyms/muay-thai" },
];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    router.push(`/gyms?${params.toString()}`);
  };

  return (
    <section className="relative bg-[#0B2545] overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FF6A3D 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B2545] to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6A3D]/15 border border-[#FF6A3D]/30 text-[#FF6A3D] text-xs font-semibold uppercase tracking-widest mb-6">
          <MapPin className="w-3 h-3" />
          Rawalpindi & Islamabad
        </div>

        {/* Headline */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
          Find Your{" "}
          <span className="relative">
            <span className="text-[#FF6A3D]">Perfect Gym</span>
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF6A3D]/40 rounded-full" />
          </span>
          <br />
          or Fighting Club
        </h1>

        <p className="text-[#8ba0b8] text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Discover and compare the best gyms, boxing clubs, MMA, Muay Thai and martial arts
          academies. Contact directly on WhatsApp.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gyms, areas, disciplines…"
              className="w-full pl-12 pr-32 py-4 bg-white text-[#0E1A2B] placeholder:text-gray-400 rounded-2xl text-base focus:outline-none focus:ring-3 focus:ring-[#FF6A3D]/40 shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] transition-colors active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            href="/gyms"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] transition-colors"
          >
            Browse Gyms
          </Link>
          <Link
            href="/trainers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/15 transition-colors"
          >
            <Users className="w-4 h-4" />
            Find Trainers
          </Link>
        </div>

        {/* Quick searches */}
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_SEARCHES.map((qs) => (
            <a
              key={qs.href}
              href={qs.href}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white text-sm rounded-full transition-all"
            >
              {qs.label}
            </a>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {[
            { value: "50+", label: "Verified Gyms" },
            { value: "2", label: "Cities" },
            { value: "6", label: "Disciplines" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono-nums font-bold text-2xl text-[#FF6A3D]">{stat.value}</div>
              <div className="text-[#8ba0b8] text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

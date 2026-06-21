"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { EVENT_TYPES, EVENT_TIME_OF_DAY_OPTIONS } from "@/lib/event-constants";
import { CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface EventFilterGym {
  id: string;
  name: string;
  city: string;
}

interface EventsFiltersProps {
  basePath: string;
  fixedCity?: string;
  gyms: EventFilterGym[];
}

export function EventsFilters({ basePath, fixedCity, gyms }: EventsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";
  const currentType = searchParams.get("type") ?? "";
  const currentCity = fixedCity ?? searchParams.get("city") ?? "";
  const currentGymId = searchParams.get("gymId") ?? "";
  const currentDate = searchParams.get("date") ?? "";
  const currentTimeOfDay = searchParams.get("timeOfDay") ?? "";
  const featured = searchParams.get("featured") === "1";

  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (searchInput === urlSearch) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchInput.trim();
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, urlSearch, basePath, router, searchParams]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function toggleFeatured() {
    const params = new URLSearchParams(searchParams.toString());
    if (featured) params.delete("featured");
    else params.set("featured", "1");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const hasActiveFilters = Boolean(
    currentType || currentCity || featured || currentGymId || urlSearch || currentDate || currentTimeOfDay
  );

  const selectClass =
    "w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/40";

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 card-shadow space-y-4">
        <h2 className="font-heading font-bold text-sm text-[var(--text)]">Filters</h2>

        <div>
          <label
            htmlFor="events-search"
            className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              id="events-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Title, gym, area…"
              className={`${selectClass} pl-9`}
            />
          </div>
        </div>

        {gyms.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
              Gym
            </label>
            <select
              value={currentGymId}
              onChange={(e) => updateParam("gymId", e.target.value)}
              className={selectClass}
            >
              <option value="">All gyms</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                  {!fixedCity ? ` · ${gym.city}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="events-date"
            className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide"
          >
            Date
          </label>
          <input
            id="events-date"
            type="date"
            value={currentDate}
            onChange={(e) => updateParam("date", e.target.value)}
            className={selectClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
            Time of day
          </label>
          <select
            value={currentTimeOfDay}
            onChange={(e) => updateParam("timeOfDay", e.target.value)}
            className={selectClass}
          >
            <option value="">Any time</option>
            {EVENT_TIME_OF_DAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {!fixedCity && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
              City
            </label>
            <select
              value={currentCity}
              onChange={(e) => updateParam("city", e.target.value)}
              className={selectClass}
            >
              <option value="">All cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
            Type
          </label>
          <select
            value={currentType}
            onChange={(e) => updateParam("type", e.target.value)}
            className={selectClass}
          >
            <option value="">All types</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={toggleFeatured}
          className={cn(
            "w-full h-10 rounded-xl text-sm font-semibold border transition-colors cursor-pointer",
            featured
              ? "bg-[#FF6A3D]/10 border-[#FF6A3D]/40 text-[#FF6A3D]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#FF6A3D]/30"
          )}
        >
          {featured ? "★ Featured only" : "Show featured"}
        </button>

        {hasActiveFilters && (
          <Link
            href={basePath}
            className="block text-center text-xs font-semibold text-[#FF6A3D] hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>
    </aside>
  );
}

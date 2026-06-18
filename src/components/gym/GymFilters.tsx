"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { GYM_TYPES, CITIES, LADIES_STATUS_OPTIONS, RAWALPINDI_AREAS, ISLAMABAD_AREAS, PRICE_RANGE } from "@/lib/constants";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getGymsBasePath, parseCityFromPath, parseTypeFromPath } from "@/lib/gyms-routes";
import type { City } from "@/lib/constants";

interface FilterState {
  search: string;
  city: string;
  area: string;
  type: string;
  priceMin: number;
  priceMax: number;
  ladiesStatus: string;
  discipline: string;
  sort: string;
}

export function GymFilters({ fixedCity, fixedType }: { fixedCity?: City; fixedType?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const pathCity = parseCityFromPath(pathname) ?? "";
  const pathType = parseTypeFromPath(pathname) ?? "";

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") ?? "",
    city: fixedCity ?? pathCity ?? searchParams.get("city") ?? "",
    area: searchParams.get("area") ?? "",
    type: fixedType ?? pathType ?? searchParams.get("type") ?? "",
    priceMin: Number(searchParams.get("priceMin")) || PRICE_RANGE.min,
    priceMax: Number(searchParams.get("priceMax")) || PRICE_RANGE.max,
    ladiesStatus: searchParams.get("ladiesStatus") ?? "",
    discipline: searchParams.get("discipline") ?? "",
    sort: searchParams.get("sort") ?? "featured",
  });

  // Sync when URL changes (back/forward navigation)
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") ?? "",
      city: fixedCity ?? parseCityFromPath(pathname) ?? searchParams.get("city") ?? "",
      area: searchParams.get("area") ?? "",
      type: fixedType ?? parseTypeFromPath(pathname) ?? searchParams.get("type") ?? "",
      priceMin: Number(searchParams.get("priceMin")) || PRICE_RANGE.min,
      priceMax: Number(searchParams.get("priceMax")) || PRICE_RANGE.max,
      ladiesStatus: searchParams.get("ladiesStatus") ?? "",
      discipline: searchParams.get("discipline") ?? "",
      sort: searchParams.get("sort") ?? "featured",
    });
  }, [searchParams, pathname, fixedCity, fixedType]);

  const buildFilterUrl = useCallback((next: FilterState) => {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.area) params.set("area", next.area);
    // Type as query only when city is in the URL path
    if (next.city && next.type) params.set("type", next.type);
    if (next.priceMin > PRICE_RANGE.min) params.set("priceMin", String(next.priceMin));
    if (next.priceMax < PRICE_RANGE.max) params.set("priceMax", String(next.priceMax));
    if (next.ladiesStatus) params.set("ladiesStatus", next.ladiesStatus);
    if (next.discipline) params.set("discipline", next.discipline);
    if (next.sort && next.sort !== "featured") params.set("sort", next.sort);

    let base = "/gyms";
    if (next.city) {
      base = getGymsBasePath({ city: next.city });
    } else if (next.type) {
      base = getGymsBasePath({ type: next.type });
    }

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, []);

  const applyFilters = useCallback(
    (updated: Partial<FilterState>) => {
      const next = { ...filters, ...updated };
      setFilters(next);

      startTransition(() => {
        router.push(buildFilterUrl(next), { scroll: false });
      });
    },
    [filters, router, buildFilterUrl]
  );

  const handleCityToggle = (city: City) => {
    const isActive = filters.city === city;
    applyFilters({ city: isActive ? "" : city, area: "" });
  };

  // Build grouped area options to avoid duplicate keys when areas share names across cities
  const areaGroups: { city: string; areas: readonly string[] }[] =
    filters.city === "Islamabad"
      ? [{ city: "Islamabad", areas: ISLAMABAD_AREAS }]
      : filters.city === "Rawalpindi"
      ? [{ city: "Rawalpindi", areas: RAWALPINDI_AREAS }]
      : [
          { city: "Rawalpindi", areas: RAWALPINDI_AREAS },
          { city: "Islamabad", areas: ISLAMABAD_AREAS },
        ];

  const clearFilters = () => {
    const reset: FilterState = {
      search: "",
      city: fixedCity ?? "",
      area: "",
      type: fixedType ?? "",
      priceMin: PRICE_RANGE.min,
      priceMax: PRICE_RANGE.max,
      ladiesStatus: "",
      discipline: "",
      sort: "featured",
    };
    setFilters(reset);
    const base = fixedCity
      ? getGymsBasePath({ city: fixedCity })
      : fixedType
      ? getGymsBasePath({ type: fixedType })
      : "/gyms";
    startTransition(() => router.push(base, { scroll: false }));
  };

  const hasActiveFilters =
    filters.search ||
    filters.city ||
    filters.area ||
    filters.type ||
    filters.priceMin > PRICE_RANGE.min ||
    filters.priceMax < PRICE_RANGE.max ||
    filters.ladiesStatus ||
    filters.discipline;

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Gym name or area…"
            value={filters.search}
            onChange={(e) => applyFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          City
        </label>
        <div className="flex gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCityToggle(city)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl border transition-colors",
                filters.city === city
                  ? "bg-[#0B2545] text-white border-[#0B2545]"
                  : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Area
        </label>
        <div className="relative">
          <select
            value={filters.area}
            onChange={(e) => applyFilters({ area: e.target.value })}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]"
          >
            <option value="">All Areas</option>
            {areaGroups.map((group) =>
              areaGroups.length === 1 ? (
                // Single city selected — flat list, no optgroup needed
                group.areas.map((area) => (
                  <option key={`${group.city}-${area}`} value={area}>
                    {area}
                  </option>
                ))
              ) : (
                // Both cities — group by city to avoid duplicate keys
                <optgroup key={group.city} label={group.city}>
                  {group.areas.map((area) => (
                    <option key={`${group.city}-${area}`} value={area}>
                      {area}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GYM_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => applyFilters({ type: filters.type === t.value ? "" : t.value })}
              className={cn(
                "py-2 px-3 text-xs font-medium rounded-xl border text-left flex items-center gap-2 transition-colors",
                filters.type === t.value
                  ? "bg-[#FF6A3D] text-white border-[#FF6A3D]"
                  : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]"
              )}
            >
              <GymTypeIcon
                type={t.value}
                className={`w-3.5 h-3.5 shrink-0 ${filters.type === t.value ? "text-white" : "text-[var(--text-muted)]"}`}
              />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Price Range
          <span className="ml-2 font-mono-nums font-bold text-[var(--text)] normal-case">
            PKR {filters.priceMin.toLocaleString()} – {filters.priceMax.toLocaleString()}
          </span>
        </label>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Min</span>
              <span className="font-mono-nums">{filters.priceMin.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={500}
              value={filters.priceMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= filters.priceMax) applyFilters({ priceMin: val });
              }}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Max</span>
              <span className="font-mono-nums">{filters.priceMax.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={500}
              value={filters.priceMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= filters.priceMin) applyFilters({ priceMax: val });
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Ladies status */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Ladies Status
        </label>
        <div className="flex flex-col gap-2">
          {LADIES_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                applyFilters({ ladiesStatus: filters.ladiesStatus === opt.value ? "" : opt.value })
              }
              className={cn(
                "py-2 px-3 text-sm font-medium rounded-xl border text-left transition-colors",
                filters.ladiesStatus === opt.value
                  ? "bg-[#0B2545] text-white border-[#0B2545]"
                  : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="w-3.5 h-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — self-start prevents flex-stretch, enabling sticky */}
      <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-20">
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden"
          style={{ maxHeight: "calc(100vh - 5.5rem)" }}
        >
          {/* Fixed header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-heading font-bold text-[var(--text)]">Filters</h2>
            <div className="flex items-center gap-3">
              {isPending && (
                <span className="w-3.5 h-3.5 border-2 border-[#FF6A3D] border-t-transparent rounded-full animate-spin" />
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[var(--text-muted)] hover:text-[#FF6A3D] transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>
          {/* Scrollable filter body */}
          <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(100vh - 9rem)" }}>
            <FilterContent />
          </div>
        </div>
      </aside>

      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)] shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-[#FF6A3D] text-white text-xs flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--card)] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-[var(--text)]">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-lg hover:bg-[var(--bg)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-5">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

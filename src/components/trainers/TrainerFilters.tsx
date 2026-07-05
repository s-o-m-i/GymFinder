"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { CITIES } from "@/lib/constants";
import {
  TRAINER_SPECIALIZATIONS,
  TRAINER_EXPERIENCE_LEVELS,
  TRAINER_GENDER_OPTIONS,
  TRAINER_RATE_BUCKETS,
  TRAINER_RATING_FILTERS,
} from "@/lib/trainer-constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { trackFilterUsed } from "@/lib/google-analytics";

interface TrainerFiltersProps {
  basePath?: string;
  fixedCity?: string;
}

interface FilterState {
  search: string;
  city: string;
  specialization: string;
  experience: string;
  rate: string;
  gender: string;
  rating: string;
  featured: boolean;
  verified: boolean;
  sort: string;
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
      {children}
    </label>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <FilterLabel>{label}</FilterLabel>
      <SelectField value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value || "any"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}

export function TrainerFilters({ basePath = "/trainers", fixedCity }: TrainerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const readState = useCallback((): FilterState => ({
    search: searchParams.get("search") ?? "",
    city: fixedCity ?? searchParams.get("city") ?? "",
    specialization: searchParams.get("specialization") ?? "",
    experience: searchParams.get("experience") ?? "",
    rate: searchParams.get("rate") ?? "",
    gender: searchParams.get("gender") ?? "",
    rating: searchParams.get("rating") ?? "",
    featured: searchParams.get("featured") === "true",
    verified: searchParams.get("verified") === "true",
    sort: searchParams.get("sort") ?? "featured",
  }), [searchParams, fixedCity]);

  const [filters, setFilters] = useState<FilterState>(readState);

  useEffect(() => {
    setFilters(readState());
  }, [readState]);

  const buildFilterUrl = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams();

      if (next.search) params.set("search", next.search);
      if (!fixedCity && next.city) params.set("city", next.city);
      if (next.specialization) params.set("specialization", next.specialization);
      if (next.experience) params.set("experience", next.experience);
      if (next.rate) params.set("rate", next.rate);
      if (next.gender) params.set("gender", next.gender);
      if (next.rating) params.set("rating", next.rating);
      if (next.featured) params.set("featured", "true");
      if (next.verified) params.set("verified", "true");
      if (next.sort && next.sort !== "featured") params.set("sort", next.sort);

      const qs = params.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [basePath, fixedCity]
  );

  const applyFilters = useCallback(
    (updated: Partial<FilterState>) => {
      const next = { ...filters, ...updated };
      setFilters(next);
      trackFilterUsed("trainers", {
        search: next.search || undefined,
        city: next.city || undefined,
        specialization: next.specialization || undefined,
        experience: next.experience || undefined,
        rate: next.rate || undefined,
        gender: next.gender || undefined,
        rating: next.rating || undefined,
        featured: next.featured ? "true" : undefined,
        verified: next.verified ? "true" : undefined,
        sort: next.sort !== "featured" ? next.sort : undefined,
      });
      startTransition(() => {
        router.push(buildFilterUrl(next), { scroll: false });
      });
    },
    [filters, router, buildFilterUrl]
  );

  const clearFilters = () => {
    const reset: FilterState = {
      search: "",
      city: fixedCity ?? "",
      specialization: "",
      experience: "",
      rate: "",
      gender: "",
      rating: "",
      featured: false,
      verified: false,
      sort: "featured",
    };
    setFilters(reset);
    startTransition(() => router.push(basePath, { scroll: false }));
  };

  const hasActiveFilters =
    filters.search ||
    filters.city ||
    filters.specialization ||
    filters.experience ||
    filters.rate ||
    filters.gender ||
    filters.rating ||
    filters.featured ||
    filters.verified ||
    (filters.sort && filters.sort !== "featured");

  const rateOptions = [{ value: "", label: "Any budget" }, ...TRAINER_RATE_BUCKETS] as const;
  const ratingOptions = [{ value: "", label: "Any rating" }, ...TRAINER_RATING_FILTERS] as const;
  const experienceOptions = [{ value: "", label: "Any experience" }, ...TRAINER_EXPERIENCE_LEVELS] as const;
  const genderOptions = [{ value: "", label: "Any gender" }, ...TRAINER_GENDER_OPTIONS] as const;

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <FilterLabel>Search</FilterLabel>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Name or keyword…"
            value={filters.search}
            onChange={(e) => applyFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]"
          />
        </div>
      </div>

      {/* City */}
      {!fixedCity && (
        <SelectFilter
          label="City"
          value={filters.city}
          onChange={(city) => applyFilters({ city })}
          options={[
            { value: "", label: "All cities" },
            ...CITIES.map((city) => ({ value: city, label: city })),
          ]}
        />
      )}

      {/* Specialization */}
      <SelectFilter
        label="Specialization"
        value={filters.specialization}
        onChange={(specialization) => applyFilters({ specialization })}
        options={[
          { value: "", label: "All specializations" },
          ...TRAINER_SPECIALIZATIONS,
        ]}
      />

      <SelectFilter
        label="Hourly Rate"
        value={filters.rate}
        onChange={(rate) => applyFilters({ rate })}
        options={rateOptions}
      />

      <SelectFilter
        label="Gender"
        value={filters.gender}
        onChange={(gender) => applyFilters({ gender })}
        options={genderOptions}
      />

      <SelectFilter
        label="Rating"
        value={filters.rating}
        onChange={(rating) => applyFilters({ rating })}
        options={ratingOptions}
      />

      <SelectFilter
        label="Experience"
        value={filters.experience}
        onChange={(experience) => applyFilters({ experience })}
        options={experienceOptions}
      />

      {/* Featured / Verified */}
      <div>
        <FilterLabel>Highlights</FilterLabel>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyFilters({ featured: !filters.featured })}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
              filters.featured
                ? "bg-[#FF6A3D] text-white border-[#FF6A3D]"
                : "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[#FF6A3D]/40"
            )}
          >
            Featured only
          </button>
          <button
            type="button"
            onClick={() => applyFilters({ verified: !filters.verified })}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
              filters.verified
                ? "bg-[#0B2545] text-white border-[#0B2545]"
                : "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[#0B2545]/40"
            )}
          >
            Verified only
          </button>
        </div>
      </div>

      {/* Sort */}
      <SelectFilter
        label="Sort By"
        value={filters.sort}
        onChange={(sort) => applyFilters({ sort })}
        options={[
          { value: "featured", label: "Featured first" },
          { value: "rating", label: "Top rated" },
          { value: "experience", label: "Most experienced" },
          { value: "rate_asc", label: "Rate: low → high" },
          { value: "rate_desc", label: "Rate: high → low" },
          { value: "newest", label: "Newest" },
        ]}
      />

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="w-3.5 h-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-20">
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden"
          style={{ maxHeight: "calc(100vh - 5.5rem)" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-heading font-bold text-[var(--text)] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF6A3D]" />
              Filters
            </h2>
            <div className="flex items-center gap-3">
              {isPending && (
                <span className="w-3.5 h-3.5 border-2 border-[#FF6A3D] border-t-transparent rounded-full animate-spin" />
              )}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[var(--text-muted)] hover:text-[#FF6A3D] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(100vh - 9rem)" }}>
            <FilterContent />
          </div>
        </div>
      </aside>

      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)] shadow-sm cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter trainers
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
                <h2 className="font-heading font-bold text-[var(--text)]">Filter trainers</h2>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-lg hover:bg-[var(--bg)] cursor-pointer"
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
                  Show results
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

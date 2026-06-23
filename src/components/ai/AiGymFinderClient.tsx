"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Loader2,
  AlertCircle,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { GymCard } from "@/components/gym/GymCard";
import { gymTypeLabel } from "@/lib/utils";
import type { GymCardData } from "@/types";
import type { GymSearchFilters } from "@/types/gym-search";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Find boxing gyms near Bahria Town Rawalpindi under 5000",
  "Ladies-only gym in Islamabad",
  "Affordable MMA club in Lahore",
  "Best gyms under 5000 PKR",
  "Gym with parking and personal trainers in Karachi",
  "Beginner friendly fitness gym in Faisalabad",
] as const;

const LADIES_LABELS: Record<string, string> = {
  mixed: "Mixed",
  ladies_only: "Ladies only",
  ladies_timings: "Ladies timings",
  men_only: "Men only",
};

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0B2545]/8 text-[#0B2545] border border-[#0B2545]/12">
      {label}
    </span>
  );
}

function FiltersSummary({
  filters,
  source,
}: {
  filters: GymSearchFilters;
  source?: SearchResponse["source"];
}) {
  const chips: string[] = [];

  if (filters.city) chips.push(filters.city);
  if (filters.area) chips.push(filters.area);
  if (filters.gymType) chips.push(gymTypeLabel(filters.gymType));
  if (filters.ladiesStatus) chips.push(LADIES_LABELS[filters.ladiesStatus] ?? filters.ladiesStatus);
  if (filters.priceMin !== undefined) chips.push(`From PKR ${filters.priceMin.toLocaleString()}`);
  if (filters.priceMax !== undefined) chips.push(`Up to PKR ${filters.priceMax.toLocaleString()}`);
  if (filters.sizeCategory) chips.push(`${filters.sizeCategory} size`);
  if (filters.featured) chips.push("Featured");
  if (filters.ratingMin !== undefined) chips.push(`${filters.ratingMin}+ rating`);
  filters.disciplineNames?.forEach((d) => chips.push(d));
  filters.amenityNames?.forEach((a) => chips.push(a));
  if (filters.searchTerm) chips.push(`"${filters.searchTerm}"`);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {source === "gemini" ? "AI understood" : "Matched filters"}
      </span>
      {chips.map((chip) => (
        <FilterChip key={chip} label={chip} />
      ))}
    </div>
  );
}

interface SearchResponse {
  filters: GymSearchFilters;
  gyms: GymCardData[];
  resultsCount: number;
  source?: "gemini" | "local" | "keyword";
  warning?: string;
}

export function AiGymFinderClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  async function runSearch(searchQuery: string) {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setLastQuery(trimmed);

    try {
      const res = await fetch("/api/ai/gym-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Search failed. Please try again.");
        setResult(null);
        return;
      }

      setResult(data as SearchResponse);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(query);
  }

  function handleExamplePrompt(prompt: string) {
    setQuery(prompt);
    void runSearch(prompt);
  }

  return (
    <div className="space-y-10">
      {/* Hero search */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] p-6 sm:p-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A3D]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6A3D]" />
            AI-Powered Search
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl mb-3">
            Find your perfect gym in plain English
          </h1>
          <p className="text-white/75 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Describe what you&apos;re looking for — city, budget, ladies-only, boxing, amenities —
            and we&apos;ll search our real gym database. No chatbot, no fake recommendations.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g. "Boxing gym in Islamabad under 5000"'
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-[#0B2545] placeholder:text-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/50"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className={cn(
                "inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl font-semibold text-sm sm:text-base transition-all shrink-0",
                loading || query.trim().length < 2
                  ? "bg-white/30 cursor-not-allowed"
                  : "bg-[#FF6A3D] hover:bg-[#e85528] shadow-lg shadow-[#FF6A3D]/25"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Example prompts */}
      {!result && !loading && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleExamplePrompt(prompt)}
                className="px-3 py-2 text-xs sm:text-sm text-left rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[#FF6A3D]/40 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result?.warning && !loading && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          {result.warning}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF6A3D]" />
          <p className="text-sm text-[var(--text-muted)]">
            Understanding your request and searching gyms…
          </p>
        </div>
      )}

      {result && !loading && (
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading font-bold text-xl text-[var(--text)]">
                  {result.resultsCount === 0
                    ? "No gyms matched"
                    : `${result.resultsCount} gym${result.resultsCount === 1 ? "" : "s"} found`}
                </h2>
                {lastQuery && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    for &ldquo;{lastQuery}&rdquo;
                  </p>
                )}
              </div>
              {result.resultsCount > 0 && (
                <p className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <MapPin className="w-3.5 h-3.5" />
                  Real listings from our database
                </p>
              )}
            </div>

            <FiltersSummary filters={result.filters} source={result.source} />
          </div>

          {result.gyms.length === 0 ? (
            <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
              <Search className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="font-heading font-bold text-[var(--text)] mb-2">
                No matching gyms yet
              </p>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                Try a broader search — different city, higher budget, or a general gym type like
                &ldquo;fitness gym in Lahore&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {result.gyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

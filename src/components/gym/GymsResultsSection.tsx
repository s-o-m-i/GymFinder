"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Navigation,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle,
  MapPin,
  LocateFixed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GymCard } from "@/components/gym/GymCard";
import type { GymCardData, GymCardDataWithDistance } from "@/types";
import { useSearchParams } from "next/navigation";
import {
  formatAccuracyMeters,
  geolocationErrorMessage,
  getBestUserPosition,
  isLowAccuracy,
  type UserPosition,
} from "@/lib/get-user-position";

// Dynamically import the map — Leaflet requires browser APIs, cannot SSR
const NearMeMap = dynamic(() => import("@/components/map/NearMeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--bg)] flex items-center justify-center rounded-2xl">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
    </div>
  ),
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface GymsResultsSectionProps {
  initialGyms: GymCardData[];
  total: number;
  page: number;
  totalPages: number;
}

const RADIUS_OPTIONS = [5, 10, 20, 50] as const;
type Radius = (typeof RADIUS_OPTIONS)[number];
type NearMeStatus = "idle" | "loading" | "active" | "error";

interface LocationLabel {
  display:     string;
  area:        string;
  city:        string;
  fullAddress: string;
  lat:         number;
  lng:         number;
  accuracy?:   number;
}

// ── Reverse geocode via our API proxy → Nominatim ────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<LocationLabel> {
  try {
    const res  = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    return data as LocationLabel;
  } catch {
    return {
      display:     `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      area:        "",
      city:        "Your location",
      fullAddress: "",
      lat,
      lng,
    };
  }
}

// ── Location card ─────────────────────────────────────────────────────────────
function LocationCard({
  label,
  gyms,
  radius,
  onClear,
  onRefresh,
  isRefreshing,
}: {
  label:        LocationLabel;
  gyms:         GymCardDataWithDistance[];
  radius:       Radius;
  onClear:      () => void;
  onRefresh:    () => void;
  isRefreshing: boolean;
}) {
  const [mapOpen, setMapOpen] = useState(true);
  const lowAccuracy = label.accuracy != null && isLowAccuracy(label.accuracy);

  return (
    <div className="border border-emerald-200 bg-emerald-50 rounded-xl overflow-hidden">
      {/* ── Address row ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Pulsing dot */}
        <div className="relative w-9 h-9 shrink-0">
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping" />
          <span className="relative flex w-9 h-9 rounded-full bg-emerald-500 items-center justify-center shadow">
            <LocateFixed className="w-4 h-4 text-white" />
          </span>
        </div>

        {/* Address text */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-heading font-bold text-emerald-900 text-[15px] leading-tight">
              {label.display}
            </span>
            <span className="shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-200">
              GPS Detected
            </span>
          </div>
          {label.fullAddress && (
            <p className="text-[11px] text-emerald-700 leading-snug line-clamp-1 mt-0.5">
              {label.fullAddress}
            </p>
          )}
          <p className="font-mono-nums text-[11px] text-emerald-600 mt-0.5">
            {label.lat.toFixed(5)}°N &nbsp;{label.lng.toFixed(5)}°E
            {label.accuracy != null && (
              <span className="ml-2 text-emerald-700">
                · Accuracy {formatAccuracyMeters(label.accuracy)}
              </span>
            )}
          </p>
          {lowAccuracy && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2 leading-snug">
              GPS looks approximate on this device. For a better fix, tap{" "}
              <strong>Refresh location</strong> near a window or use your phone&apos;s browser.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-60"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
            Refresh location
          </button>
          <button
            onClick={() => setMapOpen((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {mapOpen ? "Hide map" : "Show map"}
            {mapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={onClear}
            className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:text-red-600 hover:bg-red-50 border border-emerald-200 hover:border-red-200 rounded-lg transition-all"
            title="Clear location"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Map ── */}
      {mapOpen && (
        <div className="px-4 pb-4">
          <div
            className="near-me-map-wrapper w-full rounded-xl overflow-hidden border border-emerald-200 bg-[var(--bg)]"
            style={{ height: 320 }}
          >
            <NearMeMap
              key={`${label.lat}-${label.lng}-${gyms.length}-${radius}`}
              userLat={label.lat}
              userLng={label.lng}
              gyms={gyms}
            />
          </div>
          <p className="text-[11px] text-emerald-600 mt-1.5 text-center">
            Blue dot = your location &nbsp;·&nbsp; Orange pins = nearby gyms &nbsp;·&nbsp; Tap a pin for details
            &nbsp;·&nbsp; Two-finger scroll or pinch on the map to zoom
          </p>
        </div>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
    Math.max(1, page - 2) + i
  ).filter((p) => p <= totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="flex items-center gap-1 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Prev
        </Link>
      )}
      <div className="flex gap-1">
        {pages.map((p) => (
          <Link key={p} href={makeHref(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
              p === page ? "bg-[#0B2545] text-white" : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>
      {page < totalPages && (
        <Link href={makeHref(page + 1)} className="flex items-center gap-1 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
          Next <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ── Sort bar ──────────────────────────────────────────────────────────────────
function SortBar({ total, displayed, nearMeActive }: { total: number; displayed: number; nearMeActive: boolean }) {
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "featured";

  const makeSort = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", s);
    return `?${params.toString()}`;
  };

  if (nearMeActive) return null;

  return (
    <div className="flex items-center justify-between mb-6">
      <span className="text-sm text-[var(--text-muted)] hidden sm:block">{displayed} of {total} gyms</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">Sort:</span>
        {([ { key: "featured", label: "Featured" }, { key: "price_asc", label: "Price ↑" }, { key: "price_desc", label: "Price ↓" } ] as const).map(({ key, label }) => (
          <Link key={key} href={makeSort(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              current === key ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function GymsResultsSection({ initialGyms, total, page, totalPages }: GymsResultsSectionProps) {
  const [nearMeStatus, setNearMeStatus] = useState<NearMeStatus>("idle");
  const [nearbyGyms, setNearbyGyms] = useState<GymCardDataWithDistance[]>([]);
  const [radius, setRadius] = useState<Radius>(10);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<LocationLabel | null>(null);
  const [activePosition, setActivePosition] = useState<UserPosition | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const isNearMeActive = nearMeStatus === "active";

  const runNearMeSearch = useCallback(
    async (lat: number, lng: number, r: Radius, accuracy: number) => {
      setNearMeStatus("loading");
      setFetchError(null);
      setActivePosition({ lat, lng, accuracy });

      reverseGeocode(lat, lng).then((label) =>
        setLocationLabel({ ...label, lat, lng, accuracy })
      );

      try {
        const res = await fetch("/api/gyms/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng, radius: r }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        setNearbyGyms(data.gyms as GymCardDataWithDistance[]);
        setNearMeStatus("active");
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Failed to fetch nearby gyms.");
        setNearMeStatus("error");
      }
    },
    []
  );

  const requestLocation = useCallback(
    async (r: Radius) => {
      setIsLocating(true);
      setNearMeStatus("loading");
      setFetchError(null);

      try {
        const pos = await getBestUserPosition();
        await runNearMeSearch(pos.lat, pos.lng, r, pos.accuracy);
      } catch (err) {
        setFetchError(geolocationErrorMessage(err));
        setNearMeStatus("error");
      } finally {
        setIsLocating(false);
      }
    },
    [runNearMeSearch]
  );

  const handleNearMe = useCallback(() => {
    requestLocation(radius);
  }, [requestLocation, radius]);

  const handleRadiusChange = useCallback(
    (r: Radius) => {
      setRadius(r);
      if (isNearMeActive && activePosition) {
        runNearMeSearch(activePosition.lat, activePosition.lng, r, activePosition.accuracy);
      }
    },
    [isNearMeActive, activePosition, runNearMeSearch]
  );

  const handleClear = useCallback(() => {
    setNearMeStatus("idle");
    setNearbyGyms([]);
    setFetchError(null);
    setLocationLabel(null);
    setActivePosition(null);
    setIsLocating(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 min-w-0">

      {/* ══ Near Me Panel ════════════════════════════════════════════════════ */}
      <div className="mb-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">

        {/* Action / status row */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          {nearMeStatus === "idle" || nearMeStatus === "error" ? (
            <button onClick={handleNearMe}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] active:scale-[0.97] transition-all shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              Find Near Me
            </button>
          ) : nearMeStatus === "loading" ? (
            <div className="inline-flex items-center gap-2 h-10 px-5 bg-[#0B2545]/80 text-white text-sm font-semibold rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isLocating ? "Getting GPS fix…" : "Finding nearby gyms…"}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 h-10 px-4 bg-emerald-500/10 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Near Me active
            </div>
          )}

          {/* Radius pills */}
          {(nearMeStatus === "active" || nearMeStatus === "loading") && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-[var(--text-muted)]">Radius:</span>
              {RADIUS_OPTIONS.map((r) => (
                <button key={r} onClick={() => handleRadiusChange(r)}
                  className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                    radius === r ? "bg-[#FF6A3D] text-white border-[#FF6A3D]" : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          )}

          {isNearMeActive && (
            <span className="text-sm text-[var(--text-muted)]">
              <span className="font-mono-nums font-semibold text-[var(--text)]">{nearbyGyms.length}</span>{" "}
              {nearbyGyms.length === 1 ? "gym" : "gyms"} within {radius} km
            </span>
          )}
        </div>

        {/* Location card + map (active state) */}
        {isNearMeActive && locationLabel && (
          <div className="px-4 pb-4">
            <LocationCard
              label={locationLabel}
              gyms={nearbyGyms}
              radius={radius}
              onClear={handleClear}
              onRefresh={() => requestLocation(radius)}
              isRefreshing={isLocating}
            />
          </div>
        )}

        {/* Address loading shimmer */}
        {nearMeStatus === "loading" && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl animate-pulse">
              <div className="w-9 h-9 rounded-full bg-[var(--border)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-[var(--border)] rounded w-2/5" />
                <div className="h-2.5 bg-[var(--border)] rounded w-3/5" />
                <div className="h-2.5 bg-[var(--border)] rounded w-1/3" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {(nearMeStatus === "error" || fetchError) && (
          <div className="px-4 pb-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fetchError ?? "Something went wrong."}</span>
            </div>
          </div>
        )}
      </div>

      {/* ══ Sort bar ═════════════════════════════════════════════════════════ */}
      <SortBar total={total} displayed={initialGyms.length} nearMeActive={isNearMeActive} />

      {/* ══ Loading skeleton ═════════════════════════════════════════════════ */}
      {nearMeStatus === "loading" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-[var(--bg)]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[var(--bg)] rounded-lg w-3/4" />
                <div className="h-3 bg-[var(--bg)] rounded-lg w-1/2" />
                <div className="h-3 bg-[var(--bg)] rounded-lg w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ Near Me results ══════════════════════════════════════════════════ */}
      {isNearMeActive && (
        nearbyGyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[var(--bg)] rounded-2xl flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="font-heading font-bold text-[var(--text)] mb-2">No gyms within {radius} km</h3>
            <p className="text-[var(--text-muted)] text-sm max-w-xs mb-4">Try a larger radius or browse all listings.</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {RADIUS_OPTIONS.filter((r) => r > radius).slice(0, 2).map((r) => (
                <button key={r} onClick={() => handleRadiusChange(r)}
                  className="px-4 py-2 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
                >
                  Try {r} km
                </button>
              ))}
              <button onClick={handleClear} className="px-4 py-2 border border-[var(--border)] text-[var(--text)] text-sm font-medium rounded-xl hover:bg-[var(--bg)] transition-colors">
                Browse all
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {nearbyGyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} distanceKm={gym.distanceKm} />
            ))}
          </div>
        )
      )}

      {/* ══ Normal results ═══════════════════════════════════════════════════ */}
      {nearMeStatus !== "loading" && !isNearMeActive && (
        initialGyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[var(--bg)] rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="font-heading font-bold text-[var(--text)] mb-2">No gyms found</h3>
            <p className="text-[var(--text-muted)] text-sm max-w-xs">Try adjusting your filters or search query.</p>
            <Link href="/gyms" className="mt-4 px-4 py-2 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors">
              Clear all filters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {initialGyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} />
          </>
        )
      )}
    </div>
  );
}

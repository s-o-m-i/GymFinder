import Link from "next/link";
import { LocateFixed, MapPin } from "lucide-react";
import { HOME_MAP_CITIES, HOME_MAP_PINS } from "@/lib/home-data";

export function MapPreviewSection() {
  return (
    <section className="bg-[var(--bg)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Near Me Discovery
            </p>
            <h2 className="font-heading mb-4 text-2xl font-bold text-[var(--text)] sm:text-3xl">
              Find Gyms Near You
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Discover verified gyms and fighting clubs near your location. Search by city or use
              map view to compare listings in{" "}
              {HOME_MAP_CITIES.slice(0, -1).join(", ")}, and {HOME_MAP_CITIES.at(-1)}.
            </p>

            <ul className="mb-8 space-y-3">
              {[
                "Location-based gym discovery across Pakistan",
                "Compare nearby gyms by price and facilities",
                "Open map view with pins for quick browsing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--text)]">
                  <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A3D]" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/gyms"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A3D] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/20 transition-colors hover:bg-[#e85528]"
            >
              <MapPin className="h-4 w-4" />
              Open Map View
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[#0B2545] p-4 shadow-xl">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#12345f] to-[#1a4080]" />

              {/* Decorative roads */}
              <div className="absolute left-[18%] top-0 h-full w-px bg-white/10" />
              <div className="absolute left-[52%] top-0 h-full w-px bg-white/10" />
              <div className="absolute top-[42%] h-px w-full bg-white/10" />

              {/* Sample pins */}
              {HOME_MAP_PINS.map((pin) => (
                <div
                  key={pin.label}
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <div className="relative">
                    <span className="absolute -inset-2 animate-ping rounded-full bg-[#FF6A3D]/30" />
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#FF6A3D] shadow-lg">
                      <MapPin className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <span className="mt-1 block whitespace-nowrap rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#0B2545] shadow">
                    {pin.label}
                  </span>
                </div>
              ))}

              {/* User location dot */}
              <div className="absolute bottom-[22%] left-[48%] flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-md" />
                <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#0B2545]">
                  You
                </span>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-white/50">
              Map preview — full near-me discovery available on the gyms page
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

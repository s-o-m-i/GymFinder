import { FeatureCard } from "@/components/home/FeatureCard";
import { HOME_FEATURES } from "@/lib/home-data";

export function FeatureHighlightsSection() {
  return (
    <section data-section="features" className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-heading mb-4 text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Everything You Need in One Platform
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            From gym discovery to trainer bookings and fight events — one marketplace built for
            Pakistan&apos;s fitness community.
          </p>
        </div>

        <div data-stagger-features className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {HOME_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { HOME_SOCIAL_STATS } from "@/lib/home-data";

export function SocialProofSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--card)] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Growing Fitness Network in Pakistan
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Connecting gyms, fighting clubs, trainers, and fitness events nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOME_SOCIAL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 py-8 text-center card-shadow"
            >
              <div className="font-heading mb-1 text-3xl font-bold text-[#FF6A3D] sm:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

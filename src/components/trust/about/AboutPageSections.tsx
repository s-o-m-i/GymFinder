"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  Trophy,
} from "lucide-react";
import { FadeInView, StaggerChildren, StaggerItem } from "@/components/trust/FadeInView";
import { AnimatedCounter } from "@/components/trust/AnimatedCounter";
import {
  CORE_VALUES,
  DISCOVER_ITEMS,
  MISSION_STATEMENT,
  ROADMAP_ITEMS,
  STORY_PARAGRAPHS,
  VISION_STATEMENT,
  WHO_WE_HELP,
  WHY_CHOOSE_FEATURES,
} from "@/lib/trust-pages/about-data";
import type { PlatformStats } from "@/lib/trust-pages/platform-stats";
import { cn } from "@/lib/utils";

interface AboutPageSectionsProps {
  stats: PlatformStats;
}

export function AboutPageSections({ stats }: AboutPageSectionsProps) {
  const statItems = [
    { label: "Cities Covered", value: stats.cities, suffix: "+" },
    { label: "Gyms Listed", value: stats.gyms, suffix: "+" },
    { label: "Trainers", value: stats.trainers, suffix: "+" },
    { label: "Fighting Clubs", value: stats.fightingClubs, suffix: "+" },
    { label: "Events", value: stats.events, suffix: "+" },
    { label: "Success Stories", value: stats.successStories, suffix: "+" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,106,61,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(11,37,69,0.08) 0%, transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20 lg:px-8">
          <FadeInView>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Our platform
            </p>
            <h1 className="font-heading text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
              About FitnessAdda PK
            </h1>
            <p className="mt-4 text-lg font-medium text-[#0B2545]">
              Connecting Pakistan&apos;s fitness community through technology.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              FitnessAdda PK is Pakistan&apos;s fitness marketplace — helping people discover gyms,
              personal trainers, fighting clubs, and events while giving fitness businesses the
              visibility they deserve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/gyms"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/20 transition-colors hover:bg-[#e85528]"
              >
                Explore Gyms
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/success-stories"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[#0B2545]/20 hover:bg-[var(--card)]"
              >
                Success Stories
              </Link>
            </div>
          </FadeInView>

          <FadeInView delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#0B2545] via-[#12345f] to-[#0B2545] p-8 shadow-2xl">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
                aria-hidden
              />
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FF6A3D]/20 text-[#FF6A3D]">
                  <Dumbbell className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <p className="font-heading text-2xl font-bold text-white">Pakistan&apos;s Fitness Hub</p>
                <p className="mt-2 max-w-xs text-sm text-white/60">
                  Gyms · Trainers · Fighting Clubs · Events · Stories
                </p>
                <div className="mt-8 grid w-full grid-cols-3 gap-3">
                  {[Trophy, Sparkles, Building2].map((Icon, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 rounded-xl bg-white/5 p-3 backdrop-blur-sm"
                    >
                      <Icon className="h-5 w-5 text-[#FF6A3D]" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                        {["Stories", "Discover", "Business"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#FF6A3D]/20 blur-2xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" aria-hidden />
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20" aria-labelledby="our-story-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeInView>
              <h2 id="our-story-heading" className="font-heading text-3xl font-bold text-[var(--text)] sm:text-4xl">
                Why We Built FitnessAdda
              </h2>
              <div className="mt-6 space-y-4">
                {STORY_PARAGRAPHS.map((paragraph, i) => (
                  <p
                    key={i}
                    className={cn(
                      "text-sm leading-relaxed sm:text-base",
                      i === STORY_PARAGRAPHS.length - 1
                        ? "font-medium text-[var(--text)]"
                        : "text-[var(--text-muted)]"
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </FadeInView>

            <FadeInView delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 card-shadow">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#FF6A3D]/10 blur-2xl" aria-hidden />
                <blockquote className="relative font-heading text-xl font-semibold leading-snug text-[#0B2545] sm:text-2xl">
                  &ldquo;One trusted platform for every fitness journey in Pakistan.&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A3D]/10 text-[#FF6A3D]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    Built for gym owners, trainers, and fitness enthusiasts alike.
                  </p>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20" aria-labelledby="mission-vision-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="mission-vision-heading" className="sr-only">
            Mission and Vision
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <FadeInView>
              <article className="h-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6A3D]">
                  Mission
                </p>
                <p className="mt-4 font-heading text-lg font-semibold leading-relaxed text-[var(--text)] sm:text-xl">
                  {MISSION_STATEMENT}
                </p>
              </article>
            </FadeInView>
            <FadeInView delay={0.1}>
              <article className="h-full rounded-2xl border border-[#0B2545]/10 bg-[#0B2545] p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6A3D]">
                  Vision
                </p>
                <p className="mt-4 font-heading text-lg font-semibold leading-relaxed sm:text-xl">
                  {VISION_STATEMENT}
                </p>
              </article>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="values-heading" className="font-heading text-3xl font-bold text-[var(--text)]">
              Core Values
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
              The principles that guide everything we build at FitnessAdda PK.
            </p>
          </FadeInView>
          <StaggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={value.title}>
                  <article className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-shadow hover:shadow-md">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A3D]/10 text-[#FF6A3D]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[var(--text)]">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                      {value.description}
                    </p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* What You Can Discover */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20" aria-labelledby="discover-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="discover-heading" className="font-heading text-3xl font-bold text-[var(--text)]">
              What You Can Discover
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
              Everything Pakistan&apos;s fitness community needs — in one place.
            </p>
          </FadeInView>
          <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DISCOVER_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <Link
                    href={item.href}
                    className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition-all hover:border-[#FF6A3D]/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2545]/5 text-[#0B2545] transition-colors group-hover:bg-[#FF6A3D]/10 group-hover:text-[#FF6A3D]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-bold text-[var(--text)]">{item.title}</h3>
                    <p className="mt-1 flex-1 text-xs leading-relaxed text-[var(--text-muted)]">
                      {item.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A3D] opacity-0 transition-opacity group-hover:opacity-100">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 sm:py-20" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="why-heading" className="font-heading text-3xl font-bold text-[var(--text)]">
              Why Choose FitnessAdda
            </h2>
          </FadeInView>
          <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {WHY_CHOOSE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <article className="h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <Icon className="mb-3 h-5 w-5 text-[#FF6A3D]" />
                    <h3 className="font-heading text-sm font-bold text-[var(--text)]">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                      {feature.description}
                    </p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Who We Help */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20" aria-labelledby="who-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="who-heading" className="font-heading text-3xl font-bold text-[var(--text)]">
              Who We Help
            </h2>
          </FadeInView>
          <StaggerChildren className="grid gap-6 md:grid-cols-2">
            {WHO_WE_HELP.map((card) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title}>
                  <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B2545] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-bold text-[var(--text)]">
                          {card.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      {card.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {card.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2 text-sm text-[var(--text)]"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A3D]" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={card.href}
                      className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6A3D] hover:underline"
                    >
                      Get started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="relative overflow-hidden bg-[#0B2545] py-16 sm:py-20" aria-labelledby="stats-heading">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(255,106,61,0.15) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="stats-heading" className="font-heading text-3xl font-bold text-white">
              Platform Statistics
            </h2>
            <p className="mt-3 text-sm text-white/60 sm:text-base">
              A growing network connecting Pakistan&apos;s fitness community.
            </p>
          </FadeInView>
          <StaggerChildren className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {statItems.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="font-heading text-3xl font-bold text-[#FF6A3D] sm:text-4xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-white/50 sm:text-sm">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 sm:py-20" aria-labelledby="roadmap-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mb-12 text-center">
            <h2 id="roadmap-heading" className="font-heading text-3xl font-bold text-[var(--text)]">
              Our Roadmap
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              From marketplace launch to Pakistan&apos;s full digital fitness ecosystem.
            </p>
          </FadeInView>
          <div className="relative">
            <div
              className="absolute bottom-0 left-4 top-0 w-px bg-[var(--border)] sm:left-1/2 sm:-translate-x-px"
              aria-hidden
            />
            <ol className="space-y-8">
              {ROADMAP_ITEMS.map((item, index) => (
                <FadeInView key={item.title} delay={index * 0.05}>
                  <li className="relative flex gap-6 sm:gap-0">
                    <div className="hidden flex-1 sm:block sm:pr-8 sm:text-right">
                      {index % 2 === 0 && (
                        <div>
                          <RoadmapCard item={item} align="right" />
                        </div>
                      )}
                    </div>
                    <div className="relative z-10 flex shrink-0 flex-col items-center sm:px-4">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                          item.status === "completed"
                            ? "border-[#FF6A3D] bg-[#FF6A3D] text-white"
                            : item.status === "current"
                              ? "border-[#FF6A3D] bg-[var(--card)] text-[#FF6A3D]"
                              : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]"
                        )}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 sm:pl-8">
                      <div className={cn(index % 2 === 0 && "sm:hidden")}>
                        <RoadmapCard item={item} align="left" />
                      </div>
                    </div>
                  </li>
                </FadeInView>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] bg-[var(--card)] py-16 sm:py-20" aria-labelledby="about-cta-heading">
        <FadeInView className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="about-cta-heading" className="font-heading text-3xl font-bold text-[var(--text)] sm:text-4xl">
            Join Pakistan&apos;s Fitness Community
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] sm:text-base">
            Whether you&apos;re looking for a gym, listing your business, or sharing your transformation
            — FitnessAdda is your home.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/gyms"
              className="inline-flex items-center justify-center rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e85528]"
            >
              Find a Gym
            </Link>
            <Link
              href="/owner/register"
              className="inline-flex items-center justify-center rounded-full bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#071832]"
            >
              List Your Gym
            </Link>
            <Link
              href="/trainer/register"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--bg)]"
            >
              Become a Trainer
            </Link>
          </div>
        </FadeInView>
      </section>
    </>
  );
}

function RoadmapCard({
  item,
  align,
}: {
  item: (typeof ROADMAP_ITEMS)[number];
  align: "left" | "right";
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5",
        align === "right" && "sm:text-right"
      )}
    >
      <div
        className={cn(
          "mb-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          item.status === "completed"
            ? "bg-[#FF6A3D]/10 text-[#FF6A3D]"
            : item.status === "current"
              ? "bg-[#0B2545]/10 text-[#0B2545]"
              : "bg-[var(--border)] text-[var(--text-muted)]"
        )}
      >
        {item.status === "completed"
          ? "Completed"
          : item.status === "current"
            ? "In Progress"
            : "Upcoming"}
      </div>
      <h3 className="font-heading font-bold text-[var(--text)]">{item.title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{item.description}</p>
    </article>
  );
}

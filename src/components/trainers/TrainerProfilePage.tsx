import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrainerContactButtons } from "@/components/trainers/TrainerContactButtons";
import { TrainerHeroGallery } from "@/components/trainers/TrainerHeroGallery";
import { TrainerQuickStats } from "@/components/trainers/TrainerQuickStats";
import { TrainerCertificationsSection } from "@/components/trainers/TrainerCertificationsSection";
import { TrainerAchievementsSection } from "@/components/trainers/TrainerAchievementsSection";
import { TrainerReviewsSection } from "@/components/trainers/TrainerReviewsSection";
import { Badge } from "@/components/ui/Badge";
import { getTrainerBySlug } from "@/services/trainer/trainer.service";
import { specializationLabel } from "@/lib/trainer-constants";
import {
  parseAchievements,
  parseCertifications,
} from "@/lib/staff-members";
import {
  formatAvailabilitySlot,
  parseTrainerAvailability,
} from "@/lib/trainer-availability";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackTrainerProfileView } from "@/components/trainers/TrackTrainerProfileView";
import { SITE_NAME } from "@/lib/constants";
import { getTrainersBasePath } from "@/lib/trainers-routes";
import {
  MapPin,
  BadgeCheck,
  Sparkles,
  Clock,
  ChevronRight,
  ExternalLink,
  Calendar,
} from "lucide-react";

interface TrainerProfilePageProps {
  slug: string;
}

export async function TrainerProfilePage({ slug }: TrainerProfilePageProps) {
  const trainer = await getTrainerBySlug(slug);
  if (!trainer || !trainer.isPublished) notFound();

  const certifications = parseCertifications(trainer.certifications);
  const achievements = parseAchievements(trainer.achievements);
  const availabilitySlots = parseTrainerAvailability(trainer.availability);
  const legacyAvailability =
    availabilitySlots.length === 0 && trainer.availability?.trim()
      ? trainer.availability
      : null;

  const avgRating =
    trainer.reviews.length > 0
      ? trainer.reviews.reduce((sum, r) => sum + r.rating, 0) / trainer.reviews.length
      : trainer.rating;

  const cityTrainerPath = getTrainersBasePath({ city: trainer.city });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const profileUrl = `${baseUrl}/trainer/${trainer.slug}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: trainer.fullName,
    url: profileUrl,
    image: trainer.profileImage ?? undefined,
    jobTitle: specializationLabel(trainer.specialization),
    address: {
      "@type": "PostalAddress",
      addressLocality: trainer.city,
      addressRegion: trainer.area ?? undefined,
    },
    aggregateRating:
      avgRating != null
        ? {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: trainer.reviews.length || trainer.totalReviews,
          }
        : undefined,
  };

  return (
    <>
      <JsonLd data={personSchema} />
      <TrackTrainerProfileView trainerId={trainer.id} />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        {/* Breadcrumb */}
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--text)] transition-colors">
                {SITE_NAME}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/trainers" className="hover:text-[var(--text)] transition-colors">
                Trainers
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={cityTrainerPath} className="hover:text-[var(--text)] transition-colors">
                {trainer.city}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[var(--text)] font-medium truncate">{trainer.fullName}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Main content ── */}
            <div className="order-1 lg:order-2 lg:col-span-2 space-y-6 min-w-0">
              {/* Mobile: profile photo above title */}
              <TrainerHeroGallery
                variant="sidebar"
                imageUrl={trainer.profileImage}
                name={trainer.fullName}
                className="lg:hidden rounded-2xl border border-[var(--border)]"
                priority
              />

              {/* Title card */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="default" className="inline-flex items-center gap-1.5">
                    {specializationLabel(trainer.specialization)}
                  </Badge>
                  {trainer.isVerified && (
                    <Badge variant="accent" className="inline-flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {trainer.isFeatured && (
                    <Badge variant="default" className="inline-flex items-center gap-1 bg-[#FF6A3D] border-[#FF6A3D]">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">
                  {trainer.fullName}
                </h1>
                {trainer.headline && (
                  <p className="text-[var(--text-muted)] mt-2 text-base sm:text-lg leading-relaxed">
                    {trainer.headline}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-3 text-sm text-[var(--text-muted)]">
                  <MapPin className="w-4 h-4 shrink-0 text-[#FF6A3D]" />
                  <span>
                    {trainer.area ? `${trainer.area}, ` : ""}
                    {trainer.city}
                  </span>
                </div>
              </div>

              {/* Stats strip — fills row evenly, no orphan empty cells */}
              <TrainerQuickStats
                experienceYears={trainer.experienceYears}
                hourlyRate={trainer.hourlyRate}
                rating={trainer.rating}
                totalReviews={trainer.totalReviews}
                specialization={trainer.specialization}
              />

              {trainer.bio && (
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 min-w-0">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3">About</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line break-words">
                    {trainer.bio}
                  </p>
                </section>
              )}

              {(availabilitySlots.length > 0 || legacyAvailability) && (
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[#FF6A3D]" />
                    <h2 className="font-heading font-bold text-lg text-[var(--text)]">
                      Availability
                    </h2>
                  </div>
                  {availabilitySlots.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availabilitySlots.map((slot) => (
                        <li
                          key={slot.id}
                          className="flex items-center gap-3 text-sm text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3"
                        >
                          <Clock className="w-4 h-4 text-[#FF6A3D] shrink-0" />
                          <span>{formatAvailabilitySlot(slot)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] whitespace-pre-line leading-relaxed">
                      {legacyAvailability}
                    </p>
                  )}
                </section>
              )}

              <TrainerCertificationsSection certifications={certifications} />
              <TrainerAchievementsSection achievements={achievements} />

              <TrainerReviewsSection
                trainerId={trainer.id}
                reviews={trainer.reviews}
                avgRating={avgRating}
              />

              {/* Mobile contact CTA */}
              {trainer.whatsappNumber && (
                <div className="lg:hidden bg-[#0B2545] rounded-2xl p-6 text-white">
                  <h2 className="font-heading font-bold text-lg mb-2">Ready to train?</h2>
                  <p className="text-white/80 text-sm mb-4">
                    Contact {trainer.fullName} to discuss goals, schedule, and pricing.
                  </p>
                  <TrainerContactButtons
                    trainerId={trainer.id}
                    trainerName={trainer.fullName}
                    whatsappNumber={trainer.whatsappNumber}
                    email={trainer.email}
                    size="lg"
                  />
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="order-2 lg:order-1 space-y-5 lg:sticky lg:top-24 lg:self-start">
              {/* Desktop: photo + book session card */}
              <div className="hidden lg:block bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <TrainerHeroGallery
                  variant="sidebar"
                  imageUrl={trainer.profileImage}
                  name={trainer.fullName}
                  priority
                />
                {trainer.whatsappNumber && (
                  <div className="p-5 border-t border-[var(--border)]">
                    <h3 className="font-heading font-bold text-[var(--text)] mb-1">
                      Book a session
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm mb-4 leading-relaxed">
                      Reach out directly to discuss training packages, schedule, and pricing.
                    </p>
                    <TrainerContactButtons
                      trainerId={trainer.id}
                      trainerName={trainer.fullName}
                      whatsappNumber={trainer.whatsappNumber}
                      email={trainer.email}
                      size="lg"
                    />
                  </div>
                )}
              </div>

              {/* Mobile: book session (photo is above title in main column) */}
              {trainer.whatsappNumber && (
                <div className="lg:hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                  <h3 className="font-heading font-bold text-[var(--text)] mb-1">
                    Book a session
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-4 leading-relaxed">
                    Reach out directly to discuss training packages, schedule, and pricing.
                  </p>
                  <TrainerContactButtons
                    trainerId={trainer.id}
                    trainerName={trainer.fullName}
                    whatsappNumber={trainer.whatsappNumber}
                    email={trainer.email}
                    size="lg"
                  />
                </div>
              )}

              {trainer.gym && trainer.gym.listingStatus === "approved" && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                  <h3 className="font-heading font-semibold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
                    Gym Affiliation
                  </h3>
                  <Link
                    href={`/gyms/${trainer.gym.slug}`}
                    className="flex items-start justify-between gap-3 group rounded-xl p-3 -m-3 hover:bg-[var(--bg)] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors truncate">
                        {trainer.gym.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        {trainer.gym.area}, {trainer.gym.city}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#FF6A3D] shrink-0 mt-1" />
                  </Link>
                </div>
              )}

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-4">
                  Quick Info
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">City</dt>
                    <dd className="font-medium text-[var(--text)] text-right">{trainer.city}</dd>
                  </div>
                  {trainer.area && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--text-muted)]">Area</dt>
                      <dd className="font-medium text-[var(--text)] text-right">{trainer.area}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">Specialization</dt>
                    <dd className="font-medium text-[var(--text)] text-right">
                      {specializationLabel(trainer.specialization)}
                    </dd>
                  </div>
                  {trainer.experienceYears != null && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--text-muted)]">Experience</dt>
                      <dd className="font-medium text-[var(--text)] text-right">
                        {trainer.experienceYears}+ years
                      </dd>
                    </div>
                  )}
                  {trainer.gender && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--text-muted)]">Gender</dt>
                      <dd className="font-medium text-[var(--text)] text-right capitalize">
                        {trainer.gender}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <Link
                href={cityTrainerPath}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-[var(--navy)] border border-[var(--border)] rounded-xl bg-[var(--card)] hover:border-[#FF6A3D]/40 hover:bg-[var(--bg)] transition-colors"
              >
                More trainers in {trainer.city}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

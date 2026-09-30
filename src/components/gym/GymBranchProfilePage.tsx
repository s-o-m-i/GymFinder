import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TaleOfTheTape } from "@/components/gym/TaleOfTheTape";
import { WhatsAppButton } from "@/components/gym/WhatsAppButton";
import { CallGymButton } from "@/components/gym/CallGymButton";
import { TrackProfileView } from "@/components/gym/TrackProfileView";
import { analyticsRedirectUrl } from "@/lib/analytics-urls";
import { ImageGallery } from "@/components/gym/ImageGallery";
import { Badge } from "@/components/ui/Badge";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { LadiesStatusBadge } from "@/components/ui/LadiesStatusBadge";
import { ReviewForm } from "@/components/gym/ReviewForm";
import { MembershipPlansSection } from "@/components/gym/MembershipPlansSection";
import { MeetOurTeamSectionLazy } from "@/components/gym/MeetOurTeamSectionLazy";
import { FaqAccordionSection } from "@/components/faq/FaqAccordionSection";
import { GymEquipmentSection } from "@/components/gym/GymEquipmentSection";
import { GymMobileStickyBar } from "@/components/gym/GymMobileStickyBar";
import { getGymEvents } from "@/services/events/event.service";
import { prisma } from "@/lib/prisma";
import { gymTypeLabel, formatPrice } from "@/lib/utils";
import { isGymActivelyFeatured } from "@/lib/featured-gym";
import { SITE_NAME } from "@/lib/constants";
import { getGymGalleryImages } from "@/lib/images";
import { GYM_LEVEL_IMAGE_WHERE } from "@/lib/gym-images";
import {
  inheritList,
  inheritValue,
  isReservedBranchSlug,
  publicBranchDisplayName,
} from "@/lib/gym-branch-rules";
import { isListingSlug } from "@/lib/gyms-routes";
import {
  MapPin,
  ExternalLink,
  Clock,
  ChevronRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { GymEventsSection } from "../events/GymEventsSection";
import { GymAboutText } from "./GymAboutText";
import { GymStatsStrip } from "@/components/gym/GymStatsStrip";
import { buildGymProfileStats } from "@/lib/gym-stats";
import { SuccessStoriesProfileSection } from "@/components/success-stories/SuccessStoriesProfileSection";
import { getStoriesForGymProfile } from "@/services/success-story/success-story.service";
import { TransformationGallerySection } from "@/components/transformation/TransformationGallerySection";
import { GymLocationsSection } from "@/components/gym/GymLocationsSection";

interface GymBranchProfilePageProps {
  listingSlug: string;
}

export async function GymBranchProfilePage({
  listingSlug,
}: GymBranchProfilePageProps) {
  if (isListingSlug(listingSlug) || isReservedBranchSlug(listingSlug)) {
    notFound();
  }

  const branchRecord = await prisma.gymBranch.findFirst({
    where: { listingSlug, status: "ACTIVE" },
    select: { gymId: true, slug: true },
  });
  if (!branchRecord) notFound();

  const gym = await prisma.gym.findUnique({
    where: { id: branchRecord.gymId },
    include: {
      galleryImages: { where: GYM_LEVEL_IMAGE_WHERE },
      disciplines: { include: { discipline: true } },
      amenities: { include: { amenity: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      membershipPlans: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      staffMembers: {
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
      faqs: {
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
      branches: {
        where: { status: "ACTIVE" },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!gym || gym.listingStatus !== "approved") notFound();

  const branch = await prisma.gymBranch.findFirst({
    where: {
      gymId: gym.id,
      listingSlug,
      status: "ACTIVE",
    },
    include: {
      galleryImages: true,
      disciplines: { include: { discipline: true } },
      amenities: { include: { amenity: true } },
    },
  });

  if (!branch) notFound();

  const { upcoming: upcomingEvents, past: pastEvents } = await getGymEvents(gym.id);
  const successStories = await getStoriesForGymProfile(gym.id);

  const displayName = publicBranchDisplayName(gym.name, branch.name);
  const description = inheritValue(false, branch.description, gym.description);
  const openingHours = inheritValue(
    branch.useCommonHours,
    branch.openingHours,
    gym.openingHours
  );
  const ladiesHours = inheritValue(
    branch.useCommonHours,
    branch.ladiesHours,
    gym.ladiesHours
  );
  const priceMin = inheritValue(false, branch.priceMin, gym.priceMin, (value) => value == null);
  const priceMax = inheritValue(false, branch.priceMax, gym.priceMax, (value) => value == null);
  const ladiesStatus = inheritValue(
    false,
    branch.ladiesStatus,
    gym.ladiesStatus,
    (value) => value == null
  );
  const sizeCategory = inheritValue(
    false,
    branch.sizeCategory,
    gym.sizeCategory,
    (value) => value == null
  );
  const establishedYear = inheritValue(
    false,
    branch.establishedYear,
    gym.establishedYear,
    (value) => value == null
  );
  const memberCount = inheritValue(
    false,
    branch.memberCount,
    gym.memberCount,
    (value) => value == null
  );
  const equipment = inheritValue(false, branch.equipment, gym.equipment);
  const transformations = inheritValue(
    false,
    branch.transformations,
    gym.transformations
  );
  const coverImage = inheritValue(false, branch.coverImage, gym.coverImage);
  const galleryImages = getGymGalleryImages({
    coverImage,
    galleryImages: inheritList(false, branch.galleryImages, gym.galleryImages),
  });
  const disciplineNames = inheritList(
    branch.useCommonDisciplines,
    branch.disciplines.map((item) => item.discipline.name),
    gym.disciplines.map((item) => item.discipline.name)
  );
  const amenityNames = inheritList(
    branch.useCommonAmenities,
    branch.amenities.map((item) => item.amenity.name),
    gym.amenities.map((item) => item.amenity.name)
  );

  const avgRating =
    gym.reviews.length > 0
      ? gym.reviews.reduce((sum, r) => sum + r.rating, 0) / gym.reviews.length
      : gym.rating;

  const coachCount = gym.staffMembers.filter((m) => m.isCoach).length;
  const trainerCount = coachCount > 0 ? coachCount : gym.staffMembers.length;
  const gymStats = buildGymProfileStats({
    createdAt: gym.createdAt,
    establishedYear,
    memberCount,
    equipmentRaw: equipment,
    staffCount: trainerCount,
    rating: avgRating,
  });

  const whatsapp = inheritValue(false, branch.whatsappNumber, gym.whatsappNumber);
  const directionsUrl = analyticsRedirectUrl(gym.id, "DIRECTIONS_CLICK");
  const siblingBranches = gym.branches;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: displayName,
    parentOrganization: gym.name,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.area,
      addressRegion: branch.city,
      addressCountry: "PK",
    },
    ...(branch.latitude &&
      branch.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: branch.latitude,
          longitude: branch.longitude,
        },
      }),
    ...(openingHours && { openingHours }),
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: gym.reviews.length || 1,
      },
    }),
    telephone: whatsapp,
    image: galleryImages.map((image) => image.imageUrl),
    priceRange: `PKR ${priceMin}–${priceMax}/month`,
  };

  return (
    <>
      <TrackProfileView gymId={gym.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] pb-24 lg:pb-0">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--text)] transition-colors">
                {SITE_NAME}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/gyms" className="hover:text-[var(--text)] transition-colors">
                Gyms
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/gyms/${gym.slug}`}
                className="hover:text-[var(--text)] transition-colors"
              >
                {gym.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[var(--text)] font-medium">{displayName}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 min-w-0">
              <ImageGallery images={galleryImages} gymName={displayName} />

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="inline-flex items-center gap-1.5">
                        <GymTypeIcon type={gym.type} className="w-3.5 h-3.5" />
                        {gymTypeLabel(gym.type, gym.customTypeLabel)}
                      </Badge>
                      {isGymActivelyFeatured(gym) && (
                        <Badge variant="accent" className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">
                      {displayName}
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      A branch of{" "}
                      <Link href={`/gyms/${gym.slug}`} className="text-[#FF6A3D] font-semibold">
                        {gym.name}
                      </Link>
                    </p>
                    <div className="flex items-start gap-1.5 mt-3 text-[var(--text-muted)] text-sm">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {branch.address}, {branch.area}, {branch.city}
                      </span>
                    </div>
                  </div>
                  {openingHours && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg)] px-3 py-2 rounded-xl border border-[var(--border)]">
                      <Clock className="w-4 h-4" />
                      {openingHours}
                    </div>
                  )}
                  {ladiesHours && ladiesStatus === "ladies_timings" && (
                    <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200">
                      <Clock className="w-4 h-4" />
                      Ladies-only hours: {ladiesHours}
                    </div>
                  )}
                </div>
              </div>

              <GymStatsStrip stats={gymStats} />

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 min-w-0 overflow-hidden">
                <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3">About</h2>
                <GymAboutText text={description} />
              </div>

              <GymLocationsSection
                gymName={gym.name}
                gymSlug={gym.slug}
                currentBranchSlug={branch.slug}
                branches={siblingBranches.map((item) => ({
                  name: publicBranchDisplayName(gym.name, item.name),
                  slug: item.slug,
                  listingSlug: item.listingSlug,
                  address: item.address,
                  area: item.area,
                  city: item.city,
                  openingHours: inheritValue(
                    item.useCommonHours,
                    item.openingHours,
                    gym.openingHours
                  ),
                }))}
              />

              {disciplineNames.length > 0 && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                    Disciplines Offered
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {disciplineNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FF6A3D]" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {amenityNames.length > 0 && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                    Facilities & Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {amenityNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A3D] shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <GymEquipmentSection equipmentRaw={equipment} />
              <TransformationGallerySection transformationsRaw={transformations} />
              <SuccessStoriesProfileSection
                stories={successStories}
                description="Verified transformations linked to this gym — published by gyms, trainers, and community members."
              />
              <MeetOurTeamSectionLazy members={gym.staffMembers} />
              <GymEventsSection
                upcoming={upcomingEvents}
                past={pastEvents}
                gymName={gym.name}
              />
              {gym.faqsEnabled && gym.faqs.length > 0 && (
                <FaqAccordionSection faqs={gym.faqs} />
              )}
              {gym.membershipPlans.length > 0 && (
                <div className="lg:hidden">
                  <MembershipPlansSection plans={gym.membershipPlans} gymName={displayName} />
                </div>
              )}

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                  Reviews
                  {avgRating && (
                    <span className="ml-3 font-mono-nums text-base text-[#FF6A3D]">
                      {avgRating.toFixed(1)} ★
                    </span>
                  )}
                </h2>
                <ReviewForm gymId={gym.id} />
                {gym.reviews.length > 0 ? (
                  <div className="space-y-4 mt-6 pt-6 border-t border-[var(--border)]">
                    {gym.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-[var(--border)]"
                                }`}
                              />
                            ))}
                          </div>
                          {review.author && (
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                              {review.author}
                            </span>
                          )}
                        </div>
                        {review.text && (
                          <p className="text-sm text-[var(--text-muted)]">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] mt-6 pt-6 border-t border-[var(--border)]">
                    No reviews yet — be the first to share your experience!
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <TaleOfTheTape
                priceMin={priceMin}
                priceMax={priceMax}
                openingHours={openingHours}
                ladiesHours={ladiesHours}
                disciplines={disciplineNames}
                sizeCategory={sizeCategory}
                ladiesStatus={ladiesStatus}
                rating={avgRating ?? undefined}
              />
              <MembershipPlansSection
                plans={gym.membershipPlans}
                gymName={displayName}
                className="hidden lg:block"
              />
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-1">
                  Interested in joining?
                </h3>
                <p className="text-[var(--text-muted)] text-sm mb-4">
                  Contact this branch on WhatsApp to ask about membership and availability.
                </p>
                <div className="space-y-2">
                  <WhatsAppButton
                    gymId={gym.id}
                    gymName={displayName}
                    size="lg"
                    fullWidth
                    captureLead
                    label="WhatsApp Branch"
                  />
                  <CallGymButton gymId={gym.id} gymName={displayName} size="lg" fullWidth />
                </div>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6A3D]" />
                  Address
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                  {branch.address}
                  <br />
                  {branch.area}, {branch.city}
                </p>
                <a
                  href={directionsUrl}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-[var(--navy)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">City</span>
                    <span className="font-medium text-[var(--text)]">{branch.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Area</span>
                    <span className="font-medium text-[var(--text)]">{branch.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Type</span>
                    <span className="font-medium text-[var(--text)]">
                      {gymTypeLabel(gym.type, gym.customTypeLabel)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Ladies</span>
                    <LadiesStatusBadge status={ladiesStatus} />
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--text-muted)]">From</span>
                    <span className="font-medium text-[var(--text)] text-right">
                      {formatPrice(priceMin, priceMax)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <GymMobileStickyBar gymId={gym.id} gymName={displayName} />
      <div className="pb-24 lg:pb-0">
        <Footer />
      </div>
    </>
  );
}

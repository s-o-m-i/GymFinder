export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ExploreCenterSection } from "@/components/home/ExploreCenterSection";
import { AnimatedNetworkSection } from "@/components/home/AnimatedNetworkSection";
import { MapPreviewSection } from "@/components/home/MapPreviewSection";
import { TrendingListingsSection } from "@/components/home/TrendingListingsSection";
import { EventsPreviewSection } from "@/components/home/EventsPreviewSection";
import { HomeSuccessStoriesSection } from "@/components/home/success-stories/HomeSuccessStoriesSection";
import { BlogPreviewSection } from "@/components/home/BlogPreviewSection";
import { HomePreFooterSection } from "@/components/home/HomePreFooterSection";
import { HomeMotionProvider } from "@/components/home/motion/HomeMotionProvider";
import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";
import {
  MOCK_HOME_EVENTS,
  MOCK_HOME_LISTINGS,
  type HomeEventPreview,
  type HomeListingItem,
} from "@/lib/home-data";
import { getGymCoverUrl } from "@/lib/images";
import { eventTypeLabel } from "@/lib/event-constants";
import { eventCardSelect } from "@/services/events/event.service";
import { checkExpiredFeaturedGyms } from "@/services/featured/featured-gym.service";
import { getPosts, WordPressUnavailableError } from "@/services/wordpress.service";
import type { BlogPostSummary } from "@/types/wordpress";

async function getHeroStats() {
  try {
    const approved = { listingStatus: "approved" as const };

    const [gyms, trainers, clubs, users, gymCities, trainerCities] = await Promise.all([
      prisma.gym.count({ where: approved }),
      prisma.trainer.count({ where: { isPublished: true } }),
      prisma.gym.count({
        where: {
          ...approved,
          type: { in: ["boxing", "mma", "muay_thai", "kickboxing", "martial_arts"] },
        },
      }),
      prisma.communityUser.count(),
      prisma.gym.groupBy({ by: ["city"], where: approved }),
      prisma.trainer.groupBy({ by: ["city"], where: { isPublished: true } }),
    ]);

    const citySet = new Set([
      ...gymCities.map((r) => r.city),
      ...trainerCities.map((r) => r.city),
    ]);

    return {
      gyms,
      trainers,
      clubs,
      users,
      cities: Math.max(citySet.size, CITIES.length),
    };
  } catch {
    return { gyms: 50, trainers: 25, clubs: 20, users: 120, cities: CITIES.length };
  }
}

function toHomeGymListing(gym: {
  id: string;
  name: string;
  slug: string;
  city: string;
  rating: number | null;
  coverImage: string | null;
  galleryImages: { imageUrl: string }[];
}): HomeListingItem {
  return {
    id: gym.id,
    name: gym.name,
    city: gym.city,
    image: getGymCoverUrl(gym) ?? null,
    type: "gym",
    slug: gym.slug,
    rating: gym.rating,
  };
}

async function getFeaturedGymListings(): Promise<HomeListingItem[]> {
  try {
    await checkExpiredFeaturedGyms();
    const now = new Date();
    const gyms = await prisma.gym.findMany({
      where: {
        featured: true,
        listingStatus: "approved",
        OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        rating: true,
        coverImage: true,
        galleryImages: { select: { imageUrl: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    if (gyms.length === 0) {
      return MOCK_HOME_LISTINGS.filter((item) => item.type === "gym");
    }

    return gyms.map(toHomeGymListing);
  } catch {
    return MOCK_HOME_LISTINGS.filter((item) => item.type === "gym");
  }
}

async function getFeaturedTrainerListings(): Promise<HomeListingItem[]> {
  try {
    const trainers = await prisma.trainer.findMany({
      where: { isPublished: true, isFeatured: true },
      select: {
        id: true,
        fullName: true,
        slug: true,
        city: true,
        rating: true,
        profileImage: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    if (trainers.length === 0) {
      const fallback = await prisma.trainer.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          fullName: true,
          slug: true,
          city: true,
          rating: true,
          profileImage: true,
        },
        orderBy: [{ isFeatured: "desc" }, { rating: { sort: "desc", nulls: "last" } }],
        take: 6,
      });

      if (fallback.length === 0) {
        return MOCK_HOME_LISTINGS.filter((item) => item.type === "trainer");
      }

      return fallback.map((trainer) => ({
        id: trainer.id,
        name: trainer.fullName,
        city: trainer.city,
        image: trainer.profileImage,
        type: "trainer" as const,
        slug: trainer.slug,
        rating: trainer.rating,
      }));
    }

    return trainers.map((trainer) => ({
      id: trainer.id,
      name: trainer.fullName,
      city: trainer.city,
      image: trainer.profileImage,
      type: "trainer" as const,
      slug: trainer.slug,
      rating: trainer.rating,
    }));
  } catch {
    return MOCK_HOME_LISTINGS.filter((item) => item.type === "trainer");
  }
}

async function getUpcomingEventPreviews(): Promise<HomeEventPreview[]> {
  try {
    const events = await prisma.event.findMany({
      where: { startDate: { gt: new Date() } },
      select: eventCardSelect,
      orderBy: [{ isFeatured: "desc" }, { startDate: "asc" }],
      take: 4,
    });

    if (events.length === 0) return MOCK_HOME_EVENTS;

    return events.map((event) => ({
      id: event.id,
      name: event.title,
      city: event.city,
      date: new Date(event.startDate).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      type: eventTypeLabel(event.type),
      slug: event.slug,
      featured: event.isFeatured,
      image: event.image,
    }));
  } catch {
    return MOCK_HOME_EVENTS;
  }
}

async function getLatestBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const result = await getPosts({ page: 1, perPage: 4 });
    return result.posts;
  } catch (error) {
    if (error instanceof WordPressUnavailableError) return [];
    throw error;
  }
}

export default async function HomePage() {
  const [stats, featuredGyms, featuredTrainers, upcomingEvents, latestBlogPosts] =
    await Promise.all([
    getHeroStats(),
    getFeaturedGymListings(),
    getFeaturedTrainerListings(),
    getUpcomingEventPreviews(),
    getLatestBlogPosts(),
  ]);

  return (
    <HomeMotionProvider>
      <div data-home-motion>
        <Navbar variant="hero" />
        <main>
          <HeroSection stats={stats} />
          <HomeSuccessStoriesSection />

          <ExploreCenterSection />
          <AnimatedNetworkSection />
          <TrendingListingsSection gyms={featuredGyms} trainers={featuredTrainers} />
          <MapPreviewSection />
          <EventsPreviewSection events={upcomingEvents} />
          <BlogPreviewSection posts={latestBlogPosts} />
          <HomePreFooterSection stats={stats} />
        </main>
        <Footer />
      </div>
    </HomeMotionProvider>
  );
}

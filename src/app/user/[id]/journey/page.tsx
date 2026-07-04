import { notFound } from "next/navigation";
import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SuccessStoryCardTile } from "@/components/success-stories/SuccessStoryCard";
import { prisma } from "@/lib/prisma";
import { getStoriesForUserJourney } from "@/services/success-story/success-story.service";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const user = await prisma.communityUser.findUnique({
    where: { id },
    select: { fullName: true },
  });
  if (!user) return { title: "Journey Not Found" };
  return {
    title: `${user.fullName}'s Fitness Journey | ${SITE_NAME}`,
    description: `Success stories and fitness transformations published by ${user.fullName} on ${SITE_NAME}.`,
  };
}

export default async function UserJourneyPage({ params }: PageProps) {
  const { id } = await params;
  const user = await prisma.communityUser.findUnique({
    where: { id },
    select: { id: true, fullName: true },
  });
  if (!user) notFound();

  const stories = await getStoriesForUserJourney(user.id);

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Community journey
            </p>
            <h1 className="font-heading text-3xl font-bold text-[var(--text)] sm:text-4xl">
              {user.fullName}&apos;s Fitness Journey
            </h1>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {stories.length} published {stories.length === 1 ? "story" : "stories"}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {stories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--text-muted)]">
              No published stories yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {stories.map((story, index) => (
                <SuccessStoryCardTile key={story.id} story={story} priority={index < 3} />
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            <Link href="/success-stories" className="font-semibold text-[#FF6A3D] hover:underline">
              Browse all success stories
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

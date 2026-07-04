export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { SuccessStoriesDashboard } from "@/components/success-stories/SuccessStoriesDashboard";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import {
  getPublisherStoryStats,
  listPublisherStories,
} from "@/services/success-story/success-story.service";

export default async function OwnerSuccessStoriesPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true },
  });
  if (!gym) redirect("/owner/dashboard");

  const publisher = { type: "GYM" as const, gymId: gym.id };
  const [stats, { items }] = await Promise.all([
    getPublisherStoryStats(publisher),
    listPublisherStories(publisher),
  ]);

  return (
    <div className="p-6 sm:p-8">
      <SuccessStoriesDashboard
        stats={stats}
        stories={items}
        createPath="/owner/success-stories/new"
        editPathPrefix="/owner/success-stories"
      />
    </div>
  );
}

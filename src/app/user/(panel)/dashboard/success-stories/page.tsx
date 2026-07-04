export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { SuccessStoriesDashboard } from "@/components/success-stories/SuccessStoriesDashboard";
import { getCommunitySession } from "@/lib/community-auth";
import {
  getPublisherStoryStats,
  listPublisherStories,
} from "@/services/success-story/success-story.service";

export default async function UserSuccessStoriesPage() {
  const session = await getCommunitySession();
  if (!session) redirect("/user/login");

  const publisher = { type: "USER" as const, userId: session.userId };
  const [stats, { items }] = await Promise.all([
    getPublisherStoryStats(publisher),
    listPublisherStories(publisher),
  ]);

  return (
    <div className="p-6 sm:p-8">
      <SuccessStoriesDashboard
        stats={stats}
        stories={items}
        createPath="/user/dashboard/success-stories/new"
        editPathPrefix="/user/dashboard/success-stories"
      />
    </div>
  );
}

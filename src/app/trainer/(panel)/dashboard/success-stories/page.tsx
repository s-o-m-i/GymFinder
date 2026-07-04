export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { SuccessStoriesDashboard } from "@/components/success-stories/SuccessStoriesDashboard";
import { getTrainerSession } from "@/lib/trainer-auth";
import {
  getPublisherStoryStats,
  listPublisherStories,
} from "@/services/success-story/success-story.service";

export default async function TrainerSuccessStoriesPage() {
  const session = await getTrainerSession();
  if (!session?.trainerId) redirect("/trainer/login");

  const publisher = { type: "TRAINER" as const, trainerId: session.trainerId };
  const [stats, { items }] = await Promise.all([
    getPublisherStoryStats(publisher),
    listPublisherStories(publisher),
  ]);

  return (
    <div className="p-6 sm:p-8">
      <SuccessStoriesDashboard
        stats={stats}
        stories={items}
        createPath="/trainer/dashboard/success-stories/new"
        editPathPrefix="/trainer/dashboard/success-stories"
      />
    </div>
  );
}

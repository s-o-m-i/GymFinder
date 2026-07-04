export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { SuccessStoryWizard } from "@/components/success-stories/SuccessStoryWizard";
import type { EntitySearchItem } from "@/components/success-stories/EntitySearchSelect";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import {
  mapStoryToFormValues,
  successStoryDetailSelect,
} from "@/services/success-story/success-story.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerEditSuccessStoryPage({ params }: PageProps) {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true },
  });
  if (!gym) redirect("/owner/dashboard");

  const { id } = await params;
  const story = await prisma.successStory.findUnique({
    where: { id },
    select: successStoryDetailSelect,
  });
  if (!story || story.publisherGymId !== gym.id) notFound();

  const initialLinkedGym: EntitySearchItem | null = story.linkedGym
    ? {
        id: story.linkedGym.id,
        label: story.linkedGym.name,
        sublabel: story.linkedGym.city,
      }
    : null;
  const initialLinkedTrainer: EntitySearchItem | null = story.linkedTrainer
    ? {
        id: story.linkedTrainer.id,
        label: story.linkedTrainer.fullName,
        sublabel: story.linkedTrainer.specialization ?? undefined,
        imageUrl: story.linkedTrainer.profileImage,
      }
    : null;

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="font-heading mb-6 text-2xl font-bold text-[var(--text)]">Edit success story</h1>
      <SuccessStoryWizard
        storyId={story.id}
        initialValues={mapStoryToFormValues(story)}
        initialLinkedGym={initialLinkedGym}
        initialLinkedTrainer={initialLinkedTrainer}
        dashboardPath="/owner/success-stories"
      />
    </div>
  );
}

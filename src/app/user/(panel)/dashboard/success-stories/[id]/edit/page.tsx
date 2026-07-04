export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { SuccessStoryWizard } from "@/components/success-stories/SuccessStoryWizard";
import type { EntitySearchItem } from "@/components/success-stories/EntitySearchSelect";
import { getCommunitySession } from "@/lib/community-auth";
import { prisma } from "@/lib/prisma";
import {
  mapStoryToFormValues,
  successStoryDetailSelect,
} from "@/services/success-story/success-story.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditSuccessStoryPage({ params }: PageProps) {
  const session = await getCommunitySession();
  if (!session) redirect("/user/login");

  const { id } = await params;
  const story = await prisma.successStory.findUnique({
    where: { id },
    select: successStoryDetailSelect,
  });
  if (!story || story.publisherUserId !== session.userId) notFound();

  const initialLinkedGym: EntitySearchItem | null = story.linkedGym
    ? { id: story.linkedGym.id, label: story.linkedGym.name, sublabel: story.linkedGym.city }
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
        dashboardPath="/user/dashboard/success-stories"
      />
    </div>
  );
}

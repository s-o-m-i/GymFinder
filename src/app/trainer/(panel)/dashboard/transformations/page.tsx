export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Images, PlusCircle } from "lucide-react";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { parseTransformations } from "@/lib/transformations";
import { TransformationsManager } from "@/components/transformation/TransformationsManager";
import { updateTrainerTransformations } from "@/app/actions/trainer/transformations";

async function getTrainerTransformationsData(accountId: string) {
  return prisma.trainerAccount.findUnique({
    where: { id: accountId },
    select: {
      trainer: {
        select: {
          id: true,
          fullName: true,
          transformations: true,
        },
      },
    },
  });
}

export default async function TrainerTransformationsPage() {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/login");

  const account = await getTrainerTransformationsData(session.accountId);
  if (!account) redirect("/trainer/login");

  const trainer = account.trainer;
  const transformationItems = trainer
    ? parseTransformations(trainer.transformations)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full min-w-0">
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Images className="w-6 h-6 text-[#FF6A3D] shrink-0" />
          <h1 className="font-heading font-bold text-xl lg:text-2xl text-[var(--text)]">
            Transformation Gallery
          </h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Showcase client results on your public profile — before, after, and their story.
        </p>
      </div>

      {!trainer ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 text-center">
          <div className="w-14 h-14 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-7 h-7 text-[#FF6A3D]" />
          </div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Create your profile first
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            Set up your trainer profile before adding transformation stories.
          </p>
          <Link
            href="/trainer/dashboard/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Profile
          </Link>
        </div>
      ) : (
        <TransformationsManager
          entityName={trainer.fullName}
          initialItems={transformationItems}
          saveAction={updateTrainerTransformations}
        />
      )}
    </div>
  );
}

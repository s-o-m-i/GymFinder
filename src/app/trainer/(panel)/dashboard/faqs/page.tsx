export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { HelpCircle, PlusCircle } from "lucide-react";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { FaqsManager } from "@/components/faq/FaqsManager";
import {
  createTrainerFaq,
  deleteTrainerFaq,
  reorderTrainerFaqs,
  updateTrainerFaq,
  updateTrainerFaqsEnabled,
} from "@/app/actions/trainer/faqs";

async function getTrainerFaqData(accountId: string) {
  return prisma.trainerAccount.findUnique({
    where: { id: accountId },
    select: {
      trainer: {
        select: {
          id: true,
          fullName: true,
          faqsEnabled: true,
          faqs: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });
}

export default async function TrainerFaqsPage() {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/login");

  const account = await getTrainerFaqData(session.accountId);
  if (!account) redirect("/trainer/login");

  const trainer = account.trainer;

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">FAQs</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Add questions and answers that appear on your public trainer profile.
        </p>
      </div>

      {!trainer ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-7 h-7 text-[#FF6A3D]" />
          </div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Create your profile first
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            Set up your trainer profile before adding FAQs.
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
        <FaqsManager
          subjectName={trainer.fullName}
          faqsEnabled={trainer.faqsEnabled}
          initialFaqs={trainer.faqs}
          onUpdateEnabled={updateTrainerFaqsEnabled}
          onCreate={createTrainerFaq}
          onUpdate={updateTrainerFaq}
          onDelete={deleteTrainerFaq}
          onReorder={reorderTrainerFaqs}
        />
      )}
    </div>
  );
}

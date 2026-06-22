export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { HelpCircle, PlusCircle } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { businessCategoryLabel } from "@/lib/owner-constants";
import { FaqsManager } from "@/components/faq/FaqsManager";
import {
  createGymFaq,
  deleteGymFaq,
  reorderGymFaqs,
  updateGymFaq,
  updateGymFaqsEnabled,
} from "@/app/actions/owner/gym-faqs";

async function getOwnerFaqData(ownerId: string) {
  return prisma.gymOwner.findUnique({
    where: { id: ownerId },
    select: {
      businessCategory: true,
      gym: {
        select: {
          id: true,
          name: true,
          faqsEnabled: true,
          faqs: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });
}

export default async function OwnerFaqsPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await getOwnerFaqData(session.ownerId);
  if (!owner) redirect("/owner/login");

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">FAQs</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          {businessCategoryLabel(owner.businessCategory)} · Answer common visitor questions on your public listing.
        </p>
      </div>

      {!owner.gym ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-7 h-7 text-[#FF6A3D]" />
          </div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Add your listing first
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            You need a gym or fighting club listing before you can manage FAQs.
          </p>
          <Link
            href="/owner/gym"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Listing
          </Link>
        </div>
      ) : (
        <FaqsManager
          subjectName={owner.gym.name}
          faqsEnabled={owner.gym.faqsEnabled}
          initialFaqs={owner.gym.faqs}
          onUpdateEnabled={updateGymFaqsEnabled}
          onCreate={createGymFaq}
          onUpdate={updateGymFaq}
          onDelete={deleteGymFaq}
          onReorder={reorderGymFaqs}
        />
      )}
    </div>
  );
}

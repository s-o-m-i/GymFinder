export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { TrainerProfileForm } from "@/components/trainers/TrainerProfileForm";

export default async function TrainerProfileEditPage() {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/login");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: { trainer: true },
  });

  if (!account) redirect("/trainer/login");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full min-w-0">
      <div className="mb-6 lg:mb-8">
        <h1 className="font-heading font-bold text-xl lg:text-2xl text-[var(--text)]">
          {account.trainer ? "Edit Profile" : "Create Profile"}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Your marketplace profile is separate from gym staff listings.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 lg:p-8 min-w-0">
        <TrainerProfileForm trainer={account.trainer} accountEmail={account.email} />
      </div>
    </div>
  );
}

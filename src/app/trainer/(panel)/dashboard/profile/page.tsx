export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { TrainerProfileForm } from "@/components/trainers/TrainerProfileForm";

export default async function TrainerProfileEditPage() {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/auth");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: { trainer: true },
  });

  if (!account) redirect("/trainer/auth");

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
          {account.trainer ? "Edit Profile" : "Create Profile"}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Your marketplace profile is separate from gym staff listings.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <TrainerProfileForm trainer={account.trainer} accountEmail={account.email} />
      </div>
    </div>
  );
}

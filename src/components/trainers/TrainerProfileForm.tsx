"use client";

import type { Trainer } from "@prisma/client";
import { TrainerProfileWizard } from "@/components/trainers/profile-wizard/TrainerProfileWizard";

interface TrainerProfileFormProps {
  trainer: Trainer | null;
  accountEmail: string;
}

/** Multi-step onboarding wizard for trainer profile create/edit. */
export function TrainerProfileForm({ trainer, accountEmail }: TrainerProfileFormProps) {
  return <TrainerProfileWizard trainer={trainer} accountEmail={accountEmail} />;
}

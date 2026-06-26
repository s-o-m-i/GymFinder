import { trainerProfileSchema } from "@/lib/validations/trainer";

/** Per-step schemas derived from the main profile schema — same rules, no duplication. */
export const trainerWizardStep1Schema = trainerProfileSchema.pick({
  fullName: true,
  headline: true,
  city: true,
  area: true,
  specialization: true,
  experienceYears: true,
  gender: true,
});

export const trainerWizardStep2Schema = trainerProfileSchema.pick({
  hourlyRate: true,
  whatsappNumber: true,
  email: true,
});

export const trainerWizardStep3Schema = trainerProfileSchema.pick({
  bio: true,
  achievements: true,
});

export const trainerWizardStep4Schema = trainerProfileSchema.pick({
  certifications: true,
});

export const trainerWizardStep5Schema = trainerProfileSchema.pick({
  availabilitySlots: true,
});

export const TRAINER_WIZARD_STEP_SCHEMAS = [
  trainerWizardStep1Schema,
  trainerWizardStep2Schema,
  trainerWizardStep3Schema,
  trainerWizardStep4Schema,
  trainerWizardStep5Schema,
] as const;

export type TrainerWizardStepIndex = 0 | 1 | 2 | 3 | 4;

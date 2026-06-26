import type { GymLeadGoal } from "@prisma/client";

export const GYM_LEAD_GOALS: { value: GymLeadGoal; label: string }[] = [
  { value: "WEIGHT_LOSS", label: "Weight Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "MMA", label: "MMA" },
  { value: "BOXING", label: "Boxing" },
  { value: "OTHER", label: "Other" },
];

export function gymLeadGoalLabel(goal: GymLeadGoal): string {
  return GYM_LEAD_GOALS.find((g) => g.value === goal)?.label ?? goal;
}

export function resolveLeadGoalLabel(
  goal: GymLeadGoal,
  customGoal?: string | null
): string {
  if (goal === "OTHER" && customGoal?.trim()) {
    return customGoal.trim();
  }
  return gymLeadGoalLabel(goal);
}

export function buildGymLeadWhatsAppMessage(
  gymName: string,
  name: string,
  goalLabel: string
): string {
  return `Hi, I'm ${name}. I'm interested in ${gymName} for ${goalLabel}. I found you on FitnessAdda PK.`;
}

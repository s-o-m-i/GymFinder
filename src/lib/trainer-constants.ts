export const TRAINER_SPECIALIZATIONS = [
  { value: "boxing", label: "Boxing" },
  { value: "mma", label: "MMA" },
  { value: "muay_thai", label: "Muay Thai" },
  { value: "kickboxing", label: "Kickboxing" },
  { value: "martial_arts", label: "Martial Arts" },
  { value: "fitness", label: "Fitness & Strength" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "bodybuilding", label: "Bodybuilding" },
  { value: "crossfit", label: "CrossFit" },
  { value: "yoga", label: "Yoga & Mobility" },
  { value: "nutrition", label: "Nutrition Coaching" },
] as const;

export type TrainerSpecialization = (typeof TRAINER_SPECIALIZATIONS)[number]["value"];

export const TRAINER_EXPERIENCE_LEVELS = [
  { value: "beginner", label: "1–2 years", min: 0, max: 2 },
  { value: "intermediate", label: "3–5 years", min: 3, max: 5 },
  { value: "experienced", label: "6–10 years", min: 6, max: 10 },
  { value: "expert", label: "10+ years", min: 11, max: 99 },
] as const;

export const TRAINER_HOURLY_RATE_RANGE = { min: 0, max: 15000 } as const;

export const TRAINER_RATE_BUCKETS = [
  { value: "under_2000", label: "Under PKR 2,000/hr", min: 0, max: 1999 },
  { value: "2000_5000", label: "PKR 2,000 – 5,000/hr", min: 2000, max: 5000 },
  { value: "5000_10000", label: "PKR 5,000 – 10,000/hr", min: 5001, max: 10000 },
  { value: "over_10000", label: "PKR 10,000+/hr", min: 10001, max: 999999 },
] as const;

export const TRAINER_RATING_FILTERS = [
  { value: "4_5", label: "4.5+ stars", min: 4.5 },
  { value: "4", label: "4+ stars", min: 4 },
  { value: "3_5", label: "3.5+ stars", min: 3.5 },
  { value: "3", label: "3+ stars", min: 3 },
] as const;

export const TRAINER_GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export function specializationLabel(value: string | null | undefined): string {
  if (!value) return "Fitness";
  return TRAINER_SPECIALIZATIONS.find((s) => s.value === value)?.label ?? value;
}

export function formatHourlyRate(rate: number | null | undefined): string {
  if (rate == null) return "Rate on request";
  return `PKR ${rate.toLocaleString()}/hr`;
}

export function buildTrainerWhatsAppMessage(trainerName: string): string {
  return `Hi ${trainerName}, I found your profile on GymFinder PK and would like to inquire about training sessions.`;
}

export function buildTrainerWhatsAppUrl(number: string, trainerName: string): string {
  const cleaned = number.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("92")
    ? cleaned
    : cleaned.startsWith("0")
      ? `92${cleaned.slice(1)}`
      : `92${cleaned}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(buildTrainerWhatsAppMessage(trainerName))}`;
}

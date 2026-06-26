import type { StaffAchievementItem, StaffCertificationItem } from "@/lib/staff-members";
import type { TrainerAvailabilitySlot } from "@/lib/trainer-availability";

export interface TrainerProfileFormValues {
  fullName: string;
  headline: string;
  bio: string;
  city: string;
  area: string;
  specialization: string;
  experienceYears: string;
  hourlyRate: string;
  whatsappNumber: string;
  email: string;
  gender: string;
  gymId: string;
  isPublished: boolean;
  certifications: StaffCertificationItem[];
  achievements: StaffAchievementItem[];
  availabilitySlots: TrainerAvailabilitySlot[];
}

export type TrainerProfileFormField = keyof TrainerProfileFormValues;

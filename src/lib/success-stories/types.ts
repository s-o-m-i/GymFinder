import type {
  SuccessStoryGender,
  SuccessStoryGoal,
  SuccessStoryPublisherType,
  SuccessStoryStatus,
  HeightUnit,
  WeightUnit,
} from "@prisma/client";

export type ProgressImage = {
  id: string;
  imageUrl: string;
  cloudinaryId?: string | null;
  caption?: string | null;
};

export type SuccessStoryPublisherContext = {
  type: SuccessStoryPublisherType;
  gymId?: string;
  trainerId?: string;
  userId?: string;
};

export type SuccessStoryFormInput = {
  title: string;
  clientName: string;
  gender: SuccessStoryGender;
  city: string;
  goal: SuccessStoryGoal;
  duration: string;
  story: string;
  coverImageUrl?: string | null;
  coverCloudinaryId?: string | null;
  beforeImageUrl: string;
  beforeCloudinaryId?: string | null;
  afterImageUrl: string;
  afterCloudinaryId?: string | null;
  progressImages: ProgressImage[];
  startWeight?: number | null;
  currentWeight?: number | null;
  height?: number | null;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  linkedGymId?: string | null;
  linkedTrainerId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
};

export type SuccessStoryListItem = {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  city: string;
  goal: SuccessStoryGoal;
  duration: string;
  status: SuccessStoryStatus;
  isVerified: boolean;
  isFeatured: boolean;
  publisherType: SuccessStoryPublisherType;
  coverImageUrl: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  publishedAt: Date | null;
  createdAt: Date;
  linkedGym?: { id: string; name: string; slug: string } | null;
  linkedTrainer?: { id: string; fullName: string; slug: string } | null;
};

export type SuccessStoryStats = {
  total: number;
  published: number;
  draft: number;
  featured: number;
  verified: number;
};

export const SUCCESS_STORY_GOAL_LABELS: Record<SuccessStoryGoal, string> = {
  WEIGHT_LOSS: "Weight Loss",
  MUSCLE_GAIN: "Muscle Gain",
  STRENGTH: "Strength",
  ENDURANCE: "Endurance",
  BOXING: "Boxing",
  MMA: "MMA",
  GENERAL_FITNESS: "General Fitness",
  OTHER: "Other",
};

export const SUCCESS_STORY_GENDER_LABELS: Record<SuccessStoryGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

/** Gender options shown in the create/edit wizard (excludes prefer-not-to-say). */
export const SUCCESS_STORY_GENDER_FORM_OPTIONS = (
  Object.entries(SUCCESS_STORY_GENDER_LABELS) as [SuccessStoryGender, string][]
).filter(([value]) => value !== "PREFER_NOT_TO_SAY");

export const SUCCESS_STORY_HEIGHT_UNIT_LABELS: Record<HeightUnit, string> = {
  CM: "cm",
  FT: "ft",
  IN: "in",
};

export const SUCCESS_STORY_PUBLISHER_LABELS: Record<SuccessStoryPublisherType, string> = {
  GYM: "Gym Story",
  TRAINER: "Trainer Story",
  USER: "Community Story",
};

export const SUCCESS_STORY_PUBLISHER_EMOJI: Record<SuccessStoryPublisherType, string> = {
  GYM: "🏋",
  TRAINER: "👨‍🏫",
  USER: "👤",
};

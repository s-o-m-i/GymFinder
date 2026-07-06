import type { SuccessStoryGender, SuccessStoryGoal } from "@prisma/client";
import type { HomeSuccessStory } from "@/services/success-story/success-story.service";
import { calculateWeightLost } from "@/lib/success-stories/utils";

export type HomeStoryGoalFilterId =
  | "all"
  | "WEIGHT_LOSS"
  | "MUSCLE_GAIN"
  | "BODYBUILDING"
  | "POWERLIFTING"
  | "CROSSFIT"
  | "BOXING"
  | "MMA"
  | "WOMENS";

export type HomeStorySortFilterId = "latest" | "featured" | "trending";

export const HOME_STORY_GOAL_FILTERS: {
  id: HomeStoryGoalFilterId;
  label: string;
  goals?: SuccessStoryGoal[];
  gender?: SuccessStoryGender;
}[] = [
  { id: "all", label: "All" },
  { id: "WEIGHT_LOSS", label: "Weight Loss", goals: ["WEIGHT_LOSS"] },
  { id: "MUSCLE_GAIN", label: "Muscle Gain", goals: ["MUSCLE_GAIN"] },
  { id: "BODYBUILDING", label: "Bodybuilding", goals: ["MUSCLE_GAIN", "STRENGTH"] },
  { id: "POWERLIFTING", label: "Powerlifting", goals: ["STRENGTH"] },
  { id: "CROSSFIT", label: "CrossFit", goals: ["ENDURANCE", "GENERAL_FITNESS"] },
  { id: "BOXING", label: "Boxing", goals: ["BOXING"] },
  { id: "MMA", label: "MMA", goals: ["MMA"] },
  { id: "WOMENS", label: "Women's Fitness", gender: "FEMALE" },
];

export const HOME_STORY_SORT_FILTERS: { id: HomeStorySortFilterId; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "featured", label: "Featured" },
  { id: "trending", label: "Trending" },
];

export function formatFeaturedHeadline(story: HomeSuccessStory): string {
  const lost = calculateWeightLost(story.startWeight, story.currentWeight);
  const unit = story.weightUnit === "LBS" ? "lbs" : "KG";
  if (lost != null && story.duration) {
    return `Lost ${lost} ${unit} in ${story.duration}`;
  }
  return story.title;
}

export function formatWeightLostLabel(
  startWeight?: number | null,
  currentWeight?: number | null,
  unit?: string | null
): string | null {
  const lost = calculateWeightLost(startWeight, currentWeight);
  if (lost == null) return null;
  const suffix = unit === "LBS" ? " lbs" : " kg";
  return `${lost}${suffix}`;
}

export function filterHomeStories(
  stories: HomeSuccessStory[],
  goalFilter: HomeStoryGoalFilterId,
  sortFilter: HomeStorySortFilterId
): HomeSuccessStory[] {
  const goalConfig = HOME_STORY_GOAL_FILTERS.find((f) => f.id === goalFilter);
  let result = [...stories];

  const storyTimestamp = (story: HomeSuccessStory) =>
    new Date(story.publishedAt ?? story.createdAt).getTime();

  if (goalFilter !== "all" && goalConfig) {
    result = result.filter((story) => {
      if (goalConfig.gender && story.gender !== goalConfig.gender) return false;
      if (goalConfig.goals?.length && !goalConfig.goals.includes(story.goal)) return false;
      return true;
    });
  }

  if (sortFilter === "featured") {
    result = result.filter((s) => s.isFeatured);
    result.sort((a, b) => storyTimestamp(b) - storyTimestamp(a));
  } else if (sortFilter === "trending") {
    result.sort((a, b) => b.viewCount - a.viewCount);
  } else {
    result.sort((a, b) => storyTimestamp(b) - storyTimestamp(a));
  }

  return result;
}

export function formatShowcaseStatValue(value: number): string {
  if (value >= 1000) {
    return `${value.toLocaleString("en-PK")}+`;
  }
  return value > 0 ? `${value}+` : "0";
}

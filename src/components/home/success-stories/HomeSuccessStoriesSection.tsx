import {
  getHomepageSuccessStories,
  getHomepageSuccessStoryCommunityStats,
} from "@/services/success-story/success-story.service";
import { HomeSuccessStoriesShowcase } from "@/components/home/success-stories/HomeSuccessStoriesShowcase";

export async function HomeSuccessStoriesSection() {
  const [{ featured, grid }, stats] = await Promise.all([
    getHomepageSuccessStories(),
    getHomepageSuccessStoryCommunityStats(),
  ]);

  if (!featured && grid.length === 0) {
    return null;
  }

  return <HomeSuccessStoriesShowcase featured={featured} grid={grid} stats={stats} />;
}

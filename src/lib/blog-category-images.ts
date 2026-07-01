/** Background images for blog category cards (slug → local asset path). */
const BLOG_CATEGORY_IMAGES: Record<string, string> = {
  "fitness-tips": "/images/blog/categories/Fitness%20Tips.png",
  "muscle-building": "/images/blog/categories/Fitness%20Adda%20Muscle%20Building.png",
  nutrition: "/images/blog/categories/Nutritions.png",
  supplements: "/images/blog/categories/Supplements.png",
  "weight-loss": "/images/blog/categories/Weight%20Loss.png",
  workout: "/images/blog/categories/Workout.png",
};

const DEFAULT_BLOG_CATEGORY_IMAGE = "/images/blog/categories/Fitness%20Tips.png";

export function getBlogCategoryImage(slug: string): string {
  return BLOG_CATEGORY_IMAGES[slug.toLowerCase()] ?? DEFAULT_BLOG_CATEGORY_IMAGE;
}

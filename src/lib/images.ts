import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

export interface GymImageRecord {
  id?:       string;
  imageUrl:  string;
  publicId?: string | null;
  alt?:      string | null;
}

export interface GymWithImages {
  coverImage?: string | null;
  galleryImages?: GymImageRecord[];
}

export function getGymCoverUrl(gym: GymWithImages): string | undefined {
  return gym.coverImage ?? gym.galleryImages?.[0]?.imageUrl;
}

export function getGymGalleryImages(gym: GymWithImages): GymImageRecord[] {
  const gallery = gym.galleryImages ?? [];
  if (gym.coverImage) {
    return [{ imageUrl: gym.coverImage, alt: null }, ...gallery];
  }
  return gallery;
}

export function optimizedImageUrl(
  url: string,
  opts?: { width?: number; height?: number; quality?: number }
): string {
  return optimizeCloudinaryUrl(url, opts);
}

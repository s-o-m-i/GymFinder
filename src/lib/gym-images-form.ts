export interface UploadedImage {
  id?:       string;
  imageUrl:  string;
  publicId?: string;
  preview?:  string;
  status:    "pending" | "uploading" | "uploaded" | "error";
  progress:  number;
  error?:    string;
}

export interface GymImageInput {
  id?:       string;
  imageUrl:  string;
  publicId?: string;
}

export interface GymRecordImages {
  coverImage?: string | null;
  coverImagePublicId?: string | null;
  galleryImages?: Array<{
    id: string;
    imageUrl: string;
    publicId?: string | null;
  }>;
}

export function toUploaded(img: GymImageInput): UploadedImage {
  return {
    id:       img.id,
    imageUrl: img.imageUrl,
    publicId: img.publicId,
    status:   "uploaded",
    progress: 100,
  };
}

export function buildGymFormImageState(gym: GymRecordImages): {
  coverImage: UploadedImage | null;
  galleryImages: UploadedImage[];
} {
  const galleryImages = (gym.galleryImages ?? []).map((img) =>
    toUploaded({
      id: img.id,
      imageUrl: img.imageUrl,
      publicId: img.publicId ?? undefined,
    })
  );

  const coverImage = gym.coverImage
    ? toUploaded({
        imageUrl: gym.coverImage,
        publicId: gym.coverImagePublicId ?? undefined,
      })
    : null;

  return { coverImage, galleryImages };
}

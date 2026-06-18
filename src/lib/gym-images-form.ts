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

export function toUploaded(img: GymImageInput): UploadedImage {
  return {
    id:       img.id,
    imageUrl: img.imageUrl,
    publicId: img.publicId,
    status:   "uploaded",
    progress: 100,
  };
}

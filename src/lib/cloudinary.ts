import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import "server-only";

export const CLOUDINARY_FOLDERS = {
  root:    "gymxclubs/gyms",
  covers:  "gymxclubs/gyms/covers",
  gallery: "gymxclubs/gyms/gallery",
  equipment: "gymxclubs/gyms/equipment",
  coaches: "gymxclubs/coaches",
  coachCerts: "gymxclubs/coaches/certifications",
  events:  "gymxclubs/events",
  payments: "gymxclubs/payments",
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId:  string;
  width:     number;
  height:    number;
  format:    string;
}

function ensureConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key:    apiKey,
    api_secret: apiSecret,
    secure:     true,
  });
}

export async function uploadImage(
  file: Buffer | string,
  folder: CloudinaryFolder,
  filename?: string
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image" as const,
      overwrite:     false,
      ...(filename ? { public_id: filename.replace(/\.[^.]+$/, "") } : {}),
    };

    const callback = (error: Error | undefined, uploadResult?: UploadApiResponse) => {
      if (error || !uploadResult) {
        reject(error ?? new Error("Cloudinary upload failed"));
        return;
      }
      resolve(uploadResult);
    };

    if (typeof file === "string") {
      cloudinary.uploader.upload(file, uploadOptions, callback);
    } else {
      cloudinary.uploader.upload_stream(uploadOptions, callback).end(file);
    }
  });

  return {
    secureUrl: result.secure_url,
    publicId:  result.public_id,
    width:     result.width,
    height:    result.height,
    format:    result.format,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export async function deleteImages(publicIds: string[]): Promise<void> {
  const ids = publicIds.filter(Boolean);
  if (ids.length === 0) return;
  ensureConfigured();
  await cloudinary.api.delete_resources(ids, { resource_type: "image", type: "upload" });
}

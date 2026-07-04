import { NextRequest, NextResponse } from "next/server";
import { CLOUDINARY_FOLDERS, uploadImage } from "@/lib/cloudinary";
import { verifyUploadRequest } from "@/lib/admin-auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const FOLDER_MAP: Record<string, string> = {
  cover:   CLOUDINARY_FOLDERS.covers,
  gallery: CLOUDINARY_FOLDERS.gallery,
  gym:     CLOUDINARY_FOLDERS.root,
  coach:       CLOUDINARY_FOLDERS.coaches,
  coach_cert:  CLOUDINARY_FOLDERS.coachCerts,
  event_cover: CLOUDINARY_FOLDERS.events,
  equipment: CLOUDINARY_FOLDERS.equipment,
  transformation: CLOUDINARY_FOLDERS.transformations,
  success_story: CLOUDINARY_FOLDERS.successStories,
  payment_proof: CLOUDINARY_FOLDERS.payments,
};

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyUploadRequest(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file     = formData.get("file");
    const type     = (formData.get("type") as string) ?? "gallery";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max 10 MB" }, { status: 400 });
    }

    const folder = FOLDER_MAP[type] ?? CLOUDINARY_FOLDERS.gallery;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder as typeof CLOUDINARY_FOLDERS.covers, file.name);

    return NextResponse.json({
      secure_url: result.secureUrl,
      public_id:  result.publicId,
      width:      result.width,
      height:     result.height,
    });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

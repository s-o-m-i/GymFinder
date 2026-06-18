import { NextRequest, NextResponse } from "next/server";
import { deleteImage } from "@/lib/cloudinary";
import { verifyUploadRequest } from "@/lib/admin-auth";

export async function DELETE(req: NextRequest) {
  try {
    if (!(await verifyUploadRequest(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const publicId = body.publicId as string | undefined;

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    await deleteImage(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/images error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

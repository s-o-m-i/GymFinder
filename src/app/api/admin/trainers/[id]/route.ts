import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  adminTrainerSchema,
  adminTrainerStatusSchema,
} from "@/lib/validations/admin-trainer";
import {
  getAdminTrainerById,
  updateTrainerByAdmin,
  updateTrainerStatusByAdmin,
} from "@/services/trainer/admin-trainer.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function revalidateTrainerPaths(slug?: string) {
  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
  if (slug) revalidatePath(`/trainer/${slug}`);
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const trainer = await getAdminTrainerById(id);
    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
    }
    return NextResponse.json({ data: trainer });
  } catch (error) {
    console.error("GET /api/admin/trainers/[id] error:", error);
    return NextResponse.json({ error: "Failed to load trainer." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = adminTrainerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const trainer = await updateTrainerByAdmin(id, parsed.data);
    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
    }

    revalidateTrainerPaths(trainer.slug);
    return NextResponse.json({ data: trainer });
  } catch (error) {
    console.error("PUT /api/admin/trainers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update trainer." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = adminTrainerStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    if (
      parsed.data.isPublished === undefined &&
      parsed.data.isVerified === undefined &&
      parsed.data.isFeatured === undefined
    ) {
      return NextResponse.json({ error: "No status fields provided." }, { status: 400 });
    }

    const trainer = await updateTrainerStatusByAdmin(id, parsed.data);
    revalidateTrainerPaths(trainer.slug);

    if (parsed.data.isPublished !== undefined && trainer.accountId) {
      const { notifyTrainerProfileStatusChange, notifyTrainerProfileRejected } = await import(
        "@/services/notification/notification.dispatch"
      );
      if (parsed.data.isPublished) {
        void notifyTrainerProfileStatusChange({
          accountId: trainer.accountId,
          trainerId: trainer.id,
          trainerSlug: trainer.slug,
          trainerName: trainer.fullName,
          isPublished: true,
          isVerified: trainer.isVerified,
        });
      } else {
        void notifyTrainerProfileRejected({
          accountId: trainer.accountId,
          trainerId: trainer.id,
          trainerName: trainer.fullName,
        });
      }
    }

    return NextResponse.json({ data: trainer });
  } catch (error) {
    console.error("PATCH /api/admin/trainers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update trainer status." }, { status: 500 });
  }
}

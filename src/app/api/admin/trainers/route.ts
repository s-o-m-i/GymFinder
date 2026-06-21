import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { adminTrainerSchema } from "@/lib/validations/admin-trainer";
import {
  createTrainerByAdmin,
  getAdminTrainersList,
} from "@/services/trainer/admin-trainer.service";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const trainers = await getAdminTrainersList();
    return NextResponse.json({ data: trainers });
  } catch (error) {
    console.error("GET /api/admin/trainers error:", error);
    return NextResponse.json({ error: "Failed to load trainers." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = adminTrainerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const trainer = await createTrainerByAdmin(parsed.data);

    revalidatePath("/admin/trainers");
    revalidatePath("/trainers");

    return NextResponse.json({ data: trainer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/trainers error:", error);
    return NextResponse.json({ error: "Failed to create trainer." }, { status: 500 });
  }
}

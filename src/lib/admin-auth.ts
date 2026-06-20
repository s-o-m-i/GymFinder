import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getOwnerSession } from "@/lib/owner-auth";
import { getTrainerSession } from "@/lib/trainer-auth";

/** Verify admin access via JWT session cookie or legacy x-admin-secret header */
export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  const session = await getAdminSession();
  if (session) return true;

  const adminSecret = req.headers.get("x-admin-secret");
  return adminSecret === process.env.ADMIN_SECRET;
}

/** Verify admin, owner, or trainer session for upload/delete image routes */
export async function verifyUploadRequest(req: NextRequest): Promise<boolean> {
  if (await verifyAdminRequest(req)) return true;
  const owner = await getOwnerSession();
  if (owner) return true;
  const trainer = await getTrainerSession();
  return trainer !== null;
}

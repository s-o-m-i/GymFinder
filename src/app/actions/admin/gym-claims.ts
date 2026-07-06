"use server";

import { revalidatePath } from "next/cache";
import { gymClaimRejectSchema } from "@/lib/validations/gym-claim";
import {
  approveGymClaim,
  GymClaimError,
  rejectGymClaim,
} from "@/services/gym-claim/gym-claim.service";
import {
  sendGymClaimApprovedEmail,
  sendGymClaimRejectedEmail,
} from "@/services/gym-claim/gym-claim-email.service";
import {
  notifyOwnerClaimApproved,
  notifyOwnerClaimRejected,
} from "@/services/notification/notification.dispatch";
import { getAdminSession } from "@/lib/auth";

export type AdminGymClaimActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const ok = await getAdminSession();
  if (!ok) throw new Error("UNAUTHORIZED");
}

function revalidateClaimPaths(gymSlug?: string) {
  revalidatePath("/admin/claims");
  if (gymSlug) {
    revalidatePath(`/gyms/${gymSlug}`);
    revalidatePath(`/admin/claims`);
  }
}

export async function approveGymClaimAction(claimId: string): Promise<AdminGymClaimActionResult> {
  try {
    await requireAdmin();
    const result = await approveGymClaim(claimId);

    void notifyOwnerClaimApproved({
      ownerId: result.claimantOwnerId,
      gymName: result.gymName,
      gymSlug: result.gymSlug,
    });

    try {
      await sendGymClaimApprovedEmail({
        to: result.claimantEmail,
        name: result.claimantName,
        gymName: result.gymName,
        gymSlug: result.gymSlug,
      });
    } catch (emailErr) {
      console.error("approveGymClaimAction email:", emailErr);
    }

    revalidateClaimPaths(result.gymSlug);
    revalidatePath(`/admin/claims/${claimId}`);
    revalidatePath("/owner/dashboard");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { success: false, error: "Unauthorized." };
    }
    if (err instanceof GymClaimError) {
      return { success: false, error: err.message };
    }
    console.error("approveGymClaimAction error:", err);
    return { success: false, error: "Failed to approve claim." };
  }
}

export async function rejectGymClaimAction(
  claimId: string,
  input?: { rejectionReason?: string; adminNotes?: string }
): Promise<AdminGymClaimActionResult> {
  try {
    await requireAdmin();
    const parsed = gymClaimRejectSchema.safeParse(input ?? {});
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const claim = await rejectGymClaim(
      claimId,
      "admin",
      parsed.data.rejectionReason,
      parsed.data.adminNotes
    );

    const owner = await import("@/lib/prisma").then((m) =>
      m.prisma.gymClaimRequest.findUnique({
        where: { id: claimId },
        select: { claimantOwnerId: true, gym: { select: { slug: true } } },
      })
    );

    if (owner?.claimantOwnerId) {
      void notifyOwnerClaimRejected({
        ownerId: owner.claimantOwnerId,
        gymName: claim.gymName,
        reason: claim.rejectionReason,
      });
    }

    try {
      await sendGymClaimRejectedEmail({
        to: claim.claimantEmail,
        name: claim.claimantName,
        gymName: claim.gymName,
        reason: claim.rejectionReason,
      });
    } catch (emailErr) {
      console.error("rejectGymClaimAction email:", emailErr);
    }

    revalidateClaimPaths(owner?.gym.slug);
    revalidatePath(`/admin/claims/${claimId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { success: false, error: "Unauthorized." };
    }
    if (err instanceof GymClaimError) {
      return { success: false, error: err.message };
    }
    console.error("rejectGymClaimAction error:", err);
    return { success: false, error: "Failed to reject claim." };
  }
}

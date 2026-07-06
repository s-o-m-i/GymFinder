"use server";

import { revalidatePath } from "next/cache";
import { getOwnerSession } from "@/lib/owner-auth";
import { gymClaimSubmitSchema } from "@/lib/validations/gym-claim";
import type { ZodError } from "zod";
import { GymClaimError, submitGymClaim } from "@/services/gym-claim/gym-claim.service";
import { sendGymClaimSubmittedEmail } from "@/services/gym-claim/gym-claim-email.service";
import {
  notifyAdminGymClaimRequest,
  notifyOwnerClaimSubmitted,
} from "@/services/notification/notification.dispatch";
import { formatOwnerEmailError } from "@/lib/email-dev";

export type GymClaimActionResult =
  | { success: true; claimId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function flattenErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function submitGymClaimAction(
  input: unknown
): Promise<GymClaimActionResult> {
  const session = await getOwnerSession();
  if (!session) {
    return { success: false, error: "Please sign in or register as a gym owner to submit a claim." };
  }

  const parsed = gymClaimSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }

  try {
    const claim = await submitGymClaim(parsed.data, session.ownerId);

    void notifyAdminGymClaimRequest({
      claimId: claim.id,
      gymName: claim.gym.name,
      applicantName: claim.fullName,
    });
    void notifyOwnerClaimSubmitted({
      ownerId: session.ownerId,
      gymName: claim.gym.name,
      claimId: claim.id,
    });

    try {
      await sendGymClaimSubmittedEmail({
        to: claim.email,
        name: claim.fullName,
        gymName: claim.gym.name,
      });
    } catch (emailErr) {
      console.error("submitGymClaimAction email:", emailErr);
    }

    revalidatePath(`/gyms/${claim.gym.slug}`);
    revalidatePath("/admin/claims");

    return { success: true, claimId: claim.id };
  } catch (err) {
    if (err instanceof GymClaimError) {
      return { success: false, error: err.message };
    }
    console.error("submitGymClaimAction error:", err);
    return { success: false, error: formatOwnerEmailError(err) };
  }
}

import "server-only";

import { prisma } from "@/lib/prisma";
import { PLATFORM_ADMIN_RECIPIENT_ID } from "@/lib/notifications/constants";
import { NotificationService } from "./notification.service";

function adminRecipient() {
  return { recipientId: PLATFORM_ADMIN_RECIPIENT_ID, recipientRole: "ADMIN" as const };
}

export async function notifyAdminNewGymRegistration(params: {
  gymId: string;
  gymName: string;
  ownerId: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "SYSTEM",
    title: "New Gym Registration",
    message: `${params.gymName} submitted a listing for review.`,
    actionUrl: "/admin/owners",
    entityType: "GYM",
    entityId: params.gymId,
    priority: "HIGH",
  });
}

export async function notifyAdminNewTrainerRegistration(params: {
  accountId: string;
  trainerName: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "SYSTEM",
    title: "New Trainer Registration",
    message: `${params.trainerName} registered as a trainer.`,
    actionUrl: "/admin/trainers",
    entityType: "TRAINER",
    entityId: params.accountId,
    priority: "HIGH",
  });
}

export async function notifyGymListingStatusChange(params: {
  ownerId: string;
  gymId: string;
  gymSlug: string;
  gymName: string;
  status: "approved" | "rejected" | "pending";
}) {
  if (params.status === "pending") return null;

  const approved = params.status === "approved";
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: approved ? "PROFILE_APPROVED" : "PROFILE_REJECTED",
    title: approved ? "Gym Approved" : "Gym Rejected",
    message: approved
      ? `Your gym profile "${params.gymName}" is now live.`
      : `Your gym profile "${params.gymName}" was not approved.`,
    actionUrl: approved ? `/gyms/${params.gymSlug}` : "/owner/profile",
    entityType: "GYM",
    entityId: params.gymId,
    priority: "HIGH",
  });
}

export async function notifyTrainerProfileStatusChange(params: {
  accountId: string;
  trainerId: string;
  trainerSlug: string;
  trainerName: string;
  isPublished: boolean;
  isVerified?: boolean;
}) {
  if (!params.isPublished) return null;

  return NotificationService.create({
    recipientId: params.accountId,
    recipientRole: "TRAINER",
    type: "PROFILE_APPROVED",
    title: "Trainer Approved",
    message: `Your trainer profile "${params.trainerName}" is now live.`,
    actionUrl: `/trainer/${params.trainerSlug}`,
    entityType: "TRAINER",
    entityId: params.trainerId,
    priority: "HIGH",
  });
}

export async function notifyTrainerProfileRejected(params: {
  accountId: string;
  trainerId: string;
  trainerName: string;
}) {
  return NotificationService.create({
    recipientId: params.accountId,
    recipientRole: "TRAINER",
    type: "PROFILE_REJECTED",
    title: "Trainer Rejected",
    message: `Your trainer profile "${params.trainerName}" was not approved.`,
    actionUrl: "/trainer/dashboard/profile",
    entityType: "TRAINER",
    entityId: params.trainerId,
    priority: "HIGH",
  });
}

export async function notifyNewGymReview(params: { gymId: string; author: string; rating: number }) {
  const gym = await prisma.gym.findUnique({
    where: { id: params.gymId },
    select: { ownerId: true, slug: true, name: true },
  });
  if (!gym?.ownerId) return null;

  return NotificationService.create({
    recipientId: gym.ownerId,
    recipientRole: "OWNER",
    type: "NEW_REVIEW",
    title: "New Review Received",
    message: `${params.author} left a ${params.rating}-star review on ${gym.name}.`,
    actionUrl: `/gyms/${gym.slug}#reviews`,
    entityType: "GYM",
    entityId: params.gymId,
  });
}

export async function notifyNewTrainerReview(params: {
  trainerId: string;
  author: string;
  rating: number;
}) {
  const trainer = await prisma.trainer.findUnique({
    where: { id: params.trainerId },
    select: { accountId: true, slug: true, fullName: true },
  });
  if (!trainer?.accountId) return null;

  return NotificationService.create({
    recipientId: trainer.accountId,
    recipientRole: "TRAINER",
    type: "NEW_REVIEW",
    title: "New Review Received",
    message: `${params.author} left a ${params.rating}-star review on your profile.`,
    actionUrl: `/trainer/${trainer.slug}#reviews`,
    entityType: "TRAINER",
    entityId: params.trainerId,
  });
}

export async function notifyContactInquiry(params: {
  name: string;
  subject: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "NEW_INQUIRY",
    title: "New Contact Inquiry",
    message: `${params.name}: ${params.subject}`,
    actionUrl: "/admin",
    entityType: "SYSTEM",
    priority: "NORMAL",
  });
}

export async function notifyGymLeadInquiry(params: { gymId: string; leadName: string; goal: string }) {
  const gym = await prisma.gym.findUnique({
    where: { id: params.gymId },
    select: { ownerId: true, name: true, slug: true },
  });
  if (!gym?.ownerId) return null;

  return NotificationService.create({
    recipientId: gym.ownerId,
    recipientRole: "OWNER",
    type: "NEW_INQUIRY",
    title: "New Inquiry",
    message: `${params.leadName} is interested in ${params.goal} at ${gym.name}.`,
    actionUrl: `/gyms/${gym.slug}`,
    entityType: "GYM",
    entityId: params.gymId,
  });
}

export async function notifyFeaturedEnabled(params: {
  ownerId: string;
  gymId: string;
  gymSlug: string;
  gymName: string;
}) {
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: "FEATURED_ENABLED",
    title: "Featured Activated",
    message: `${params.gymName} is now featured on FitnessAdda.`,
    actionUrl: `/gyms/${params.gymSlug}`,
    entityType: "GYM",
    entityId: params.gymId,
    priority: "HIGH",
  });
}

export async function notifyFeaturedExpired(params: {
  ownerId: string;
  gymId: string;
  gymName: string;
}) {
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: "FEATURED_EXPIRED",
    title: "Featured Expired",
    message: `Featured listing for ${params.gymName} has ended.`,
    actionUrl: "/owner/featured",
    entityType: "GYM",
    entityId: params.gymId,
  });
}

export async function notifyAdminFeatureRequest(params: {
  requestId: string;
  gymName: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "PROMOTION",
    title: "Featured Payment Request",
    message: `${params.gymName} submitted a featured listing request.`,
    actionUrl: "/admin/featured-requests",
    entityType: "GYM",
    entityId: params.requestId,
    priority: "HIGH",
  });
}

export async function notifySuccessStoryPublished(params: {
  recipientId: string;
  recipientRole: "OWNER" | "TRAINER" | "COMMUNITY";
  storyId: string;
  storySlug: string;
  storyTitle: string;
}) {
  return NotificationService.create({
    recipientId: params.recipientId,
    recipientRole: params.recipientRole,
    type: "SUCCESS_STORY_APPROVED",
    title: "Story Published",
    message: `"${params.storyTitle}" is now live.`,
    actionUrl: `/success-stories/${params.storySlug}`,
    entityType: "SUCCESS_STORY",
    entityId: params.storyId,
    priority: "HIGH",
  });
}

export async function notifyAdminSuccessStorySubmission(params: {
  storyId: string;
  storyTitle: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "SYSTEM",
    title: "New Success Story",
    message: `"${params.storyTitle}" was submitted for review.`,
    actionUrl: "/admin",
    entityType: "SUCCESS_STORY",
    entityId: params.storyId,
    priority: "NORMAL",
  });
}

export async function notifyEventCreated(params: {
  ownerId: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
}) {
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: "SYSTEM",
    title: "Event Created",
    message: `"${params.eventTitle}" is now listed.`,
    actionUrl: `/events/${params.eventSlug}`,
    entityType: "EVENT",
    entityId: params.eventId,
  });
}

export async function notifyAdminEventSubmission(params: {
  eventId: string;
  eventTitle: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "SYSTEM",
    title: "New Event Submission",
    message: `"${params.eventTitle}" was created.`,
    actionUrl: "/admin",
    entityType: "EVENT",
    entityId: params.eventId,
  });
}

export async function notifyBlogPublished(params: {
  recipientId: string;
  recipientRole: "OWNER" | "TRAINER" | "COMMUNITY" | "ADMIN";
  blogSlug: string;
  blogTitle: string;
}) {
  return NotificationService.create({
    recipientId: params.recipientId,
    recipientRole: params.recipientRole,
    type: "BLOG_PUBLISHED",
    title: "Blog Published",
    message: `New article: "${params.blogTitle}"`,
    actionUrl: `/blogs/${params.blogSlug}`,
    entityType: "BLOG",
    priority: "LOW",
  });
}

export async function notifyAdminGymClaimRequest(params: {
  claimId: string;
  gymName: string;
  applicantName: string;
}) {
  return NotificationService.create({
    ...adminRecipient(),
    type: "SYSTEM",
    title: "New Gym Claim Request",
    message: `${params.applicantName} wants to claim ${params.gymName}.`,
    actionUrl: `/admin/claims/${params.claimId}`,
    entityType: "GYM",
    entityId: params.claimId,
    priority: "HIGH",
  });
}

export async function notifyOwnerClaimSubmitted(params: {
  ownerId: string;
  gymName: string;
  claimId: string;
}) {
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: "PROFILE_CLAIM_SUBMITTED",
    title: "Claim Submitted",
    message: `Your claim for ${params.gymName} is under review.`,
    actionUrl: "/dashboard/notifications",
    entityType: "GYM",
    entityId: params.claimId,
  });
}

export async function notifyOwnerClaimApproved(params: {
  ownerId: string;
  gymName: string;
  gymSlug: string;
}) {
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: "PROFILE_CLAIM_APPROVED",
    title: "Claim Approved",
    message: `You now manage ${params.gymName}.`,
    actionUrl: "/owner/dashboard",
    entityType: "GYM",
    priority: "HIGH",
  });
}

export async function notifyOwnerClaimRejected(params: {
  ownerId: string;
  gymName: string;
  reason?: string;
}) {
  return NotificationService.create({
    recipientId: params.ownerId,
    recipientRole: "OWNER",
    type: "PROFILE_CLAIM_REJECTED",
    title: "Claim Rejected",
    message: params.reason
      ? `Your claim for ${params.gymName} was not approved: ${params.reason}`
      : `Your claim for ${params.gymName} was not approved.`,
    actionUrl: "/dashboard/notifications",
    entityType: "GYM",
    priority: "HIGH",
  });
}

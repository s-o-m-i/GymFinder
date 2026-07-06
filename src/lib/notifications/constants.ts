import type { NotificationPriority, NotificationType } from "@prisma/client";

/** Synthetic admin recipient — admin auth is JWT-only, not a DB user. */
export const PLATFORM_ADMIN_RECIPIENT_ID = "platform-admin";

export const NOTIFICATIONS_PAGE_PATH = "/dashboard/notifications";

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { icon: string; priority: NotificationPriority }
> = {
  PROFILE_APPROVED: { icon: "✅", priority: "HIGH" },
  PROFILE_REJECTED: { icon: "❌", priority: "HIGH" },
  NEW_REVIEW: { icon: "⭐", priority: "NORMAL" },
  NEW_INQUIRY: { icon: "💬", priority: "NORMAL" },
  NEW_EVENT_BOOKING: { icon: "📅", priority: "NORMAL" },
  SUCCESS_STORY_APPROVED: { icon: "🏆", priority: "HIGH" },
  SUCCESS_STORY_REJECTED: { icon: "📝", priority: "NORMAL" },
  FEATURED_ENABLED: { icon: "🔥", priority: "HIGH" },
  FEATURED_EXPIRED: { icon: "⏰", priority: "NORMAL" },
  ADMIN_MESSAGE: { icon: "📢", priority: "HIGH" },
  BLOG_PUBLISHED: { icon: "📰", priority: "LOW" },
  PASSWORD_CHANGED: { icon: "🔒", priority: "URGENT" },
  EMAIL_VERIFIED: { icon: "✉️", priority: "NORMAL" },
  SYSTEM: { icon: "⚙️", priority: "NORMAL" },
  PROMOTION: { icon: "🎁", priority: "LOW" },
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  PROFILE_APPROVED: "Profile Approved",
  PROFILE_REJECTED: "Profile Rejected",
  NEW_REVIEW: "New Review",
  NEW_INQUIRY: "New Inquiry",
  NEW_EVENT_BOOKING: "Event Registration",
  SUCCESS_STORY_APPROVED: "Story Published",
  SUCCESS_STORY_REJECTED: "Story Rejected",
  FEATURED_ENABLED: "Featured Activated",
  FEATURED_EXPIRED: "Featured Expired",
  ADMIN_MESSAGE: "Admin Message",
  BLOG_PUBLISHED: "Blog Published",
  PASSWORD_CHANGED: "Password Changed",
  EMAIL_VERIFIED: "Email Verified",
  SYSTEM: "System",
  PROMOTION: "Promotion",
};

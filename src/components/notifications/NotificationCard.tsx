"use client";

import Link from "next/link";
import type { Notification } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/notifications/format";

interface NotificationCardProps {
  notification: Notification;
  compact?: boolean;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onClick?: (notification: Notification) => void;
}

export function NotificationCard({
  notification,
  compact = false,
  selected,
  onSelect,
  onClick,
}: NotificationCardProps) {
  const isUnread = notification.status === "UNREAD";
  const content = (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3 transition-colors",
        isUnread
          ? "border-[#FF6A3D]/25 bg-orange-50/50"
          : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)]",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(notification)}
      role={onClick ? "button" : undefined}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(notification.id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[#FF6A3D] focus:ring-[#FF6A3D]/30"
        />
      )}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg)] text-lg">
        {notification.icon ?? "🔔"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-semibold text-[var(--text)]", compact && "line-clamp-1")}>
            {notification.title}
          </p>
          {isUnread && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FF6A3D]" aria-hidden />
          )}
        </div>
        <p className={cn("mt-0.5 text-sm text-[var(--text-muted)]", compact ? "line-clamp-2" : "line-clamp-3")}>
          {notification.message}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {formatRelativeTime(notification.createdAt)}
          </span>
          {notification.actionUrl && !onClick && (
            <span className="text-xs font-semibold text-[#FF6A3D]">View →</span>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl && !onClick) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

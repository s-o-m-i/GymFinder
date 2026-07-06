"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Notification } from "@prisma/client";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS_PAGE_PATH } from "@/lib/notifications/constants";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCard } from "./NotificationCard";

interface NotificationBellProps {
  isHero?: boolean;
}

export function NotificationBell({ isHero = false }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    authenticated,
    unreadCount,
    recent,
    loading,
    refreshRecent,
    markAllRead,
    markRead,
  } = useNotifications();

  useEffect(() => {
    if (!open) return;
    void refreshRecent();
  }, [open, refreshRecent]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!authenticated && !loading) return null;

  async function handleNotificationClick(notification: Notification) {
    if (notification.status === "UNREAD") {
      await markRead(notification.id);
    }
    setOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative rounded-xl p-2.5 transition-colors",
          isHero
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A3D] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-xs text-[var(--text-muted)]">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A3D] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[22rem] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-[var(--text-muted)]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : recent.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
                No notifications yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recent.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    compact
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] p-2">
            <Link
              href={NOTIFICATIONS_PAGE_PATH}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-[#0B2545] hover:bg-[var(--bg)]"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

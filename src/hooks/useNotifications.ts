"use client";

import type { Notification } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/notifications/format";

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const [authenticated, setAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", { credentials: "include" });
      if (!res.ok) {
        setUnreadCount(0);
        return;
      }
      const data = (await res.json()) as { count?: number };
      setUnreadCount(data.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = (await res.json()) as { authenticated?: boolean };
      setAuthenticated(!!data.authenticated);
      return !!data.authenticated;
    } catch {
      setAuthenticated(false);
      return false;
    }
  }, []);

  const refreshRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/recent", { credentials: "include" });
      if (!res.ok) {
        setRecent([]);
        return;
      }
      const data = (await res.json()) as { items?: Notification[]; unreadCount?: number };
      setRecent(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setRecent([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const authed = await checkAuth();
    if (authed) {
      await Promise.all([refreshUnread(), refreshRecent()]);
    }
    setLoading(false);
  }, [checkAuth, refreshUnread, refreshRecent]);

  useEffect(() => {
    void refreshAll();
    const timer = setInterval(() => {
      void refreshUnread();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshAll, refreshUnread]);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/mark-all-read", { method: "POST", credentials: "include" });
    setUnreadCount(0);
    setRecent((prev) => prev.map((n) => ({ ...n, status: "READ" as const, readAt: new Date() })));
  }, []);

  const markRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true }),
    });
    setRecent((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" as const, readAt: new Date() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return {
    authenticated,
    unreadCount,
    recent,
    loading,
    refreshRecent,
    refreshUnread,
    refreshAll,
    markAllRead,
    markRead,
    formatRelativeTime,
  };
}

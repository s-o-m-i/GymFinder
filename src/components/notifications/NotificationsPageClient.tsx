"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notification, NotificationPriority, NotificationStatus, NotificationType } from "@prisma/client";
import { Archive, CheckCheck, Loader2, Search, Trash2 } from "lucide-react";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/notifications/constants";
import { NotificationCard } from "@/components/notifications/NotificationCard";

type StatusFilter = NotificationStatus | "ALL";

interface ListResponse {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "UNREAD", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "ARCHIVED", label: "Archived" },
];

const PRIORITY_OPTIONS: { value: NotificationPriority | ""; label: string }[] = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const TYPE_OPTIONS: { value: NotificationType | ""; label: string }[] = [
  { value: "", label: "All types" },
  ...Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({
    value: value as NotificationType,
    label,
  })),
];

const selectClass =
  "rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20";

export function NotificationsPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<NotificationType | "">("");
  const [priority, setPriority] = useState<NotificationPriority | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status !== "ALL") params.set("status", status);
      if (type) params.set("type", type);
      if (priority) params.set("priority", priority);
      if (search) params.set("q", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/notifications?${params}`, { credentials: "include" });
      if (!res.ok) {
        router.replace("/auth/sign-in");
        return;
      }
      const data = (await res.json()) as ListResponse;
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, [page, status, type, priority, search, dateFrom, dateTo, router]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(items.map((n) => n.id)) : new Set());
  }

  async function runBulk(action: "read" | "archive" | "delete") {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selected) }),
      });
      await fetchList();
    } finally {
      setBulkLoading(false);
    }
  }

  async function markAllRead() {
    setBulkLoading(true);
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST", credentials: "include" });
      await fetchList();
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleClick(notification: Notification) {
    if (notification.status === "UNREAD") {
      await fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markRead: true }),
      });
    }
    if (notification.actionUrl) router.push(notification.actionUrl);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Notifications</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {total} notification{total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(q.trim());
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notifications..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-3 text-sm focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#071832]"
          >
            Search
          </button>
        </form>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as StatusFilter); }} className={selectClass}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={type} onChange={(e) => { setPage(1); setType(e.target.value as NotificationType | ""); }} className={selectClass}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => { setPage(1); setPriority(e.target.value as NotificationPriority | ""); }} className={selectClass}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value); }} className={selectClass} />
            <input type="date" value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value); }} className={selectClass} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="mr-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={items.length > 0 && selected.size === items.length}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] text-[#FF6A3D]"
          />
          Select all
        </label>
        <button
          type="button"
          disabled={selected.size === 0 || bulkLoading}
          onClick={() => void runBulk("read")}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark read
        </button>
        <button
          type="button"
          disabled={selected.size === 0 || bulkLoading}
          onClick={() => void runBulk("archive")}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          <Archive className="h-3.5 w-3.5" /> Archive
        </button>
        <button
          type="button"
          disabled={selected.size === 0 || bulkLoading}
          onClick={() => void runBulk("delete")}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        <button
          type="button"
          disabled={bulkLoading}
          onClick={() => void markAllRead()}
          className="ml-auto text-xs font-semibold text-[#FF6A3D] hover:underline disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-[var(--text-muted)]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] py-16 text-center text-sm text-[var(--text-muted)]">
          No notifications match your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              selected={selected.has(notification.id)}
              onSelect={toggleSelect}
              onClick={handleClick}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

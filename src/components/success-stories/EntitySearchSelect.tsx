"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type EntitySearchItem = {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string | null;
};

interface EntitySearchSelectProps {
  label: string;
  placeholder: string;
  type: "gym" | "trainer";
  value: EntitySearchItem | null;
  onChange: (item: EntitySearchItem | null) => void;
}

export function EntitySearchSelect({
  label,
  placeholder,
  type,
  value,
  onChange,
}: EntitySearchSelectProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<EntitySearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/success-stories/search?type=${type}&q=${encodeURIComponent(query)}`
        );
        const data = (await res.json()) as {
          items: Array<Record<string, string | null | undefined>>;
        };
        setItems(
          data.items.map((item) => ({
            id: String(item.id),
            label: type === "gym" ? String(item.name) : String(item.fullName),
            sublabel: [item.area, item.city].filter(Boolean).join(", "),
            imageUrl: type === "gym" ? item.coverImage : item.profileImage,
          }))
        );
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, type, open]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{value.label}</p>
            {value.sublabel && (
              <p className="text-xs text-gray-500 truncate">{value.sublabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-800"
            aria-label="Remove selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          />
          {open && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              ) : items.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No results found.</p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50",
                      "border-b border-gray-100 last:border-0"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      {item.sublabel && (
                        <p className="text-xs text-gray-500">{item.sublabel}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

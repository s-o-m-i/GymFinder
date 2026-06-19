"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { dedupeCustomNames, normalizeTagName } from "@/lib/gym-tags";

interface CustomTagPickerProps {
  predefined: { id: string; name: string }[];
  selectedIds: string[];
  customNames: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onCustomNamesChange: (names: string[]) => void;
  customLabel: string;
  customPlaceholder: string;
  customHint: string;
  inputClass: string;
  labelClass: string;
}

export function CustomTagPicker({
  predefined,
  selectedIds,
  customNames,
  onSelectedIdsChange,
  onCustomNamesChange,
  customLabel,
  customPlaceholder,
  customHint,
  inputClass,
  labelClass,
}: CustomTagPickerProps) {
  const [draft, setDraft] = useState("");

  const togglePredefined = (id: string) => {
    onSelectedIdsChange(
      selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id]
    );
  };

  const addCustom = () => {
    const name = normalizeTagName(draft);
    if (!name) return;

    const next = dedupeCustomNames([...customNames, name], predefined);
    if (next.length === customNames.length) {
      setDraft("");
      return;
    }

    onCustomNamesChange(next);
    setDraft("");
  };

  const removeCustom = (name: string) => {
    onCustomNamesChange(customNames.filter((item) => item !== name));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {predefined.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => togglePredefined(item.id)}
            className={`px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${
              selectedIds.includes(item.id)
                ? "bg-[#0B2545] text-white border-[#0B2545]"
                : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {customNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border bg-orange-50 text-orange-800 border-orange-200"
            >
              {name}
              <button
                type="button"
                onClick={() => removeCustom(name)}
                className="rounded-full p-0.5 hover:bg-orange-100"
                aria-label={`Remove ${name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div>
        <label className={labelClass}>{customLabel}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={customPlaceholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#FF6A3D] text-white hover:bg-[#e85528] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">{customHint}</p>
      </div>
    </div>
  );
}

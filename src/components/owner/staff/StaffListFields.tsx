"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  STAFF_LIST_ITEM_MAX_CHARS,
  STAFF_LIST_ITEM_MAX_WORDS,
  STAFF_LIST_MAX_ITEMS,
  countListItemWords,
  isListItemWithinLimits,
  type StaffAchievementItem,
  type StaffCertificationItem,
} from "@/lib/staff-members";
import { AlertCircle, Plus, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffAchievementsFieldProps {
  items: StaffAchievementItem[];
  onChange: (items: StaffAchievementItem[]) => void;
  error?: string;
}

const inputClass =
  "w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";

export function StaffAchievementsField({
  items,
  onChange,
  error,
}: StaffAchievementsFieldProps) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const charCount = draft.length;
  const wordCount = countListItemWords(draft);
  const atMaxItems = items.length >= STAFF_LIST_MAX_ITEMS;

  function handleDraftChange(value: string) {
    if (value.length > STAFF_LIST_ITEM_MAX_CHARS) return;
    if (!isListItemWithinLimits(value)) return;
    setDraft(value);
    setDraftError(null);
  }

  function addItem() {
    const name = draft.trim();
    if (!name) {
      setDraftError("Enter an achievement before adding.");
      return;
    }
    if (!isListItemWithinLimits(name)) {
      setDraftError(
        `Each achievement is limited to ${STAFF_LIST_ITEM_MAX_WORDS} words and ${STAFF_LIST_ITEM_MAX_CHARS} characters.`
      );
      return;
    }
    if (atMaxItems) {
      setDraftError(`Maximum ${STAFF_LIST_MAX_ITEMS} achievements allowed.`);
      return;
    }

    onChange([...items, { id: crypto.randomUUID(), name }]);
    setDraft("");
    setDraftError(null);
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="sm:col-span-2 space-y-3">
      <div>
        <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
          Achievements{" "}
          <span className="font-normal text-[var(--text-muted)]">
            (max {STAFF_LIST_MAX_ITEMS} items · {STAFF_LIST_ITEM_MAX_WORDS} words /{" "}
            {STAFF_LIST_ITEM_MAX_CHARS} chars each)
          </span>
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            disabled={atMaxItems}
            placeholder="e.g. National Boxing Championship 2023"
            className={cn(inputClass, "min-w-0", (error || draftError) && "border-red-300")}
          />
          <button
            type="button"
            onClick={addItem}
            disabled={atMaxItems || !draft.trim()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          {wordCount} / {STAFF_LIST_ITEM_MAX_WORDS} words · {charCount} /{" "}
          {STAFF_LIST_ITEM_MAX_CHARS} characters · {items.length} / {STAFF_LIST_MAX_ITEMS}{" "}
          added
        </p>
        {(draftError || error) && (
          <p className="text-xs text-red-600 mt-1">{draftError ?? error}</p>
        )}
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl"
            >
              <Trophy className="w-4 h-4 text-[#FF6A3D] shrink-0" />
              <span className="flex-1 text-sm text-[var(--text)] whitespace-pre-line break-words break-all">{item.name}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface StaffCertificationsFieldProps {
  items: StaffCertificationItem[];
  onChange: (items: StaffCertificationItem[]) => void;
  error?: string;
}

export function StaffCertificationsField({
  items,
  onChange,
  error,
}: StaffCertificationsFieldProps) {
  const [draftName, setDraftName] = useState("");
  const [draftImage, setDraftImage] = useState<UploadedImage[]>([]);
  const [draftError, setDraftError] = useState<string | null>(null);

  const charCount = draftName.length;
  const wordCount = countListItemWords(draftName);
  const atMaxItems = items.length >= STAFF_LIST_MAX_ITEMS;
  const uploadedImage = draftImage.find((img) => img.status === "uploaded");
  const imageUploading = draftImage.some(
    (img) => img.status === "uploading" || img.status === "pending"
  );

  function handleDraftChange(value: string) {
    if (value.length > STAFF_LIST_ITEM_MAX_CHARS) return;
    if (!isListItemWithinLimits(value)) return;
    setDraftName(value);
    setDraftError(null);
  }

  async function removeItem(id: string, cloudinaryId?: string | null) {
    if (cloudinaryId) {
      try {
        await fetch("/api/admin/images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ publicId: cloudinaryId }),
        });
      } catch {
        // Best-effort cleanup
      }
    }
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    const name = draftName.trim();
    if (!name) {
      setDraftError("Enter a certification name before adding.");
      return;
    }
    if (!isListItemWithinLimits(name)) {
      setDraftError(
        `Each certification is limited to ${STAFF_LIST_ITEM_MAX_WORDS} words and ${STAFF_LIST_ITEM_MAX_CHARS} characters.`
      );
      return;
    }
    if (imageUploading) {
      setDraftError("Please wait for the certificate image to finish uploading.");
      return;
    }
    if (atMaxItems) {
      setDraftError(`Maximum ${STAFF_LIST_MAX_ITEMS} certifications allowed.`);
      return;
    }

    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        name,
        imageUrl: uploadedImage?.imageUrl ?? null,
        cloudinaryId: uploadedImage?.publicId ?? null,
      },
    ]);
    setDraftName("");
    setDraftImage([]);
    setDraftError(null);
  }

  return (
    <div className="sm:col-span-2 space-y-3">
      <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
            Certifications{" "}
            <span className="font-normal text-[var(--text-muted)]">
              (max {STAFF_LIST_MAX_ITEMS} items · {STAFF_LIST_ITEM_MAX_WORDS} words /{" "}
              {STAFF_LIST_ITEM_MAX_CHARS} chars each)
            </span>
          </label>

          <input
            type="text"
            value={draftName}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            disabled={atMaxItems}
            placeholder="e.g. NASM-CPT, WBC Level 2 Coach"
            className={cn(inputClass, (error || draftError) && "border-red-300")}
          />

          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            {wordCount} / {STAFF_LIST_ITEM_MAX_WORDS} words · {charCount} /{" "}
            {STAFF_LIST_ITEM_MAX_CHARS} characters · {items.length} / {STAFF_LIST_MAX_ITEMS}{" "}
            added
          </p>
        </div>

        <ImageUploader
          label="Certificate Photo (optional)"
          description="Attach a photo or scan of this certificate."
          images={draftImage}
          onChange={setDraftImage}
          multiple={false}
          maxImages={1}
          uploadType="coach_cert"
          authMode="cookie"
          className="max-w-sm"
        />

        <button
          type="button"
          onClick={addItem}
          disabled={atMaxItems || !draftName.trim() || imageUploading}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>

        {(draftError || error) && (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {draftError ?? error}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-3 bg-white border border-[var(--border)] rounded-xl"
            >
              {item.imageUrl ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#0B2545]/5 border border-[var(--border)] shrink-0" />
              )}
              <span className="flex-1 text-sm font-medium text-[var(--text)]">{item.name}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id, item.cloudinaryId)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

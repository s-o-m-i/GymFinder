"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Images,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { TransformationsActionResult } from "@/app/actions/owner/gym-transformations";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  TRANSFORMATION_CLIENT_NAME_MAX_CHARS,
  TRANSFORMATION_MAX_ITEMS,
  TRANSFORMATION_STORY_MAX_CHARS,
  TRANSFORMATION_STORY_MAX_WORDS,
  countTransformationWords,
  isTransformationStoryWithinLimits,
  type TransformationItem,
} from "@/lib/transformations";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface TransformationsManagerProps {
  entityName: string;
  initialItems: TransformationItem[];
  saveAction: (items: TransformationItem[]) => Promise<TransformationsActionResult>;
}

const inputClass =
  "w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";

function getUploadedImage(
  uploads: UploadedImage[]
): { url: string; publicId: string | null } | null {
  const uploaded = uploads.find((img) => img.status === "uploaded");
  if (!uploaded?.imageUrl) return null;
  return { url: uploaded.imageUrl, publicId: uploaded.publicId ?? null };
}

function isUploading(uploads: UploadedImage[]): boolean {
  return uploads.some((img) => img.status === "uploading" || img.status === "pending");
}

export function TransformationsManager({
  entityName,
  initialItems,
  saveAction,
}: TransformationsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [formOpen, setFormOpen] = useState(initialItems.length === 0);
  const [clientName, setClientName] = useState("");
  const [story, setStory] = useState("");
  const [beforeImages, setBeforeImages] = useState<UploadedImage[]>([]);
  const [afterImages, setAfterImages] = useState<UploadedImage[]>([]);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const atMaxItems = items.length >= TRANSFORMATION_MAX_ITEMS;
  const storyWordCount = countTransformationWords(story);
  const beforeUploaded = getUploadedImage(beforeImages);
  const afterUploaded = getUploadedImage(afterImages);
  const uploadsInProgress = isUploading(beforeImages) || isUploading(afterImages);
  const hasItems = items.length > 0;

  function resetDraft() {
    setClientName("");
    setStory("");
    setBeforeImages([]);
    setAfterImages([]);
    setDraftError(null);
  }

  function persistItems(nextItems: TransformationItem[]) {
    const previous = items;
    setItems(nextItems);
    setFormError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await saveAction(nextItems);
      if (!result.success) {
        setFormError(result.error);
        setItems(previous);
        return;
      }
      setSuccessMessage("Saved to your public profile.");
      router.refresh();
      window.setTimeout(() => setSuccessMessage(null), 3000);
    });
  }

  function addItem() {
    const trimmedStory = story.trim();
    if (!trimmedStory) {
      setDraftError("Client story is required.");
      return;
    }
    if (!isTransformationStoryWithinLimits(trimmedStory)) {
      setDraftError(
        `Story is limited to ${TRANSFORMATION_STORY_MAX_WORDS} words and ${TRANSFORMATION_STORY_MAX_CHARS} characters.`
      );
      return;
    }
    if (!beforeUploaded || !afterUploaded) {
      setDraftError("Both before and after photos are required.");
      return;
    }
    if (atMaxItems) {
      setDraftError(`Maximum ${TRANSFORMATION_MAX_ITEMS} transformations allowed.`);
      return;
    }
    if (uploadsInProgress) {
      setDraftError("Please wait for photo uploads to finish.");
      return;
    }

    const nextItems: TransformationItem[] = [
      ...items,
      {
        id: crypto.randomUUID(),
        clientName: clientName.trim() || null,
        story: trimmedStory,
        beforeImageUrl: beforeUploaded.url,
        beforeCloudinaryId: beforeUploaded.publicId,
        afterImageUrl: afterUploaded.url,
        afterCloudinaryId: afterUploaded.publicId,
      },
    ];

    resetDraft();
    setFormOpen(false);
    persistItems(nextItems);
  }

  function removeItem(id: string) {
    persistItems(items.filter((item) => item.id !== id));
  }

  function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [item] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);
    persistItems(reordered);
  }

  const addForm = (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[var(--text)]">
          Add Transformation
        </label>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Before → After → Client Story. Use real client photos (with permission).
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
          Client name <span className="font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => {
            if (e.target.value.length <= TRANSFORMATION_CLIENT_NAME_MAX_CHARS) {
              setClientName(e.target.value);
              setDraftError(null);
            }
          }}
          disabled={atMaxItems || isPending}
          placeholder="e.g. Ahmed K."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
          Client story <span className="text-[#FF6A3D]">*</span>
        </label>
        <textarea
          value={story}
          onChange={(e) => {
            const value = e.target.value;
            if (!isTransformationStoryWithinLimits(value) && value.length > story.length) return;
            setStory(value);
            setDraftError(null);
          }}
          disabled={atMaxItems || isPending}
          rows={4}
          placeholder="What was their goal? How long did it take? What changed for them?"
          className={cn(inputClass, "resize-y min-h-[100px]")}
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {storyWordCount} / {TRANSFORMATION_STORY_MAX_WORDS} words · {story.length} /{" "}
          {TRANSFORMATION_STORY_MAX_CHARS} characters
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploader
          label="Before photo *"
          description="Starting point — progress photo or candid."
          images={beforeImages}
          onChange={setBeforeImages}
          multiple={false}
          maxImages={1}
          uploadType="transformation"
          authMode="cookie"
          previewAspect="portrait"
          fullWidth
        />
        <ImageUploader
          label="After photo *"
          description="Result — same angle/lighting works best."
          images={afterImages}
          onChange={setAfterImages}
          multiple={false}
          maxImages={1}
          uploadType="transformation"
          authMode="cookie"
          previewAspect="portrait"
          fullWidth
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasItems && (
          <button
            type="button"
            onClick={() => {
              resetDraft();
              setFormOpen(false);
            }}
            disabled={isPending}
            className="px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={addItem}
          disabled={
            isPending ||
            atMaxItems ||
            !story.trim() ||
            !beforeUploaded ||
            !afterUploaded ||
            uploadsInProgress
          }
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add to gallery
        </button>
      </div>

      {draftError && <p className="text-xs text-red-600">{draftError}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            Transformations for{" "}
            <span className="font-medium text-[var(--text)]">{entityName}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {items.length} / {TRANSFORMATION_MAX_ITEMS} stories · shown on your public profile
          </p>
          <p className="mt-2 text-sm text-[#FF6A3D] font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 shrink-0" />
            People buy results.
          </p>
        </div>
        {isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving…
          </span>
        )}
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {formError}
        </div>
      )}

      {successMessage && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
          {successMessage}
        </div>
      )}

      {hasItems ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 overflow-visible p-4 bg-white border border-[var(--border)] rounded-xl min-w-0 sm:flex-row sm:items-start"
            >
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-[var(--border)]">
                  <Image
                    src={optimizedImageUrl(item.beforeImageUrl, { width: 120, height: 160 })}
                    alt="Before"
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                  <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                    B
                  </span>
                </div>
                <ArrowDown className="w-3 h-3 text-[#FF6A3D] shrink-0" />
                <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-[var(--border)]">
                  <Image
                    src={optimizedImageUrl(item.afterImageUrl, { width: 120, height: 160 })}
                    alt="After"
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                  <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                    A
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {item.clientName && (
                  <p className="text-sm font-semibold text-[var(--text)] truncate">
                    {item.clientName}
                  </p>
                )}
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mt-0.5">
                  {item.story}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 self-end sm:self-start overflow-visible">
                <Tooltip label="Move up" side="top">
                  <button
                    type="button"
                    disabled={index === 0 || isPending}
                    onClick={() => moveItem(index, "up")}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip label="Move down" side="top">
                  <button
                    type="button"
                    disabled={index === items.length - 1 || isPending}
                    onClick={() => moveItem(index, "down")}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip label="Delete transformation" side="top" variant="danger">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete transformation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !formOpen && (
          <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-[#0B2545]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Images className="w-7 h-7 text-[#0B2545]" />
            </div>
            <p className="font-heading font-bold text-[var(--text)] mb-2">No transformations yet</p>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
              Showcase real before-and-after results with each client&apos;s story.
            </p>
          </div>
        )
      )}

      {hasItems && !formOpen && !atMaxItems && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--text)] rounded-xl hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D] transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add another transformation
        </button>
      )}

      {formOpen && addForm}
    </div>
  );
}

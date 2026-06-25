"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { EquipmentItemImageCell } from "@/components/owner/equipment/EquipmentItemImageCell";
import { updateGymEquipment } from "@/app/actions/owner/gym-equipment";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  GYM_EQUIPMENT_ITEM_MAX_CHARS,
  GYM_EQUIPMENT_ITEM_MAX_WORDS,
  GYM_EQUIPMENT_MAX_ITEMS,
  countEquipmentWords,
  isEquipmentItemWithinLimits,
  type GymEquipmentItem,
} from "@/lib/gym-equipment";
import { cn } from "@/lib/utils";

interface GymEquipmentManagerProps {
  gymName: string;
  initialItems: GymEquipmentItem[];
}

const inputClass =
  "w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";

export function GymEquipmentManager({ gymName, initialItems }: GymEquipmentManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("");
  const [draftImage, setDraftImage] = useState<UploadedImage[]>([]);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const charCount = draft.length;
  const wordCount = countEquipmentWords(draft);
  const atMaxItems = items.length >= GYM_EQUIPMENT_MAX_ITEMS;
  const imageUploading = draftImage.some(
    (img) => img.status === "uploading" || img.status === "pending"
  );
  const uploadedDraftImage = draftImage.find((img) => img.status === "uploaded");

  function handleDraftChange(value: string) {
    if (value.length > GYM_EQUIPMENT_ITEM_MAX_CHARS) return;
    if (!isEquipmentItemWithinLimits(value)) return;
    setDraft(value);
    setDraftError(null);
    setSuccessMessage(null);
  }

  function addItem() {
    const name = draft.trim();
    if (!name) {
      setDraftError("Enter equipment name before adding.");
      return;
    }
    if (!isEquipmentItemWithinLimits(name)) {
      setDraftError(
        `Each item is limited to ${GYM_EQUIPMENT_ITEM_MAX_WORDS} words and ${GYM_EQUIPMENT_ITEM_MAX_CHARS} characters.`
      );
      return;
    }
    if (atMaxItems) {
      setDraftError(`Maximum ${GYM_EQUIPMENT_MAX_ITEMS} items allowed.`);
      return;
    }
    if (imageUploading) {
      setDraftError("Please wait for the photo upload to finish.");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        imageUrl: uploadedDraftImage?.imageUrl ?? null,
        cloudinaryId: uploadedDraftImage?.publicId ?? null,
      },
    ]);
    setDraft("");
    setDraftImage([]);
    setDraftError(null);
    setSuccessMessage(null);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSuccessMessage(null);
  }

  function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [item] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);
    setItems(reordered);
    setSuccessMessage(null);
  }

  function updateItemImage(id: string, imageUrl: string | null, cloudinaryId: string | null) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, imageUrl, cloudinaryId } : item
      )
    );
    setSuccessMessage(null);
  }

  function handleSave() {
    setFormError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateGymEquipment(items);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setSuccessMessage("Equipment list saved. It is now visible on your public page.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--text-muted)]">
          Equipment at <span className="font-medium text-[var(--text)]">{gymName}</span>
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {items.length} / {GYM_EQUIPMENT_MAX_ITEMS} items · shown on your gym detail page
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <label className="block text-sm font-semibold text-[var(--text)]">
          Add Equipment{" "}
          <span className="font-normal text-[var(--text-muted)]">
            (max {GYM_EQUIPMENT_ITEM_MAX_WORDS} words / {GYM_EQUIPMENT_ITEM_MAX_CHARS} chars each)
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
            placeholder="e.g. Treadmills, Squat Racks, Heavy Bags"
            className={cn(inputClass, draftError && "border-red-300")}
          />
          <button
            type="button"
            onClick={addItem}
            disabled={atMaxItems || !draft.trim() || imageUploading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <ImageUploader
          label="Equipment Photo (optional)"
          description="Add a photo so visitors can see this equipment on your gym page."
          images={draftImage}
          onChange={setDraftImage}
          multiple={false}
          maxImages={1}
          uploadType="equipment"
          authMode="cookie"
          previewAspect="square"
          fullWidth
          className="w-full"
        />

        <p className="text-xs text-[var(--text-muted)]">
          {wordCount} / {GYM_EQUIPMENT_ITEM_MAX_WORDS} words · {charCount} /{" "}
          {GYM_EQUIPMENT_ITEM_MAX_CHARS} characters
        </p>
        {draftError && <p className="text-xs text-red-600">{draftError}</p>}
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

      {items.length === 0 ? (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-[#0B2545]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7 text-[#0B2545]" />
          </div>
          <p className="font-heading font-bold text-[var(--text)] mb-2">No equipment listed yet</p>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
            Add treadmills, weights, boxing gear, and other equipment so visitors know what your gym offers.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-3 bg-white border border-[var(--border)] rounded-xl min-w-0"
            >
              <Dumbbell className="w-4 h-4 text-[#FF6A3D] shrink-0" />
              <span className="flex-1 min-w-0 text-sm font-medium text-[var(--text)] truncate">
                {item.name}
              </span>
              <EquipmentItemImageCell
                name={item.name}
                imageUrl={item.imageUrl}
                disabled={isPending}
                onChange={(imageUrl, cloudinaryId) =>
                  updateItemImage(item.id, imageUrl, cloudinaryId)
                }
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0 || isPending}
                  onClick={() => moveItem(index, "up")}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1 || isPending}
                  onClick={() => moveItem(index, "down")}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Equipment List
      </button>
    </div>
  );
}

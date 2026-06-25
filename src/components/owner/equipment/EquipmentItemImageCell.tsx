"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImageWithProgress } from "@/lib/client-image-upload";
import { cn } from "@/lib/utils";

interface EquipmentItemImageCellProps {
  name: string;
  imageUrl?: string | null;
  disabled?: boolean;
  onChange: (imageUrl: string | null, cloudinaryId: string | null) => void;
}

export function EquipmentItemImageCell({
  name,
  imageUrl,
  disabled = false,
  onChange,
}: EquipmentItemImageCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImageWithProgress(file, "equipment", () => {}, "cookie");
      onChange(result.secure_url, result.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)] transition-colors",
          !disabled && !uploading && "hover:border-[#FF6A3D]/40 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label={imageUrl ? `Change photo for ${name}` : `Add photo for ${name}`}
        title={imageUrl ? "Change photo" : "Add photo"}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#FF6A3D]" />
        ) : imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="40px" unoptimized />
        ) : (
          <ImagePlus className="h-4 w-4 text-[var(--text-muted)]" />
        )}
      </button>
      {error && <p className="sr-only">{error}</p>}
    </div>
  );
}

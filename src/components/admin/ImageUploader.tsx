"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/lib/gym-images-form";

export type { UploadedImage } from "@/lib/gym-images-form";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";

interface ImageUploaderProps {
  label:        string;
  description?: string;
  images:       UploadedImage[];
  onChange:     (images: UploadedImage[]) => void;
  multiple?:    boolean;
  maxImages?:   number;
  uploadType:   "cover" | "gallery" | "coach" | "coach_cert" | "event_cover";
  className?:   string;
  authMode?:    "admin-secret" | "cookie";
  /** Square/portrait preview for profile photos (single upload) */
  previewAspect?: "video" | "square" | "portrait";
  centered?: boolean;
  replaceLabel?: string;
}

function uploadWithProgress(
  file: File,
  type: "cover" | "gallery" | "coach" | "coach_cert" | "event_cover",
  onProgress: (pct: number) => void,
  authMode: "admin-secret" | "cookie" = "admin-secret"
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("POST", "/api/admin/upload");
    if (authMode === "admin-secret") {
      xhr.setRequestHeader("x-admin-secret", ADMIN_SECRET);
    }
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}

export function ImageUploader({
  label,
  description,
  images,
  onChange,
  multiple = true,
  maxImages = 10,
  uploadType,
  className,
  authMode = "admin-secret",
  previewAspect = "video",
  centered = false,
  replaceLabel = "Replace cover image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const canAddMore = multiple ? images.length < maxImages : images.length === 0;

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArray.length === 0) return;

      const slots = multiple ? maxImages - images.length : 1;
      const toUpload = fileArray.slice(0, slots);

      const pending: UploadedImage[] = toUpload.map((file) => ({
        imageUrl: "",
        preview:  URL.createObjectURL(file),
        status:   "pending",
        progress: 0,
      }));

      let current = multiple ? [...images, ...pending] : pending;
      onChange(current);

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const idx  = multiple ? images.length + i : 0;

        current = current.map((img, j) =>
          j === idx ? { ...img, status: "uploading" as const, progress: 0 } : img
        );
        onChange([...current]);

        try {
          const result = await uploadWithProgress(file, uploadType, (pct) => {
            current = current.map((img, j) =>
              j === idx ? { ...img, progress: pct } : img
            );
            onChange([...current]);
          }, authMode);

          current = current.map((img, j) =>
            j === idx
              ? {
                  ...img,
                  imageUrl: result.secure_url,
                  publicId:  result.public_id,
                  status:    "uploaded" as const,
                  progress:  100,
                }
              : img
          );
          onChange([...current]);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          current = current.map((img, j) =>
            j === idx ? { ...img, status: "error" as const, error: message } : img
          );
          onChange([...current]);
        }
      }
    },
    [images, maxImages, multiple, onChange, uploadType, authMode]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!canAddMore) return;
      uploadFiles(e.dataTransfer.files);
    },
    [canAddMore, uploadFiles]
  );

  const removeImage = async (index: number) => {
    const img = images[index];
    if (img.publicId && img.status === "uploaded") {
      try {
        await fetch("/api/admin/images", {
          method:  "DELETE",
          headers: authMode === "admin-secret"
            ? { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET }
            : { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ publicId: img.publicId }),
        });
      } catch {
        // Best-effort; DB sync will handle orphans on save
      }
    }
    if (img.preview) URL.revokeObjectURL(img.preview);
    onChange(images.filter((_, i) => i !== index));
  };

  const displaySrc = (img: UploadedImage) => img.preview || img.imageUrl;

  const aspectClass =
    previewAspect === "square"
      ? "aspect-square"
      : previewAspect === "portrait"
        ? "aspect-[3/4]"
        : "aspect-video";

  const singlePreviewWidth = centered ? "w-full max-w-[220px] mx-auto" : "w-full max-w-2xl";

  return (
    <div className={className}>
      <div className="mb-3">
        <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div
          className={cn(
            "mb-4 gap-3",
            multiple ? "grid grid-cols-2 sm:grid-cols-3 w-full" : singlePreviewWidth
          )}
        >
          {images.map((img, i) => (
            <div
              key={img.id ?? img.publicId ?? img.preview ?? i}
              className={cn(
                "relative group rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg)]",
                !multiple ? cn(aspectClass, "w-full") : aspectClass
              )}
            >
              {displaySrc(img) ? (
                <Image
                  src={displaySrc(img)}
                  alt={`Upload ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
                </div>
              )}

              {img.status === "uploading" && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6A3D] transition-all duration-200"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white mt-1 text-center">{img.progress}%</p>
                </div>
              )}

              {img.status === "error" && (
                <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-2">
                  <p className="text-[10px] text-white text-center">{img.error}</p>
                </div>
              )}

              {img.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {uploadType === "cover" && img.status === "uploaded" && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#FF6A3D] text-white text-[10px] font-bold rounded-md">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {!multiple && images.length > 0 && images[0].status === "uploaded" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mb-4 text-sm font-medium text-[#FF6A3D] hover:underline",
            centered && "mx-auto block"
          )}
        >
          {replaceLabel}
        </button>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors w-full",
            !multiple && (centered ? "max-w-[220px] mx-auto" : "max-w-2xl"),
            dragging
              ? "border-[#FF6A3D] bg-[#FF6A3D]/5"
              : "border-[var(--border)] hover:border-[#FF6A3D]/50 hover:bg-[var(--bg)]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
            {dragging ? (
              <Upload className="w-5 h-5 text-[#FF6A3D]" />
            ) : (
              <ImagePlus className="w-5 h-5 text-[var(--text-muted)]" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text)]">
              Drag & drop images here
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              or click to browse · JPEG, PNG, WebP · max 10 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

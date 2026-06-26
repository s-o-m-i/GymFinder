"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  draftPhotoToUploadedImages,
  loadTrainerProfileDraft,
  saveTrainerProfileDraft,
} from "@/lib/trainer-profile-draft";

interface UseTrainerProfileDraftOptions {
  accountEmail: string;
  enabled: boolean;
}

export function useTrainerProfileDraft({ accountEmail, enabled }: UseTrainerProfileDraftOptions) {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveLabel, setSaveLabel] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!lastSavedAt) return;
    setSaveLabel("Saved just now");
    const timer = setTimeout(() => setSaveLabel(formatRelativeSave(lastSavedAt)), 5000);
    return () => clearTimeout(timer);
  }, [lastSavedAt]);

  const restoreDraft = useCallback((): {
    values: TrainerProfileFormValues;
    photo: UploadedImage[];
    currentStep: number;
  } | null => {
    if (restoredRef.current || !enabled) return null;
    restoredRef.current = true;
    const draft = loadTrainerProfileDraft(accountEmail);
    if (!draft) return null;
    setLastSavedAt(new Date(draft.savedAt));
    setSaveLabel(formatRelativeSave(new Date(draft.savedAt)));
    return {
      values: draft.values,
      photo: draftPhotoToUploadedImages(draft.photo),
      currentStep: draft.currentStep,
    };
  }, [accountEmail, enabled]);

  const scheduleSave = useCallback(
    (values: TrainerProfileFormValues, photo: UploadedImage[], currentStep: number) => {
      if (!enabled) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveTrainerProfileDraft(accountEmail, {
          currentStep,
          values,
          photo: photo.map((p) => ({
            imageUrl: p.imageUrl,
            publicId: p.publicId,
            status: p.status,
            progress: p.progress,
          })),
        });
        setLastSavedAt(new Date());
      }, 600);
    },
    [accountEmail, enabled]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { restoreDraft, scheduleSave, saveLabel };
}

function formatRelativeSave(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  return `Saved at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSuccessStory } from "@/app/actions/success-story/stories";

interface DeleteSuccessStoryButtonProps {
  storyId: string;
}

export function DeleteSuccessStoryButton({ storyId }: DeleteSuccessStoryButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this success story? This cannot be undone.")) return;
        startTransition(async () => {
          await deleteSuccessStory(storyId);
        });
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
}

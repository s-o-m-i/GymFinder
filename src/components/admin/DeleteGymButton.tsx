"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteGymButtonProps {
  gymId: string;
  gymName: string;
}

export function DeleteGymButton({ gymId, gymName }: DeleteGymButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${gymName}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/gyms/${gymId}`, {
        method: "DELETE",
        headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete gym. Check console for details.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      Delete
    </button>
  );
}

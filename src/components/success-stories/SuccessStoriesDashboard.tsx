import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { SuccessStoryCard } from "@/services/success-story/success-story.service";
import type { SuccessStoryStats } from "@/lib/success-stories/types";
import { getSuccessStoryPath } from "@/lib/success-stories-routes";
import { DeleteSuccessStoryButton } from "@/components/success-stories/DeleteSuccessStoryButton";

interface SuccessStoriesDashboardProps {
  stats: SuccessStoryStats;
  stories: SuccessStoryCard[];
  createPath: string;
  editPathPrefix: string;
}

export function SuccessStoriesDashboard({
  stats,
  stories,
  createPath,
  editPathPrefix,
}: SuccessStoriesDashboardProps) {
  const statCards = [
    { label: "Total", value: stats.total },
    { label: "Published", value: stats.published },
    { label: "Draft", value: stats.draft },
    { label: "Featured", value: stats.featured },
    { label: "Verified", value: stats.verified },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text)]">My Success Stories</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Share real fitness journeys and link them to trainers and gyms.
          </p>
        </div>
        <Link
          href={createPath}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85528]"
        >
          <Plus className="h-4 w-4" />
          Create story
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#0B2545]">{card.value}</p>
            <p className="text-xs font-medium text-[var(--text-muted)]">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg)] text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden sm:table-cell">Client</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--text-muted)]">
                  No stories yet. Create your first success story.
                </td>
              </tr>
            ) : (
              stories.map((story) => (
                <tr key={story.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{story.title}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[var(--text-muted)]">
                    {story.clientName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-xs font-semibold capitalize">
                      {story.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {story.status === "PUBLISHED" && (
                        <Link
                          href={getSuccessStoryPath(story.slug)}
                          className="text-xs font-semibold text-[#FF6A3D] hover:underline"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`${editPathPrefix}/${story.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold hover:border-[#FF6A3D]/40"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <DeleteSuccessStoryButton storyId={story.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

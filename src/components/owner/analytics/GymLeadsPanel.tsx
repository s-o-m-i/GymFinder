import type { GymLeadStats } from "@/services/gym-lead.service";
import { gymLeadGoalLabel, resolveLeadGoalLabel } from "@/lib/gym-leads";
import { UserPlus } from "lucide-react";

interface GymLeadsPanelProps {
  leads: GymLeadStats;
}

function formatLeadDate(date: Date) {
  return new Date(date).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GymLeadsPanel({ leads }: GymLeadsPanelProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-5 h-5 text-[#FF6A3D]" />
        <h3 className="font-heading font-bold text-[var(--text)]">WhatsApp Lead Captures</h3>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Visitors who shared their name and goal before messaging you on WhatsApp.
      </p>

      <p className="font-heading font-bold text-2xl text-[#0B2545] tabular-nums mb-4">
        {leads.total.toLocaleString()}{" "}
        <span className="text-sm font-medium text-[var(--text-muted)]">leads</span>
      </p>

      {leads.byGoal.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {leads.byGoal.map((row) => (
            <span
              key={row.goal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--text)]"
            >
              {gymLeadGoalLabel(row.goal)}
              <span className="font-bold text-[#FF6A3D]">{row.count}</span>
            </span>
          ))}
        </div>
      )}

      {leads.recent.length > 0 ? (
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
          {leads.recent.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between gap-3 bg-[var(--bg)] px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">{lead.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {resolveLeadGoalLabel(lead.goal, lead.customGoal)}
                </p>
              </div>
              <time className="shrink-0 text-xs text-[var(--text-muted)]">
                {formatLeadDate(lead.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--text-muted)] rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center">
          No leads captured yet for this period. They appear when visitors use WhatsApp Gym on your
          public profile.
        </p>
      )}
    </div>
  );
}

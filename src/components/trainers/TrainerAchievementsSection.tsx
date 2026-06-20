import { Trophy } from "lucide-react";
import type { StaffAchievementItem } from "@/lib/staff-members";

interface TrainerAchievementsSectionProps {
  achievements: StaffAchievementItem[];
}

export function TrainerAchievementsSection({ achievements }: TrainerAchievementsSectionProps) {
  if (achievements.length === 0) return null;

  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-[#FF6A3D]" />
        <h2 className="font-heading font-bold text-lg text-[var(--text)]">Achievements</h2>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <li
            key={achievement.id}
            className="flex items-start gap-3 p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF6A3D]/10 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-[#FF6A3D]" />
            </div>
            <span className="text-sm text-[var(--text)] leading-relaxed pt-1.5 break-words">
              {achievement.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

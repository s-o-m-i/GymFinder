"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { StaffMember } from "@prisma/client";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCircle,
} from "lucide-react";
import { StaffMemberForm } from "@/components/owner/staff/StaffMemberForm";
import {
  deleteStaffMember,
  reorderStaffMembers,
} from "@/app/actions/owner/staff-members";
import { cn } from "@/lib/utils";

interface StaffMembersManagerProps {
  gymName: string;
  initialMembers: StaffMember[];
}

export function StaffMembersManager({ gymName, initialMembers }: StaffMembersManagerProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  function openCreate() {
    setEditingMember(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(member: StaffMember) {
    setEditingMember(member);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMember(null);
  }

  function handleFormSuccess() {
    closeForm();
    router.refresh();
  }

  async function handleDelete(member: StaffMember) {
    if (!confirm(`Remove ${member.fullName} from your team?`)) return;

    setDeletingId(member.id);
    setError(null);

    startTransition(async () => {
      const result = await deleteStaffMember(member.id);
      if (!result.success) {
        setError(result.error);
        setDeletingId(null);
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      if (editingMember?.id === member.id) closeForm();
      setDeletingId(null);
      router.refresh();
    });
  }

  async function moveMember(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const reordered = [...members];
    const [item] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);

    setMembers(reordered);
    setReordering(true);
    setError(null);

    const result = await reorderStaffMembers(reordered.map((m) => m.id));
    setReordering(false);

    if (!result.success) {
      setError(result.error);
      setMembers(initialMembers);
      router.refresh();
    }
  }

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[var(--text-muted)]">
            Team at <span className="font-medium text-[var(--text)]">{gymName}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {members.length} member{members.length === 1 ? "" : "s"} · Drag order with arrows
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF6A3D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e85528] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {showForm && (
        <div className="mx-auto w-full max-w-2xl">
          <StaffMemberForm
            member={editingMember ?? undefined}
            onCancel={closeForm}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {members.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-10">
          <div className="w-14 h-14 bg-[#0B2545]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-7 h-7 text-[#0B2545]" />
          </div>
          <p className="font-heading font-bold text-[var(--text)] mb-2">No team members yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-5 max-w-sm mx-auto">
            Add coaches and staff so visitors can meet your team on your public gym page.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Member
          </button>
        </div>
      ) : (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:gap-4">
          {members.map((member, index) => (
            <article
              key={member.id}
              className={cn(
                "flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5",
                !member.isActive && "opacity-70"
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] sm:h-20 sm:w-20">
                  {member.profileImage ? (
                    <Image
                      src={member.profileImage}
                      alt={member.fullName}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UserCircle className="h-10 w-10 text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-base font-bold leading-snug break-words text-[var(--text)] sm:text-lg">
                    {member.fullName}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {member.isCoach && (
                      <span className="rounded-md bg-[#FF6A3D]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FF6A3D]">
                        Coach
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        member.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {member.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 min-w-0 space-y-1">
                <p className="text-sm font-medium leading-snug break-words text-[#0B2545]">
                  {member.designation}
                </p>
                {member.yearsExperience !== null && (
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                    {member.yearsExperience} year{member.yearsExperience === 1 ? "" : "s"} experience
                  </p>
                )}
                {member.specialization && (
                  <p className="text-xs leading-relaxed break-words text-[var(--text-muted)]">
                    {member.specialization}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={index === 0 || reordering || isPending}
                    onClick={() => moveMember(index, "up")}
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === members.length - 1 || reordering || isPending}
                    onClick={() => moveMember(index, "down")}
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(member)}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)]"
                    aria-label={`Edit ${member.fullName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member)}
                    disabled={deletingId === member.id || isPending}
                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Delete ${member.fullName}`}
                  >
                    {deletingId === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

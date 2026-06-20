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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            Team at <span className="font-medium text-[var(--text)]">{gymName}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {members.length} member{members.length === 1 ? "" : "s"} · Drag order with arrows
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <Plus className="w-4 h-4" />
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
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
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
        <div className="grid gap-4">
          {members.map((member, index) => (
            <div
              key={member.id}
              className={cn(
                "bg-white border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm",
                !member.isActive && "opacity-70"
              )}
            >
              <div className="flex gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--border)]">
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
                      <UserCircle className="w-10 h-10 text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-[var(--text)]">
                          {member.fullName}
                        </h3>
                        {member.isCoach && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#FF6A3D]/10 text-[#FF6A3D] rounded-md">
                            Coach
                          </span>
                        )}
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md",
                            member.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {member.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-sm text-[#0B2545] font-medium mt-0.5">
                        {member.designation}
                      </p>
                      {member.yearsExperience !== null && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {member.yearsExperience} year{member.yearsExperience === 1 ? "" : "s"} experience
                        </p>
                      )}
                      {member.specialization && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {member.specialization}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex flex-col mr-1">
                        <button
                          type="button"
                          disabled={index === 0 || reordering || isPending}
                          onClick={() => moveMember(index, "up")}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === members.length - 1 || reordering || isPending}
                          onClick={() => moveMember(index, "down")}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEdit(member)}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                        aria-label={`Edit ${member.fullName}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member)}
                        disabled={deletingId === member.id || isPending}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label={`Delete ${member.fullName}`}
                      >
                        {deletingId === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

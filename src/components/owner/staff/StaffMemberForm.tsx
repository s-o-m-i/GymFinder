"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StaffMember } from "@prisma/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  createStaffMember,
  updateStaffMember,
} from "@/app/actions/owner/staff-members";
import { AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STAFF_BIO_MAX_CHARS,
  STAFF_BIO_MAX_WORDS,
  countStaffBioWords,
  isStaffBioWithinLimits,
  parseAchievements,
  parseCertifications,
  type StaffAchievementItem,
  type StaffCertificationItem,
} from "@/lib/staff-members";
import {
  StaffAchievementsField,
  StaffCertificationsField,
} from "@/components/owner/staff/StaffListFields";

export type StaffMemberFormState = {
  fullName: string;
  designation: string;
  bio: string;
  yearsExperience: string;
  specialization: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  isCoach: boolean;
  isActive: boolean;
};

export const EMPTY_STAFF_FORM: StaffMemberFormState = {
  fullName: "",
  designation: "",
  bio: "",
  yearsExperience: "",
  specialization: "",
  instagramUrl: "",
  facebookUrl: "",
  linkedinUrl: "",
  isCoach: true,
  isActive: true,
};

function staffToForm(member: StaffMember): StaffMemberFormState {
  return {
    fullName: member.fullName,
    designation: member.designation,
    bio: member.bio ?? "",
    yearsExperience:
      member.yearsExperience !== null ? String(member.yearsExperience) : "",
    specialization: member.specialization ?? "",
    instagramUrl: member.instagramUrl ?? "",
    facebookUrl: member.facebookUrl ?? "",
    linkedinUrl: member.linkedinUrl ?? "",
    isCoach: member.isCoach,
    isActive: member.isActive,
  };
}

interface StaffMemberFormProps {
  member?: StaffMember;
  onCancel: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";
const labelClass = "block text-sm font-semibold text-[var(--text)] mb-1.5";

export function StaffMemberForm({ member, onCancel, onSuccess }: StaffMemberFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StaffMemberFormState>(
    member ? staffToForm(member) : EMPTY_STAFF_FORM
  );
  const [certifications, setCertifications] = useState<StaffCertificationItem[]>(() =>
    member ? parseCertifications(member.certifications) : []
  );
  const [achievements, setAchievements] = useState<StaffAchievementItem[]>(() =>
    member ? parseAchievements(member.achievements) : []
  );
  const [photo, setPhoto] = useState<UploadedImage[]>(() =>
    member?.profileImage
      ? [
          {
            imageUrl: member.profileImage,
            publicId: member.cloudinaryId ?? undefined,
            status: "uploaded",
            progress: 100,
          },
        ]
      : []
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (member) {
      setForm(staffToForm(member));
      setCertifications(parseCertifications(member.certifications));
      setAchievements(parseAchievements(member.achievements));
      setPhoto(
        member.profileImage
          ? [
              {
                imageUrl: member.profileImage,
                publicId: member.cloudinaryId ?? undefined,
                status: "uploaded",
                progress: 100,
              },
            ]
          : []
      );
    }
  }, [member]);

  const uploadedPhoto = photo.find((p) => p.status === "uploaded");

  function setField<K extends keyof StaffMemberFormState>(
    key: K,
    value: StaffMemberFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleBioChange(value: string) {
    if (value.length > STAFF_BIO_MAX_CHARS) return;
    if (!isStaffBioWithinLimits(value)) return;
    setField("bio", value);
  }

  const bioCharCount = form.bio.length;
  const bioWordCount = countStaffBioWords(form.bio);
  const bioCharsNearLimit = bioCharCount >= STAFF_BIO_MAX_CHARS * 0.9;
  const bioWordsNearLimit = bioWordCount >= STAFF_BIO_MAX_WORDS * 0.9;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (photo.some((p) => p.status === "uploading" || p.status === "pending")) {
      setFormError("Please wait for the photo upload to finish.");
      return;
    }

    const payload = {
      ...form,
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
      profileImage: uploadedPhoto?.imageUrl ?? null,
      cloudinaryId: uploadedPhoto?.publicId ?? null,
      certifications,
      achievements,
    };

    startTransition(async () => {
      const result = member
        ? await updateStaffMember(member.id, payload)
        : await createStaffMember(payload);

      if (!result.success) {
        setFormError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      router.refresh();
      onSuccess();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5 mx-auto w-full"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-bold text-lg text-[var(--text)]">
          {member ? "Edit Team Member" : "Add Team Member"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {(formError || fieldErrors._form) && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {formError ?? fieldErrors._form}
        </div>
      )}

      <ImageUploader
        label="Profile Photo"
        description="Square or portrait photos work best. JPEG, PNG, or WebP up to 10 MB."
        images={photo}
        onChange={setPhoto}
        multiple={false}
        maxImages={1}
        uploadType="coach"
        authMode="cookie"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="e.g. Ahmed Khan"
            className={cn(inputClass, fieldErrors.fullName && "border-red-300")}
          />
          {fieldErrors.fullName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.designation}
            onChange={(e) => setField("designation", e.target.value)}
            placeholder="e.g. Head Coach, Front Desk Manager"
            className={cn(inputClass, fieldErrors.designation && "border-red-300")}
          />
          {fieldErrors.designation && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.designation}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Years of Experience</label>
          <input
            type="number"
            min={0}
            max={80}
            value={form.yearsExperience}
            onChange={(e) => setField("yearsExperience", e.target.value)}
            placeholder="e.g. 8"
            className={cn(inputClass, fieldErrors.yearsExperience && "border-red-300")}
          />
          {fieldErrors.yearsExperience && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.yearsExperience}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Specialization</label>
          <input
            type="text"
            value={form.specialization}
            onChange={(e) => setField("specialization", e.target.value)}
            placeholder="e.g. Boxing, Strength Training"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            Bio{" "}
            <span className="font-normal text-[var(--text-muted)]">
              (max {STAFF_BIO_MAX_WORDS} words, {STAFF_BIO_MAX_CHARS} characters)
            </span>
          </label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => handleBioChange(e.target.value)}
            maxLength={STAFF_BIO_MAX_CHARS}
            placeholder="Brief background, coaching philosophy, or role at the gym…"
            className={cn(
              inputClass,
              "resize-none",
              fieldErrors.bio && "border-red-300"
            )}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
            <p
              className={cn(
                "text-xs",
                fieldErrors.bio
                  ? "text-red-600"
                  : bioCharsNearLimit || bioWordsNearLimit
                    ? "text-amber-600"
                    : "text-[var(--text-muted)]"
              )}
            >
              {bioWordCount} / {STAFF_BIO_MAX_WORDS} words · {bioCharCount} /{" "}
              {STAFF_BIO_MAX_CHARS} characters
            </p>
          </div>
          {fieldErrors.bio && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.bio}</p>
          )}
        </div>

        <StaffCertificationsField
          items={certifications}
          onChange={setCertifications}
          error={fieldErrors.certifications}
        />

        <StaffAchievementsField
          items={achievements}
          onChange={setAchievements}
          error={fieldErrors.achievements}
        />

        <div>
          <label className={labelClass}>Instagram URL</label>
          <input
            type="url"
            value={form.instagramUrl}
            onChange={(e) => setField("instagramUrl", e.target.value)}
            placeholder="https://instagram.com/..."
            className={cn(inputClass, fieldErrors.instagramUrl && "border-red-300")}
          />
          {fieldErrors.instagramUrl && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.instagramUrl}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Facebook URL</label>
          <input
            type="url"
            value={form.facebookUrl}
            onChange={(e) => setField("facebookUrl", e.target.value)}
            placeholder="https://facebook.com/..."
            className={cn(inputClass, fieldErrors.facebookUrl && "border-red-300")}
          />
          {fieldErrors.facebookUrl && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.facebookUrl}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>LinkedIn URL</label>
          <input
            type="url"
            value={form.linkedinUrl}
            onChange={(e) => setField("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={cn(inputClass, fieldErrors.linkedinUrl && "border-red-300")}
          />
          {fieldErrors.linkedinUrl && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.linkedinUrl}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-2 border-t border-[var(--border)]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isCoach}
            onChange={(e) => setField("isCoach", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--border)] text-[#FF6A3D] focus:ring-[#FF6A3D]/30"
          />
          <span className="text-sm font-medium text-[var(--text)]">Coach / Trainer</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--border)] text-[#FF6A3D] focus:ring-[#FF6A3D]/30"
          />
          <span className="text-sm font-medium text-[var(--text)]">Active (visible on public page)</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {member ? "Save Changes" : "Add Team Member"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-[var(--text-muted)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

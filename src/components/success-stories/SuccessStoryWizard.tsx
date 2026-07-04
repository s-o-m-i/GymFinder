"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Rocket, Save } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  SuccessStoryGender,
  SuccessStoryGoal,
  HeightUnit,
  WeightUnit,
} from "@prisma/client";
import {
  SUCCESS_STORY_GENDER_FORM_OPTIONS,
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_HEIGHT_UNIT_LABELS,
  type SuccessStoryFormInput,
} from "@/lib/success-stories/types";
import { EntitySearchSelect, type EntitySearchItem } from "@/components/success-stories/EntitySearchSelect";
import {
  publishSuccessStory,
  saveSuccessStoryDraft,
} from "@/app/actions/success-story/stories";
import { plainStoryLength } from "@/lib/success-stories/utils";
import { cn } from "@/lib/utils";

const STEPS = ["Basic Info", "Transformation", "Journey", "Connect", "Preview"] as const;

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20";

interface SuccessStoryWizardProps {
  storyId?: string;
  initialValues?: Partial<SuccessStoryFormInput>;
  initialLinkedGym?: EntitySearchItem | null;
  initialLinkedTrainer?: EntitySearchItem | null;
  dashboardPath: string;
}

function getUploaded(uploads: UploadedImage[]) {
  const img = uploads.find((u) => u.status === "uploaded");
  return img?.imageUrl ? { url: img.imageUrl, publicId: img.publicId ?? null } : null;
}

function urlToUploaded(url: string | null | undefined): UploadedImage[] {
  if (!url) return [];
  return [{ imageUrl: url, status: "uploaded", progress: 100 }];
}

export function SuccessStoryWizard({
  storyId,
  initialValues,
  initialLinkedGym = null,
  initialLinkedTrainer = null,
  dashboardPath,
}: SuccessStoryWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [clientName, setClientName] = useState(initialValues?.clientName ?? "");
  const [gender, setGender] = useState<SuccessStoryGender | "">(() => {
    const initial = initialValues?.gender;
    if (initial && initial !== SuccessStoryGender.PREFER_NOT_TO_SAY) return initial;
    return "";
  });
  const [city, setCity] = useState(initialValues?.city ?? CITIES[0]);
  const [goal, setGoal] = useState<SuccessStoryGoal>(
    initialValues?.goal ?? SuccessStoryGoal.WEIGHT_LOSS
  );
  const [duration, setDuration] = useState(initialValues?.duration ?? "");
  const [coverImages, setCoverImages] = useState<UploadedImage[]>(() =>
    urlToUploaded(initialValues?.coverImageUrl)
  );
  const [beforeImages, setBeforeImages] = useState<UploadedImage[]>(() =>
    urlToUploaded(initialValues?.beforeImageUrl)
  );
  const [afterImages, setAfterImages] = useState<UploadedImage[]>(() =>
    urlToUploaded(initialValues?.afterImageUrl)
  );
  const [story, setStory] = useState(initialValues?.story ?? "");
  const [startWeight, setStartWeight] = useState(
    initialValues?.startWeight?.toString() ?? ""
  );
  const [currentWeight, setCurrentWeight] = useState(
    initialValues?.currentWeight?.toString() ?? ""
  );
  const [height, setHeight] = useState(initialValues?.height?.toString() ?? "");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(
    initialValues?.weightUnit ?? WeightUnit.KG
  );
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(
    initialValues?.heightUnit ?? HeightUnit.CM
  );
  const [linkedGym, setLinkedGym] = useState<EntitySearchItem | null>(initialLinkedGym);
  const [linkedTrainer, setLinkedTrainer] = useState<EntitySearchItem | null>(
    initialLinkedTrainer
  );

  function buildPayload(): SuccessStoryFormInput {
    const cover = getUploaded(coverImages);
    const before = getUploaded(beforeImages);
    const after = getUploaded(afterImages);

    return {
      title,
      clientName,
      gender: gender as SuccessStoryGender,
      city,
      goal,
      duration,
      story,
      coverImageUrl: cover?.url ?? initialValues?.coverImageUrl ?? null,
      coverCloudinaryId: cover?.publicId ?? initialValues?.coverCloudinaryId ?? null,
      beforeImageUrl: before?.url ?? initialValues?.beforeImageUrl ?? "",
      beforeCloudinaryId: before?.publicId ?? initialValues?.beforeCloudinaryId ?? null,
      afterImageUrl: after?.url ?? initialValues?.afterImageUrl ?? "",
      afterCloudinaryId: after?.publicId ?? initialValues?.afterCloudinaryId ?? null,
      progressImages: initialValues?.progressImages ?? [],
      startWeight: startWeight ? Number(startWeight) : null,
      currentWeight: currentWeight ? Number(currentWeight) : null,
      height: height ? Number(height) : null,
      weightUnit,
      heightUnit,
      linkedGymId: linkedGym?.id ?? null,
      linkedTrainerId: linkedTrainer?.id ?? null,
    };
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (title.trim().length < 5) return "Title must be at least 5 characters.";
      if (clientName.trim().length < 2) return "Client name is required.";
      if (!gender) return "Please select a gender.";
      if (!duration.trim()) return "Duration is required.";
    }
    if (step === 1) {
      const payload = buildPayload();
      if (!payload.beforeImageUrl) return "Before photo is required.";
      if (!payload.afterImageUrl) return "After photo is required.";
    }
    if (step === 2) {
      const len = plainStoryLength(story);
      if (len < 300) return `Story must be at least 300 characters (${len}/300).`;
      if (len > 3000) return "Story must be under 3000 characters.";
    }
    return null;
  }

  async function handleSave(publish: boolean) {
    setSubmitting(true);
    setError(null);
    const payload = buildPayload();
    const result = publish
      ? await publishSuccessStory(payload, storyId)
      : await saveSuccessStoryDraft(payload, storyId);

    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.push(dashboardPath);
    router.refresh();
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              index === step
                ? "bg-[#0B2545] text-white"
                : index < step
                  ? "bg-[#FF6A3D]/15 text-[#FF6A3D]"
                  : "bg-gray-100 text-gray-500"
            )}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Title</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Client name</label>
              <input className={inputClass} value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Gender</label>
              <select
                required
                className={inputClass}
                value={gender}
                onChange={(e) => setGender(e.target.value as SuccessStoryGender)}
              >
                <option value="" disabled>
                  Select gender
                </option>
                {SUCCESS_STORY_GENDER_FORM_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">City</label>
              <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Goal</label>
              <select className={inputClass} value={goal} onChange={(e) => setGoal(e.target.value as SuccessStoryGoal)}>
                {Object.entries(SUCCESS_STORY_GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Duration</label>
              <input className={inputClass} placeholder="e.g. 6 months" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <ImageUploader
                label="Cover image (optional)"
                images={coverImages}
                onChange={setCoverImages}
                maxImages={1}
                uploadType="success_story"
                authMode="cookie"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <ImageUploader
                  label="Before photo"
                  images={beforeImages}
                  onChange={setBeforeImages}
                  maxImages={1}
                  uploadType="success_story"
                  authMode="cookie"
                />
              </div>
              <div>
                <ImageUploader
                  label="After photo"
                  images={afterImages}
                  onChange={setAfterImages}
                  maxImages={1}
                  uploadType="success_story"
                  authMode="cookie"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Start weight</label>
                <input className={inputClass} inputMode="decimal" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Current weight</label>
                <input className={inputClass} inputMode="decimal" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Weight unit</label>
                <select className={inputClass} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}>
                  <option value="KG">kg</option>
                  <option value="LBS">lbs</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Height</label>
                <input className={inputClass} inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Height unit</label>
                <select className={inputClass} value={heightUnit} onChange={(e) => setHeightUnit(e.target.value as HeightUnit)}>
                  {Object.entries(SUCCESS_STORY_HEIGHT_UNIT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Your journey ({plainStoryLength(story)}/3000 characters, min 300)
            </label>
            <textarea
              className={cn(inputClass, "min-h-[280px] py-3")}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe your starting point, challenges, training, nutrition, motivation, results, and advice…"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Optionally link the gym and/or trainer that helped with this transformation.
            </p>
            <EntitySearchSelect
              label="Select gym"
              placeholder="Search gyms…"
              type="gym"
              value={linkedGym}
              onChange={setLinkedGym}
            />
            <EntitySearchSelect
              label="Select trainer"
              placeholder="Search trainers…"
              type="trainer"
              value={linkedTrainer}
              onChange={setLinkedTrainer}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-sm text-gray-700">
            <h3 className="font-heading text-lg font-bold text-gray-900">{title || "Untitled story"}</h3>
            <p><strong>Client:</strong> {clientName} · {city} · {duration}</p>
            <p><strong>Goal:</strong> {SUCCESS_STORY_GOAL_LABELS[goal]}</p>
            {linkedGym && <p><strong>Gym:</strong> {linkedGym.label}</p>}
            {linkedTrainer && <p><strong>Trainer:</strong> {linkedTrainer.label}</p>}
            <div className="rounded-xl bg-gray-50 p-4 whitespace-pre-wrap">{story}</div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={step === 0 || submitting}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              const msg = validateStep();
              if (msg) {
                setError(msg);
                return;
              }
              setError(null);
              setStep((s) => s + 1);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSave(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSave(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

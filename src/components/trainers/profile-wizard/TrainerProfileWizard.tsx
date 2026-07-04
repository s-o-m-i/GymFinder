"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Rocket } from "lucide-react";
import type { Trainer } from "@prisma/client";
import { saveTrainerProfile } from "@/app/actions/trainer/profile";
import type { UploadedImage } from "@/lib/gym-images-form";
import { CITIES } from "@/lib/constants";
import {
  parseAchievements,
  parseCertifications,
} from "@/lib/staff-members";
import { parseTrainerAvailability } from "@/lib/trainer-availability";
import { trainerProfileSchema } from "@/lib/validations/trainer";
import { TRAINER_WIZARD_STEP_SCHEMAS } from "@/lib/validations/trainer-wizard";
import { calculateProfileCompletion } from "@/lib/trainer-profile-completion";
import { clearTrainerProfileDraft } from "@/lib/trainer-profile-draft";
import { TrainerProfileStepper } from "@/components/trainers/profile-wizard/TrainerProfileStepper";
import { TrainerProfileProgressBar } from "@/components/trainers/profile-wizard/TrainerProfileProgressBar";
import { WIZARD_STEPS } from "@/components/trainers/profile-wizard/constants";
import { buildTrainerProfilePayload } from "@/components/trainers/profile-wizard/build-payload";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";
import { DraftSavedIndicator } from "@/components/trainers/profile-wizard/DraftSavedIndicator";
import {
  useTrainerProfileDraft,
} from "@/components/trainers/profile-wizard/useTrainerProfileDraft";
import { BasicInfoStep } from "@/components/trainers/profile-wizard/steps/BasicInfoStep";
import { ContactStep } from "@/components/trainers/profile-wizard/steps/ContactStep";
import { AboutStep } from "@/components/trainers/profile-wizard/steps/AboutStep";
import { CertificationsStep } from "@/components/trainers/profile-wizard/steps/CertificationsStep";
import { AvailabilityStep } from "@/components/trainers/profile-wizard/steps/AvailabilityStep";
import { ReviewStep } from "@/components/trainers/profile-wizard/steps/ReviewStep";
import { cn } from "@/lib/utils";

interface TrainerProfileWizardProps {
  trainer: Trainer | null;
  accountEmail: string;
}

function buildInitialValues(trainer: Trainer | null, accountEmail: string): TrainerProfileFormValues {
  return {
    fullName: trainer?.fullName ?? "",
    headline: trainer?.headline ?? "",
    bio: trainer?.bio ?? "",
    city: trainer?.city ?? CITIES[0],
    area: trainer?.area ?? "",
    specialization: trainer?.specialization ?? "fitness",
    experienceYears: trainer?.experienceYears?.toString() ?? "",
    hourlyRate: trainer?.hourlyRate?.toString() ?? "",
    whatsappNumber: trainer?.whatsappNumber ?? "",
    email: trainer?.email ?? accountEmail,
    gender: trainer?.gender ?? "",
    gymId: trainer?.gymId ?? "",
    isPublished: trainer?.isPublished ?? false,
    certifications: trainer ? parseCertifications(trainer.certifications) : [],
    achievements: trainer ? parseAchievements(trainer.achievements) : [],
    availabilitySlots: trainer ? parseTrainerAvailability(trainer.availability) : [],
  };
}

function buildInitialPhoto(trainer: Trainer | null): UploadedImage[] {
  if (!trainer?.profileImage) return [];
  return [
    {
      imageUrl: trainer.profileImage,
      publicId: trainer.cloudinaryId ?? undefined,
      status: "uploaded",
      progress: 100,
    },
  ];
}

export function TrainerProfileWizard({ trainer, accountEmail }: TrainerProfileWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [photo, setPhoto] = useState<UploadedImage[]>(() => buildInitialPhoto(trainer));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validatingStep, setValidatingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const currentStepRef = useRef(currentStep);
  const blockSubmitRef = useRef(false);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const { restoreDraft, scheduleSave, saveLabel } = useTrainerProfileDraft({
    accountEmail,
    enabled: true,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<TrainerProfileFormValues>({
    defaultValues: buildInitialValues(trainer, accountEmail),
    mode: "onTouched",
  });

  const watchedValues = watch();

  const completion = useMemo(
    () => calculateProfileCompletion(watchedValues, photo),
    [watchedValues, photo]
  );

  useEffect(() => {
    const draft = restoreDraft();
    if (draft) {
      reset(draft.values);
      setPhoto(draft.photo.length > 0 ? draft.photo : buildInitialPhoto(trainer));
      setCurrentStep(Math.min(draft.currentStep, WIZARD_STEPS.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scheduleSave(watchedValues, photo, currentStep);
  }, [watchedValues, photo, currentStep, scheduleSave]);

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const applyZodIssues = useCallback(
    (issues: { path: PropertyKey[]; message: string }[]) => {
      for (const issue of issues) {
        const path = issue.path.map(String).join(".");
        if (!path) continue;
        setError(path as keyof TrainerProfileFormValues & string, {
          type: "manual",
          message: issue.message,
        });
      }
    },
    [setError]
  );

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    clearErrors();
    setStepError(null);
    setPhotoError(null);

    if (currentStep === 0) {
      if (photo.some((p) => p.status === "uploading" || p.status === "pending")) {
        setPhotoError("Please wait for the profile photo upload to finish.");
        return false;
      }
    }

    if (currentStep <= 4) {
      const payload = buildTrainerProfilePayload(getValues(), photo);
      const schema = TRAINER_WIZARD_STEP_SCHEMAS[currentStep];
      const result = schema.safeParse(payload);
      if (!result.success) {
        applyZodIssues(result.error.issues);
        setStepError(result.error.issues[0]?.message ?? "Please fix the errors below.");
        return false;
      }
    }

    return true;
  }, [applyZodIssues, clearErrors, currentStep, getValues, photo]);

  async function goNext() {
    if (submitting || validatingStep) return;
    setValidatingStep(true);
    const valid = await validateCurrentStep();
    setValidatingStep(false);
    if (!valid) return;

    const nextStep = Math.min(currentStepRef.current + 1, WIZARD_STEPS.length - 1);
    if (nextStep === WIZARD_STEPS.length - 1) {
      blockSubmitRef.current = true;
      window.setTimeout(() => {
        blockSubmitRef.current = false;
      }, 500);
    }

    setCurrentStep(nextStep);
    setAnimKey((k) => k + 1);
    scrollToTop();
  }

  function goPrevious() {
    if (submitting || currentStep === 0) return;
    setStepError(null);
    clearErrors();
    setCurrentStep((s) => s - 1);
    setAnimKey((k) => k + 1);
    scrollToTop();
  }

  async function onSubmit() {
    if (blockSubmitRef.current) return;
    if (currentStepRef.current !== WIZARD_STEPS.length - 1) return;

    setSubmitting(true);
    setSubmitError(null);
    setStepError(null);

    if (photo.some((p) => p.status === "uploading" || p.status === "pending")) {
      setSubmitError("Please wait for the profile photo upload to finish.");
      setSubmitting(false);
      return;
    }

    const payload = buildTrainerProfilePayload(getValues(), photo);
    const parsed = trainerProfileSchema.safeParse(payload);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues);
      setSubmitError(parsed.error.issues[0]?.message ?? "Please fix the errors in your profile.");
      setSubmitting(false);
      return;
    }

    const result = await saveTrainerProfile(payload);
    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    clearTrainerProfileDraft(accountEmail);
    router.push("/trainer/dashboard");
    router.refresh();
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || isLastStep) return;
    if (event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)();
      }}
      onKeyDown={handleFormKeyDown}
      className="min-w-0"
    >
      <div className="mb-6">
        <div className="mb-2 flex justify-end">
          <DraftSavedIndicator label={saveLabel} />
        </div>
        <TrainerProfileProgressBar
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          completionPercentage={completion.percentage}
        />
      </div>

      <TrainerProfileStepper
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep && !submitting) {
            setCurrentStep(step);
            setAnimKey((k) => k + 1);
            scrollToTop();
          }
        }}
      />

      {(stepError || submitError) && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {stepError ?? submitError}
        </div>
      )}

      <div key={animKey} className="wizard-step-enter mb-8 min-w-0">
        {currentStep === 0 && (
          <BasicInfoStep
            register={register}
            errors={errors}
            photo={photo}
            onPhotoChange={setPhoto}
            photoError={photoError}
          />
        )}
        {currentStep === 1 && <ContactStep register={register} errors={errors} />}
        {currentStep === 2 && (
          <AboutStep register={register} errors={errors} watch={watch} setValue={setValue} />
        )}
        {currentStep === 3 && (
          <CertificationsStep watch={watch} setValue={setValue} errors={errors} />
        )}
        {currentStep === 4 && (
          <AvailabilityStep watch={watch} setValue={setValue} errors={errors} />
        )}
        {currentStep === 5 && (
          <ReviewStep register={register} watch={watch} photo={photo} completion={completion} />
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirstStep || submitting}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200",
            "text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={() => void handleSubmit(onSubmit)()}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 transition-colors"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Publish Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={submitting || validatingStep}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B2545] text-white font-semibold text-sm rounded-xl hover:bg-[#071832] disabled:opacity-70 transition-colors"
          >
            {validatingStep ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";
import {
  fieldErrorClass,
  wizardInputClass,
} from "@/components/trainers/profile-wizard/styles";

interface ContactStepProps {
  register: UseFormRegister<TrainerProfileFormValues>;
  errors: FieldErrors<TrainerProfileFormValues>;
}

export function ContactStep({ register, errors }: ContactStepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <p className="text-sm text-gray-500 mb-2">
          Add how clients can reach you and your session rate.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly rate (PKR)</label>
        <input
          type="number"
          min={0}
          {...register("hourlyRate")}
          className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.hourlyRate))}`}
        />
        {errors.hourlyRate && (
          <p className="text-xs text-red-600 mt-1">{String(errors.hourlyRate.message)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp *</label>
        <input
          {...register("whatsappNumber")}
          placeholder="03001234567"
          className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.whatsappNumber))}`}
        />
        {errors.whatsappNumber && (
          <p className="text-xs text-red-600 mt-1">{errors.whatsappNumber.message}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Public email</label>
        <input
          type="email"
          {...register("email")}
          className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.email))}`}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>
    </div>
  );
}

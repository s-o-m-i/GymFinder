"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CONTACT_SUBJECTS,
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact-form";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  defaultSubject?: ContactFormValues["subject"];
  formId?: string;
}

export function ContactForm({ defaultSubject, formId = "contact-form" }: ContactFormProps) {
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: defaultSubject ?? "general",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitState("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setSubmitState("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitState("success");
      reset({ subject: defaultSubject ?? "general", fullName: "", email: "", phone: "", message: "" });
    } catch {
      setSubmitState("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }

  const inputClass = cn(
    "h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--text)]",
    "placeholder:text-[var(--text-muted)]/60",
    "focus:border-[#FF6A3D]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
  );

  return (
    <div id={formId}>
      {submitState === "success" && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Message sent successfully!</p>
            <p className="mt-1 text-green-700 dark:text-green-400">
              We&apos;ll get back to you within 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {submitState === "error" && errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Full Name <span className="text-[#FF6A3D]">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className={cn(inputClass, errors.fullName && "border-red-400")}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              Email <span className="text-[#FF6A3D]">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={cn(inputClass, errors.email && "border-red-400")}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              Phone Number <span className="text-[#FF6A3D]">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+92 300 1234567"
              className={cn(inputClass, errors.phone && "border-red-400")}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Subject <span className="text-[#FF6A3D]">*</span>
          </label>
          <select
            id="subject"
            className={cn(inputClass, errors.subject && "border-red-400")}
            {...register("subject")}
          >
            {CONTACT_SUBJECTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Message <span className="text-[#FF6A3D]">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            className={cn(
              "w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)]",
              "placeholder:text-[var(--text-muted)]/60",
              "focus:border-[#FF6A3D]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20",
              errors.message && "border-red-400"
            )}
            placeholder="Tell us how we can help..."
            {...register("message")}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          isLoading={submitState === "loading"}
          className="w-full sm:w-auto"
        >
          <Send className="h-4 w-4" />
          Send Message
        </Button>
      </form>
    </div>
  );
}

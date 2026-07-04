import { z } from "zod";

export const CONTACT_SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Support" },
  { value: "partnership", label: "Business Partnership" },
  { value: "list_gym", label: "List My Gym" },
  { value: "trainer", label: "Trainer Registration" },
  { value: "report", label: "Report Listing" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"];

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s()-]+$/, "Please enter a valid phone number"),
  subject: z.enum(
    CONTACT_SUBJECTS.map((s) => s.value) as [ContactSubject, ...ContactSubject[]],
    { message: "Please select a subject" }
  ),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function contactSubjectLabel(value: ContactSubject): string {
  return CONTACT_SUBJECTS.find((s) => s.value === value)?.label ?? value;
}

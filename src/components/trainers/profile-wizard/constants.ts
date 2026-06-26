export const WIZARD_STEPS = [
  { id: 1, key: "basic", title: "Basic Information", short: "Basic" },
  { id: 2, key: "contact", title: "Contact", short: "Contact" },
  { id: 3, key: "about", title: "About", short: "About" },
  { id: 4, key: "certifications", title: "Certifications", short: "Certs" },
  { id: 5, key: "availability", title: "Availability", short: "Schedule" },
  { id: 6, key: "review", title: "Review & Publish", short: "Review" },
] as const;

export const WIZARD_STEP_FIELDS: Record<number, string[]> = {
  0: ["fullName", "headline", "city", "area", "specialization", "experienceYears", "gender"],
  1: ["hourlyRate", "whatsappNumber", "email"],
  2: ["bio", "achievements"],
  3: ["certifications"],
  4: ["availabilitySlots"],
};

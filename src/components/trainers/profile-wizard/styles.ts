export const wizardInputClass =
  "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

export const wizardTextareaClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

export const wizardFieldErrorClass = "border-red-300 focus:ring-red-200";

export function fieldErrorClass(hasError?: boolean) {
  return hasError ? wizardFieldErrorClass : "";
}

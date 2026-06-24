import Link from "next/link";
import { cn } from "@/lib/utils";

interface LegalTermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export function LegalTermsCheckbox({
  checked,
  onChange,
  id = "accept-terms",
  className,
}: LegalTermsCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-3.5 transition-colors hover:bg-white/[0.07]",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/10 text-[#FF6A3D] focus:ring-[#FF6A3D]/50 focus:ring-offset-0"
        required
      />
      <span className="text-sm leading-relaxed text-white/75">
        I agree to the{" "}
        <Link
          href="/legal/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#FF6A3D] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#FF6A3D] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}

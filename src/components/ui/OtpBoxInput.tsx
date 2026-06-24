"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

interface OtpBoxInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  boxClassName?: string;
}

function toDigits(value: string): string[] {
  return Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");
}

export function OtpBoxInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  className,
  boxClassName,
}: OtpBoxInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus) focusIndex(0);
  }, [autoFocus, focusIndex]);

  function applyDigits(raw: string) {
    const cleaned = raw.replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(cleaned);
    focusIndex(Math.min(cleaned.length, OTP_LENGTH - 1));
    if (cleaned.length === OTP_LENGTH) {
      inputsRef.current[OTP_LENGTH - 1]?.blur();
    }
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const chars = toDigits(value);

    if (!digit) {
      chars[index] = "";
      onChange(chars.join("").replace(/\s+$/, ""));
      return;
    }

    chars[index] = digit;
    const next = chars.join("").slice(0, OTP_LENGTH);
    onChange(next);

    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const chars = toDigits(value);
      if (chars[index]) {
        chars[index] = "";
        onChange(chars.join("").trimEnd());
        return;
      }
      if (index > 0) {
        chars[index - 1] = "";
        onChange(chars.join("").trimEnd());
        focusIndex(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    applyDigits(e.clipboardData.getData("text"));
  }

  const defaultBoxClass =
    "h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-center text-lg sm:text-xl font-semibold text-white caret-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/60 focus:border-[#FF6A3D]/50 disabled:opacity-60 transition-shadow";

  const digits = toDigits(value);

  return (
    <div
      className={cn("flex items-center justify-center gap-2 sm:gap-2.5", className)}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={cn(defaultBoxClass, boxClassName)}
        />
      ))}
    </div>
  );
}

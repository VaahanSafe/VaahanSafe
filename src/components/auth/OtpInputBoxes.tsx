import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { OtpInputBoxesProps } from "@/types/auth";
import { splitOtp, joinOtp, sanitizeOtp, isOtpComplete } from "@/lib/auth/otp";

export default function OtpInputBoxes({
  value = "",
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  error = false,
  className = "",
}: OtpInputBoxesProps) {
  const digits = splitOtp(value);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleInputChange = (index: number, val: string) => {
    if (disabled) return;
    const sanitized = val.replace(/\D/g, "");
    if (!sanitized) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      const newValue = joinOtp(nextDigits);
      onChange?.(newValue);
      return;
    }

    const digit = sanitized.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    const newValue = joinOtp(nextDigits);

    onChange?.(newValue);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (isOtpComplete(newValue)) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const nextDigits = [...digits];
      
      if (digits[index]) {
        nextDigits[index] = "";
        const newValue = joinOtp(nextDigits);
        onChange?.(newValue);
      } else if (index > 0) {
        nextDigits[index - 1] = "";
        const newValue = joinOtp(nextDigits);
        onChange?.(newValue);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Delete") {
      e.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index] = "";
      onChange?.(joinOtp(nextDigits));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedText = e.clipboardData.getData("text");
    const sanitized = sanitizeOtp(pastedText);
    
    if (sanitized) {
      onChange?.(sanitized);
      const targetIndex = Math.min(sanitized.length, 5);
      inputRefs.current[targetIndex]?.focus();

      if (isOtpComplete(sanitized)) {
        onComplete?.(sanitized);
      }
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -6, 6, -6, 6, -4, 4, 0],
      transition: { duration: 0.4 },
    },
    normal: { x: 0 },
  };

  const isCompleted = isOtpComplete(value);

  return (
    <motion.div
      role="group"
      aria-label="OTP verification code"
      variants={shakeVariants}
      animate={error ? "shake" : "normal"}
      className={`flex items-center justify-between gap-2 max-w-sm mx-auto select-none ${className}`}
    >
      {digits.map((digit, idx) => (
        <motion.input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleInputChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          animate={isCompleted ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
          aria-label={`Digit ${idx + 1}`}
          aria-invalid={error}
          className={`size-12 sm:size-14 text-center text-lg sm:text-xl font-bold font-mono rounded-lg border outline-none transition-all ${
            disabled 
              ? "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 cursor-not-allowed" 
              : error 
              ? "border-red-500 ring-2 ring-red-500/20 text-red-500 bg-red-50/10 dark:bg-red-950/10" 
              : digit 
              ? "border-orange-500 ring-2 ring-orange-500/10 text-zinc-900 dark:text-white bg-white dark:bg-black" 
              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black text-zinc-900 dark:text-white hover:border-zinc-350 dark:hover:border-zinc-650 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
          }`}
        />
      ))}
    </motion.div>
  );
}

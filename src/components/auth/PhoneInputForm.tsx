import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import type { PhoneInputFormProps } from "@/types/auth";
import { formatIndianPhone, normalizePhone, isValidIndianPhone } from "@/lib/auth/formatPhone";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { SmartPhone01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

const phoneSchema = z.object({
  phone: z.string().refine((val) => isValidIndianPhone(val), {
    message: "Enter a valid 10-digit Indian mobile number",
  }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function PhoneInputForm({
  onSubmit,
  loading = false,
  disabled = false,
  defaultValue = "",
  className = "",
}: PhoneInputFormProps) {
  const defaultFormatted = defaultValue ? formatIndianPhone(normalizePhone(defaultValue)) : "";

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: {
      phone: defaultFormatted,
    },
  });

  const onFormSubmit = (data: PhoneFormValues) => {
    if (loading || disabled) return;
    const rawPhone = normalizePhone(data.phone);
    onSubmit(rawPhone);
  };

  const isSubmitDisabled = !isValid || disabled || loading;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={`space-y-4 w-full select-none ${className}`}>
      <div className="space-y-1.5 text-left">
        <label htmlFor="phone-input" className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
          Mobile Number
        </label>
        
        <div 
          className={`relative flex items-center h-[56px] w-full bg-zinc-50 dark:bg-zinc-950 border rounded-lg transition-all px-4 gap-3 focus-within:ring-2 focus-within:ring-orange-500/25 ${
            errors.phone 
              ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20" 
              : "border-zinc-200 dark:border-zinc-800 focus-within:border-orange-500"
          }`}
        >
          <HugeiconsIcon icon={SmartPhone01Icon} className="size-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 font-mono select-none">+91</span>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98765 43210"
                disabled={disabled || loading}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
                  field.onChange(formatIndianPhone(raw));
                }}
                className="flex-grow bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none h-full w-full"
              />
            )}
          />
        </div>

        {errors.phone && (
          <p id="phone-error" className="text-red-500 dark:text-red-400 text-[11px] font-medium leading-normal animate-in fade-in slide-in-from-top-1 duration-150">
            {errors.phone.message}
          </p>
        )}
      </div>

      <motion.div
        whileHover={!isSubmitDisabled ? { y: -1 } : {}}
        whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.15 }}
        className="w-full"
      >
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full h-11 text-xs font-bold rounded-lg cursor-pointer bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 focus-visible:ring-orange-500/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Spinner className="size-4 animate-spin text-white" />
          ) : (
            <>
              <span>Continue</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-white" />
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}

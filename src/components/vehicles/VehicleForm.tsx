import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { VehicleFormData } from "@/types/vehicle";
import { normalizeVehicleNumber } from "@/lib/vehicle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Car01Icon, PencilEdit02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";

const vehicleFormSchema = z.object({
  licensePlate: z
    .string()
    .transform((val) => normalizeVehicleNumber(val))
    .refine((val) => /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(val), {
      message: "Enter a valid Indian license plate code (e.g. MH02AB1234)",
    }),
  note: z
    .string()
    .max(250, "Sticker note cannot exceed 250 characters")
    .optional(),
});

interface VehicleFormProps {
  defaultValues?: VehicleFormData;
  loading?: boolean;
  mode: "create" | "edit";
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export default function VehicleForm({
  defaultValues,
  loading = false,
  mode,
  onSubmit,
  onCancel,
  className = "",
}: VehicleFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    mode: "onChange",
    defaultValues: {
      licensePlate: defaultValues?.licensePlate ? normalizeVehicleNumber(defaultValues.licensePlate) : "",
      note: defaultValues?.note || "",
    },
  });

  const onFormSubmit = async (data: VehicleFormData) => {
    if (loading) return;
    await onSubmit({
      licensePlate: normalizeVehicleNumber(data.licensePlate),
      note: data.note,
    });
  };

  const isSubmitDisabled = loading || !isValid || (mode === "edit" && !isDirty);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={`space-y-5 w-full select-none ${className}`}>
      {/* License Plate Field */}
      <div className="space-y-1.5 text-left">
        <label htmlFor="licensePlate" className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
          Registration Number
        </label>
        <div className="relative flex items-center h-10 w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-500 px-3 gap-2">
          <HugeiconsIcon icon={Car01Icon} className="size-4.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <Controller
            name="licensePlate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="licensePlate"
                type="text"
                disabled={loading || mode === "edit"}
                placeholder="MH02AB1234"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                className="bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-full w-full font-mono text-xs font-bold tracking-wider"
              />
            )}
          />
        </div>
        {errors.licensePlate && (
          <p className="text-red-500 dark:text-red-400 text-[11px] font-medium leading-normal animate-in fade-in slide-in-from-top-1 duration-150">
            {errors.licensePlate.message}
          </p>
        )}
      </div>

      {/* Note Field */}
      <div className="space-y-1.5 text-left">
        <label htmlFor="note" className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
          Sticker Note (Optional)
        </label>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="note"
              disabled={loading}
              placeholder="e.g. Call emergency contact if parked in front of gate."
              className="min-h-24 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 px-3 py-2 text-xs font-semibold placeholder:text-zinc-400 dark:placeholder-zinc-650 transition-colors focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/25 focus-visible:outline-none"
            />
          )}
        />
        {errors.note && (
          <p className="text-red-500 dark:text-red-400 text-[11px] font-medium leading-normal animate-in fade-in slide-in-from-top-1 duration-150">
            {errors.note.message}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 h-9 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200"
          >
            Cancel
          </Button>
        )}
        <motion.div
          whileHover={!isSubmitDisabled ? { y: -0.5 } : {}}
          whileTap={!isSubmitDisabled ? { scale: 0.99 } : {}}
          className="flex-1"
        >
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full h-9 text-xs font-bold rounded-lg cursor-pointer bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 focus-visible:ring-orange-500/30 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Spinner className="size-3 text-white animate-spin" />
            ) : mode === "create" ? (
              <>
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5 text-white" />
                <span>Save Vehicle</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5 text-white" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}

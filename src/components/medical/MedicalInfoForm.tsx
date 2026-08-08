import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { HealtcareIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { MedicalFormData, MedicalInfoFormProps, BloodGroup } from '@/types/medical';

import { BloodGroupSelect } from './BloodGroupSelect';
import { AllergyTagInput } from './AllergyTagInput';
import { MedicationList } from './MedicationList';
import { ConsentCheckbox } from './ConsentCheckbox';

const medicalFormSchema = z.object({
  bloodGroup: z.string().min(1, 'Please select a valid blood group'),
  allergies: z.array(z.string()),
  medications: z.array(z.string()),
  medicalConditions: z.string().max(500, 'Medical conditions cannot exceed 500 characters').optional(),
  additionalNotes: z.string().max(500, 'Additional notes cannot exceed 500 characters').optional(),
  consent: z.boolean(),
});

type FormValues = z.infer<typeof medicalFormSchema>;

export function MedicalInfoForm({
  defaultValues,
  loading = false,
  isFirstSubmission,
  consentAcceptedAt,
  onSubmit,
  onCancel,
}: MedicalInfoFormProps) {
  const requiresConsentCheck = isFirstSubmission && !consentAcceptedAt;

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(medicalFormSchema),
    defaultValues: {
      bloodGroup: defaultValues?.bloodGroup || '',
      allergies: defaultValues?.allergies || [],
      medications: defaultValues?.medications || [],
      medicalConditions: defaultValues?.medicalConditions || '',
      additionalNotes: defaultValues?.additionalNotes || '',
      consent: defaultValues?.consent ?? Boolean(consentAcceptedAt),
    },
  });

  const consentChecked = watch('consent');

  const handleFormSubmit = async (data: FormValues) => {
    if (requiresConsentCheck && !data.consent) {
      return;
    }

    const payload: MedicalFormData = {
      bloodGroup: data.bloodGroup as BloodGroup,
      allergies: data.allergies || [],
      medications: data.medications || [],
      medicalConditions: data.medicalConditions || '',
      additionalNotes: data.additionalNotes || '',
      consent: data.consent,
    };

    await onSubmit(payload);
  };

  const isPending = loading || isSubmitting;
  const canSave = !requiresConsentCheck || consentChecked;

  return (
    <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl text-left overflow-hidden select-none font-sans">
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 p-5 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-display flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            Emergency Medical Information Profile
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Vital health telemetry accessible by paramedics upon scanning your vehicle's safety QR decal.
          </CardDescription>
        </div>
        <div className="size-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={HealtcareIcon} className="size-5" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="p-5 space-y-6">
          
          {/* Section 1: Blood Group Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              1. Blood Group (Required)
            </Label>
            <Controller
              name="bloodGroup"
              control={control}
              render={({ field }) => (
                <BloodGroupSelect
                  value={field.value as BloodGroup}
                  onChange={field.onChange}
                  disabled={isPending}
                  error={errors.bloodGroup?.message}
                />
              )}
            />
          </div>

          {/* Section 2: Allergy Tags */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              2. Known Medical & Food Allergies
            </Label>
            <Controller
              name="allergies"
              control={control}
              render={({ field }) => (
                <AllergyTagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  disabled={isPending}
                  error={errors.allergies?.message}
                />
              )}
            />
          </div>

          {/* Section 3: Emergency Medications */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              3. Critical Emergency Medications
            </Label>
            <Controller
              name="medications"
              control={control}
              render={({ field }) => (
                <MedicationList
                  value={field.value || []}
                  onChange={field.onChange}
                  disabled={isPending}
                  error={errors.medications?.message}
                />
              )}
            />
          </div>

          {/* Section 4: Medical Conditions */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              4. Chronic Medical Conditions (Optional)
            </Label>
            <Controller
              name="medicalConditions"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="e.g. Type 1 Diabetes, Asthma, Cardiac Stent placed 2024..."
                  value={field.value || ''}
                  onChange={field.onChange}
                  disabled={isPending}
                  className="min-h-20 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-orange-500"
                />
              )}
            />
            {errors.medicalConditions && (
              <p className="text-[11px] font-semibold text-red-500">{errors.medicalConditions.message}</p>
            )}
          </div>

          {/* Section 5: Additional Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              5. Paramedic & First Responder Notes (Optional)
            </Label>
            <Controller
              name="additionalNotes"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="e.g. Organ donor consent granted. Carries EpiPen in glove compartment."
                  value={field.value || ''}
                  onChange={field.onChange}
                  disabled={isPending}
                  className="min-h-20 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-orange-500"
                />
              )}
            />
            {errors.additionalNotes && (
              <p className="text-[11px] font-semibold text-red-500">{errors.additionalNotes.message}</p>
            )}
          </div>

          {/* Section 6: Mandatory Consent Checkbox */}
          <div className="pt-2">
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <ConsentCheckbox
                  checked={field.value}
                  acceptedAt={consentAcceptedAt}
                  disabled={isPending || Boolean(consentAcceptedAt)}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

        </CardContent>

        <CardFooter className="border-t border-zinc-100 dark:border-zinc-800/80 p-4 bg-zinc-50/50 dark:bg-zinc-950/40 flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="h-9.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-transparent cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending || !canSave}
            className="h-9.5 px-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-2 border-none shadow-md"
          >
            {isPending ? (
              <>
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                Save Medical Information
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

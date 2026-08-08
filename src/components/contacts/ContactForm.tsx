import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  User03Icon, 
  Call02Icon, 
  WhatsappIcon, 
  UserGroupIcon, 
  CheckmarkCircle02Icon 
} from '@hugeicons/core-free-icons';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContactFormData, ContactFormProps, RelationshipType } from '@/types/contacts';
import { formatPhoneNumber, normalizePhoneNumber, validateIndianPhone } from '@/lib/contacts';

const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
  relationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship cannot exceed 50 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => validateIndianPhone(val), {
      message: 'Enter a valid 10-digit Indian mobile number (6-9xxxxxxxxx)',
    }),
  whatsappEnabled: z.boolean(),
});

type FormValues = z.infer<typeof contactSchema>;

const RELATIONSHIPS: { value: RelationshipType; label: string }[] = [
  { value: 'Spouse', label: 'Spouse / Partner' },
  { value: 'Parent', label: 'Parent / Guardian' },
  { value: 'Child', label: 'Son / Daughter' },
  { value: 'Sibling', label: 'Brother / Sister' },
  { value: 'Friend', label: 'Close Friend' },
  { value: 'Doctor', label: 'Personal / Family Doctor' },
  { value: 'Driver', label: 'Vehicle Driver' },
  { value: 'Relative', label: 'Relative' },
  { value: 'Colleague', label: 'Colleague' },
  { value: 'Other', label: 'Other Contact' },
];

export function ContactForm({
  mode,
  defaultValues,
  loading = false,
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      relationship: defaultValues?.relationship || 'Spouse',
      phone: defaultValues?.phone ? formatPhoneNumber(defaultValues.phone) : '',
      whatsappEnabled: defaultValues?.whatsappEnabled ?? true,
    },
  });

  const phoneValue = watch('phone');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = normalizePhoneNumber(raw);
    if (digits.length <= 10) {
      setValue('phone', formatPhoneNumber(digits), { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (data: FormValues) => {
    const normalizedData: ContactFormData = {
      name: data.name,
      relationship: data.relationship,
      phone: normalizePhoneNumber(data.phone),
      whatsappEnabled: data.whatsappEnabled,
    };
    await onSubmit(normalizedData);
  };

  const isPending = loading || isSubmitting;

  return (
    <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl text-left overflow-hidden select-none font-sans">
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-950/60">
        <CardTitle className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white font-display flex items-center gap-2">
          <span className="size-2 rounded-full bg-orange-500" />
          {mode === 'create' ? 'Add Emergency Contact' : 'Edit Emergency Contact'}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          Emergency dispatches and roadside scan alerts will notify contacts in priority order.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="p-4 sm:p-5 space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <HugeiconsIcon icon={User03Icon} className="size-3.5 text-orange-500 shrink-0" />
              Full Name
            </Label>
            <Input
              type="text"
              placeholder="e.g. Rajesh Sharma"
              disabled={isPending}
              {...register('name')}
              className="h-10 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500"
            />
            {errors.name && (
              <p className="text-[11px] font-semibold text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Relationship Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <HugeiconsIcon icon={UserGroupIcon} className="size-3.5 text-orange-500 shrink-0" />
              Relationship
            </Label>
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-10 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500">
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg shadow-xl">
                    {RELATIONSHIPS.map((rel) => (
                      <SelectItem 
                        key={rel.value} 
                        value={rel.value}
                        className="text-xs font-medium cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                      >
                        {rel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.relationship && (
              <p className="text-[11px] font-semibold text-red-500">{errors.relationship.message}</p>
            )}
          </div>

          {/* Indian Phone Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <HugeiconsIcon icon={Call02Icon} className="size-3.5 text-orange-500 shrink-0" />
              Mobile Phone Number
            </Label>
            <div className="flex gap-2">
              <div className="h-10 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                +91
              </div>
              <Input
                type="tel"
                placeholder="98765 43210"
                value={phoneValue}
                onChange={handlePhoneChange}
                disabled={isPending}
                className="h-10 text-xs font-mono font-bold rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500"
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] font-semibold text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* WhatsApp Enabled Switch Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={WhatsappIcon} className="size-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-zinc-900 dark:text-white block font-display">
                  Enable WhatsApp Dispatches
                </span>
                <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal block">
                  Send immediate SOS location maps via WhatsApp bot.
                </span>
              </div>
            </div>
            <Controller
              name="whatsappEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="data-checked:bg-emerald-500 data-[checked]:bg-emerald-500 cursor-pointer self-end sm:self-auto"
                />
              )}
            />
          </div>

        </CardContent>

        <CardFooter className="border-t border-zinc-100 dark:border-zinc-800/80 p-4 bg-zinc-50/50 dark:bg-zinc-950/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="h-10 sm:h-9.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-transparent cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 sm:h-9.5 px-5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-2 border-none shadow-md"
          >
            {isPending ? (
              <>
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                {mode === 'create' ? 'Save Contact' : 'Update Contact'}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

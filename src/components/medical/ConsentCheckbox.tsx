import { memo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Calendar03Icon } from '@hugeicons/core-free-icons';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { ConsentCheckboxProps } from '@/types/medical';
import { formatConsentDate } from '@/lib/medical';

export const ConsentCheckbox = memo(function ConsentCheckbox({
  checked,
  acceptedAt,
  disabled = false,
  onCheckedChange,
}: ConsentCheckboxProps) {
  const isAlreadyAccepted = Boolean(acceptedAt);
  const formattedDate = formatConsentDate(acceptedAt);

  if (isAlreadyAccepted) {
    return (
      <div className="p-4 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left select-none font-sans">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider font-display">
                Medical Disclosure Consent Accepted
              </span>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[9px] uppercase font-bold">
                Active
              </Badge>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-normal">
              You authorized medical responders to view emergency blood & allergy information upon decal scan.
            </p>
          </div>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-300 shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 text-left space-y-2 select-none font-sans transition-all">
      <div className="flex items-start gap-3">
        <Checkbox
          id="medical-consent-checkbox"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(Boolean(val))}
          disabled={disabled}
          className="mt-0.5 border-orange-500/50 data-checked:bg-orange-500 data-[checked]:bg-orange-500 cursor-pointer"
        />
        <div className="space-y-1">
          <Label 
            htmlFor="medical-consent-checkbox"
            className="text-xs font-bold text-zinc-900 dark:text-white leading-normal cursor-pointer select-none block"
          >
            I understand that this medical information may be accessed by emergency responders in order to provide medical assistance.
          </Label>
          <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal">
            By checking this box, you grant VaahanSafe permission to display blood group, allergy warnings, and emergency medications to first responders scanning your windshield sticker during an accident.
          </p>
        </div>
      </div>
    </div>
  );
});

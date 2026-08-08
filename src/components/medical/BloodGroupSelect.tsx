import { memo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { HealtcareIcon } from '@hugeicons/core-free-icons';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BloodGroupSelectProps, BloodGroup } from '@/types/medical';
import { bloodGroupOptions } from '@/lib/medical';

export const BloodGroupSelect = memo(function BloodGroupSelect({
  value,
  onChange,
  disabled = false,
  error,
}: BloodGroupSelectProps) {
  const options = bloodGroupOptions();

  return (
    <div className="space-y-1.5 text-left">
      <Select
        value={value || ''}
        onValueChange={(val) => onChange(val as BloodGroup)}
        disabled={disabled}
      >
        <SelectTrigger 
          className="h-10 w-full rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          aria-label="Select Blood Group"
        >
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={HealtcareIcon} className="size-3" />
            </div>
            <SelectValue placeholder="Select Blood Group (e.g. O+)" />
          </div>
        </SelectTrigger>
        
        <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg shadow-xl">
          {options.map((bg) => (
            <SelectItem 
              key={bg} 
              value={bg}
              className="text-xs font-extrabold font-mono cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800 flex items-center justify-between"
            >
              <span>{bg}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-[11px] font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
});

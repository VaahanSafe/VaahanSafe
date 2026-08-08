import { memo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { ContactLimitBannerProps } from '@/types/contacts';

export const ContactLimitBanner = memo(function ContactLimitBanner({
  currentCount,
  maxCount = 5,
}: ContactLimitBannerProps) {
  if (currentCount < maxCount) {
    return null;
  }

  return (
    <Alert className="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 rounded-lg p-4 shadow-sm select-none">
      <div className="flex items-start gap-3">
        <div className="size-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" />
        </div>
        <div className="space-y-1 text-left">
          <AlertTitle className="text-sm font-extrabold text-amber-900 dark:text-amber-100 font-display flex items-center gap-2 tracking-tight">
            Emergency Contact Limit Reached ({currentCount}/{maxCount})
          </AlertTitle>
          <AlertDescription className="text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed font-sans">
            You have already added all {maxCount} emergency contacts allowed per vehicle. Delete an existing contact before adding a new one.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
});

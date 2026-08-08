import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import type { ConfirmDialogProps } from '@/types/shared';
import { cn } from '@/lib/utils';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmationPhrase,
  loading = false,
  variant = 'default',
  onConfirm,
  onCancel
}) => {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setTypedPhrase('');
      setIsPending(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (confirmationPhrase && typedPhrase !== confirmationPhrase) return;
    setIsPending(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('[ConfirmDialog] Error during action confirmation:', err);
    } finally {
      setIsPending(false);
    }
  };

  const isButtonDisabled = (confirmationPhrase && typedPhrase !== confirmationPhrase) || loading || isPending;
  const showSpinner = loading || isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !showSpinner && onCancel()}>
      <DialogContent className="max-w-md w-full bg-popover border border-border shadow-md rounded-lg p-5 text-left select-none outline-none">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            {variant === 'danger' && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-550 shrink-0">
                <HugeiconsIcon icon={Alert01Icon} className="size-5" />
              </div>
            )}
            <DialogTitle className="text-sm sm:text-base font-black font-display text-zinc-900 dark:text-white tracking-tight">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-0.5">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Typed validation block */}
        {confirmationPhrase && (
          <div className="space-y-2 my-4">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider block">
              Type <span className="font-mono text-zinc-950 dark:text-white font-extrabold select-all">{confirmationPhrase}</span> to continue:
            </label>
            <Input
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              disabled={showSpinner}
              placeholder={`Type "${confirmationPhrase}"`}
              className="h-8.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-primary w-full outline-none"
            />
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 mt-4 sm:space-x-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={showSpinner}
            className="h-8 text-xs font-semibold px-3 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-secondary cursor-pointer"
          >
            {cancelLabel}
          </Button>

          <Button
            size="sm"
            disabled={isButtonDisabled}
            onClick={handleConfirm}
            className={cn(
              "h-8 text-xs font-extrabold px-3 gap-1.5 rounded-lg border-none cursor-pointer flex items-center justify-center min-w-[80px]",
              variant === 'danger'
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-primary hover:bg-primary/95 text-white"
            )}
          >
            {showSpinner ? (
              <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
            ) : (
              <span>{confirmLabel}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

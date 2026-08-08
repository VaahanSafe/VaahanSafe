import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  Clock01Icon,
  ReturnRequestIcon,
} from '@hugeicons/core-free-icons';
import type { RefundRequestDialogProps } from '@/types/payments';
import {
  formatCurrency,
  formatInvoiceNumber,
  formatInvoiceDate,
  isRefundEligible,
  refundDeadline,
} from '@/lib/payments';
import { cn } from '@/lib/utils';

export const RefundRequestDialog: React.FC<RefundRequestDialogProps> = React.memo(({
  invoice,
  open,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset confirmation state when modal opens/closes
  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setSubmitError(null);
    }
  }, [open]);

  const isEligible = isRefundEligible(invoice);
  const deadlineText = refundDeadline(invoice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible || !confirmed || loading) return;

    setSubmitError(null);
    try {
      await onConfirm();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit refund request. Please try again.');
    }
  };

  // Determine why refund is unavailable
  const getIneligibilityReason = () => {
    if (invoice.status === 'refunded') {
      return 'This invoice has already been refunded.';
    }
    if (invoice.status === 'failed') {
      return 'Failed payments are not eligible for refunds.';
    }
    if (invoice.status === 'pending') {
      return 'Pending payments are not eligible for refunds. Please wait for payment completion.';
    }
    return `The refund eligibility window has closed. ${deadlineText}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !loading) onCancel(); }}>
      <DialogContent className="sm:max-w-md bg-popover border border-border rounded-lg p-5 text-left font-sans select-none">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={ReturnRequestIcon} className="size-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Request Subscription Refund
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Refund processing immediately downgrades your account access and cancels active subscriptions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Invoice Summary Details Card */}
          <div className="rounded-lg bg-secondary/30 dark:bg-secondary/10 border border-border/50 p-3 space-y-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Invoice Details
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground">Invoice Number</span>
                <span className="font-mono font-medium text-foreground">
                  {formatInvoiceNumber(invoice.invoiceNumber)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground">Plan Tier</span>
                <span className="font-semibold text-foreground">{invoice.planName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground">Amount Refunded</span>
                <span className="font-bold text-foreground">{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground">Tax (GST 18%)</span>
                <span className="font-semibold text-muted-foreground">{formatCurrency(invoice.gst)}</span>
              </div>
              <div className="flex flex-col col-span-2 gap-0.5 pt-1 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground">Purchase Date</span>
                <span className="font-medium text-foreground">{formatInvoiceDate(invoice.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Refund policy guidelines check */}
          {isEligible ? (
            <div className="space-y-4">
              {/* Alert message detailing refund timing details */}
              <Alert className="bg-amber-500/5 border-amber-500/20 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                <HugeiconsIcon icon={Clock01Icon} className="size-3.5 mt-0.5" />
                <div>
                  <AlertTitle className="text-xs font-semibold">Refund Deadline Warning</AlertTitle>
                  <AlertDescription className="text-[11px] text-amber-600/90 dark:text-amber-400/80 leading-normal">
                    {deadlineText}. Refund requests are final and cannot be undone.
                  </AlertDescription>
                </div>
              </Alert>

              {/* Confirmation checkbox */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/80 bg-background/50 hover:bg-secondary/10 transition-colors">
                <Checkbox
                  id="confirm-refund"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(!!checked)}
                  disabled={loading}
                />
                <div className="grid gap-0.5 leading-none cursor-pointer select-none">
                  <label
                    htmlFor="confirm-refund"
                    className="text-xs font-semibold text-foreground cursor-pointer"
                  >
                    Confirm access revocation
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    I understand my subscription features will terminate immediately and access is revoked.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Non-eligible state display message */
            <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              <HugeiconsIcon icon={Alert02Icon} className="size-3.5 mt-0.5" />
              <div>
                <AlertTitle className="text-xs font-semibold">Refund Unavailable</AlertTitle>
                <AlertDescription className="text-[11px] text-red-600/90 dark:text-red-400/80 leading-normal">
                  {getIneligibilityReason()} If you need help, contact customer support.
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Action error alerts */}
          {submitError && (
            <div className="text-[10px] font-semibold text-red-500 dark:text-red-400 leading-snug flex items-start gap-1">
              <HugeiconsIcon icon={Alert02Icon} className="size-3.5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <DialogFooter className="pt-3 border-t border-border/60 gap-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="h-8 text-xs font-medium rounded-lg px-3 hover:bg-secondary border border-border"
            >
              Cancel
            </Button>
            {isEligible && (
              <Button
                type="submit"
                variant="destructive"
                disabled={!confirmed || loading}
                className={cn(
                  'h-8 text-xs font-semibold rounded-lg px-3 bg-red-600 hover:bg-red-700 text-white gap-1.5 justify-center items-center',
                  (!confirmed || loading) && 'opacity-50 pointer-events-none'
                )}
              >
                {loading ? (
                  <Spinner className="size-3.5 text-current animate-spin" />
                ) : (
                  <>
                    <HugeiconsIcon icon={ReturnRequestIcon} className="size-3.5" />
                    Request Refund
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

RefundRequestDialog.displayName = 'RefundRequestDialog';

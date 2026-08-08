import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import { CreditCardIcon, CheckmarkCircle02Icon, Alert02Icon } from '@hugeicons/core-free-icons';
import type { RazorpayCheckoutButtonProps, RazorpayResponse } from '@/types/payments';
import { loadRazorpayScript, buildRazorpayOptions } from '@/lib/payments';
import { cn } from '@/lib/utils';

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = React.memo(({
  createOrder,
  verifyPayment,
  loading = false,
  disabled = false,
  children,
}) => {
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'open' | 'verifying' | 'success' | 'failed' | 'cancelled'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePaymentLaunch = async () => {
    if (checkoutState === 'loading' || checkoutState === 'open' || checkoutState === 'verifying') return;

    setCheckoutState('loading');
    setErrorMsg(null);

    try {
      // 1. Lazy-load Razorpay Checkout Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay Payment Gateway SDK. Please verify your connection.');
      }

      // 2. Fetch the backend order payload (secure key_id, amount, order_id)
      const orderPayload = await createOrder();

      // 3. Construct Checkout Options
      const options = buildRazorpayOptions(
        orderPayload,
        async (response: RazorpayResponse) => {
          // Success Response handler callback from Razorpay Modal
          setCheckoutState('verifying');
          try {
            await verifyPayment(response);
            setCheckoutState('success');
          } catch (verifyError: any) {
            setCheckoutState('failed');
            setErrorMsg(verifyError?.message || 'Payment verification failed on server.');
          }
        }
      );

      // Inject close handler
      (options as any).modal = {
        ondismiss: () => {
          setCheckoutState('cancelled');
        },
      };

      // 4. Initialize Razorpay Widget
      const rzpInstance = new (window as any).Razorpay(options);

      // Handle payment errors inside iframe
      rzpInstance.on('payment.failed', (failedResponse: any) => {
        setCheckoutState('failed');
        setErrorMsg(failedResponse.error?.description || 'Transaction declined.');
      });

      // 5. Present Checkout Widget to User
      setCheckoutState('open');
      rzpInstance.open();

    } catch (checkoutError: any) {
      setCheckoutState('failed');
      setErrorMsg(checkoutError?.message || 'Checkout failed to initialize.');
    }
  };

  // State indicators and labels
  const isProcessing = loading || checkoutState === 'loading' || checkoutState === 'verifying';
  const isButtonDisabled = disabled || isProcessing || checkoutState === 'open';

  // Determine styling based on payment state
  const buttonStyleClasses = React.useMemo(() => {
    switch (checkoutState) {
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600 text-white border-transparent';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10';
    }
  }, [checkoutState]);

  const getButtonText = () => {
    switch (checkoutState) {
      case 'loading':
        return 'Preparing Checkout...';
      case 'open':
        return 'Checkout Open';
      case 'verifying':
        return 'Verifying Payment...';
      case 'success':
        return 'Success';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Cancelled - Retry';
      case 'idle':
      default:
        return children || 'Pay with Razorpay';
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left font-sans select-none">
      <Button
        className={cn(
          'w-full font-semibold transition-all duration-200 rounded-lg text-xs gap-2 h-9 justify-center items-center',
          buttonStyleClasses
        )}
        onClick={handlePaymentLaunch}
        disabled={isButtonDisabled}
      >
        {isProcessing ? (
          <Spinner className="size-3.5 text-current animate-spin" />
        ) : checkoutState === 'success' ? (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 animate-scale-up" />
        ) : checkoutState === 'failed' ? (
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
        ) : (
          <HugeiconsIcon icon={CreditCardIcon} className="size-4" />
        )}
        <span>{getButtonText()}</span>
      </Button>

      {/* Localized feedback error message for failing payments */}
      {errorMsg && (
        <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 mt-1.5 leading-snug flex items-start gap-1">
          <HugeiconsIcon icon={Alert02Icon} className="size-3 shrink-0 mt-0.5" />
          {errorMsg}
        </span>
      )}
    </div>
  );
});

RazorpayCheckoutButton.displayName = 'RazorpayCheckoutButton';

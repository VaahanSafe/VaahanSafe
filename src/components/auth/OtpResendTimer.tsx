import { useCountdown } from "@/hooks/useCountdown";
import type { OtpResendTimerProps } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

export default function OtpResendTimer({
  initialSeconds,
  loading = false,
  onResend,
  className = "",
}: OtpResendTimerProps) {
  const { formattedTime, finished, reset } = useCountdown(initialSeconds);

  const handleResendClick = async () => {
    if (loading || !finished) return;
    await onResend();
    reset();
  };

  return (
    <div 
      aria-live="polite"
      className={`text-center text-xs font-medium select-none ${className}`}
    >
      {finished ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={handleResendClick}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-bold focus:outline-none bg-transparent hover:bg-transparent cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Spinner className="size-3 text-orange-500 animate-spin" />
                <span>Requesting code...</span>
              </span>
            ) : (
              "Resend Code"
            )}
          </Button>
        </motion.div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 leading-normal font-sans py-2">
          Resend code in <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{formattedTime}</span>
        </p>
      )}
    </div>
  );
}

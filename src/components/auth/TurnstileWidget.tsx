import React, { useState, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { TurnstileWidgetProps, TurnstileWidgetRef } from "@/types/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  (
    {
      siteKey,
      onVerify,
      onExpire,
      onError,
      onLoad,
      theme = "auto",
      size = "normal",
      appearance = "always",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [verified, setVerified] = useState(false);
    const [, setToken] = useState<string | null>(null);
    const [, setExpired] = useState(false);
    const turnstileRef = useRef<TurnstileInstance | null>(null);

    useImperativeHandle(ref, () => ({
      execute: () => {
        turnstileRef.current?.execute();
      },
      reset: () => {
        setError(false);
        setExpired(false);
        setVerified(false);
        setToken(null);
        setLoading(true);
        turnstileRef.current?.reset();
      },
      remove: () => {
        turnstileRef.current?.remove();
      },
      getResponse: () => {
        return turnstileRef.current?.getResponse() || null;
      },
    }));

    const handleSuccess = useCallback(
      (token: string) => {
        setError(false);
        setExpired(false);
        setVerified(true);
        setToken(token);
        onVerify(token);
      },
      [onVerify]
    );

    const handleLoad = useCallback(() => {
      setLoading(false);
      onLoad?.();
    }, [onLoad]);

    const handleExpire = useCallback(() => {
      setExpired(true);
      onExpire?.();
    }, [onExpire]);

    const handleFailure = useCallback(() => {
      setError(true);
      onError?.();
    }, [onError]);

    if (!siteKey) {
      return (
        <Alert variant="destructive" className="max-w-[300px]">
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertTitle>Missing Site Key</AlertTitle>
          <AlertDescription>Cloudflare Turnstile site key is missing.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 shadow-sm w-fit select-none",
          className
        )}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error-alert"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Alert variant="destructive" className="max-w-[300px] border-red-500/20 bg-red-500/5">
                <HugeiconsIcon icon={Alert02Icon} className="size-4 text-red-500" />
                <AlertTitle className="text-red-500 font-bold">Verification failed.</AlertTitle>
                <AlertDescription className="text-red-400">Please refresh and try again.</AlertDescription>
              </Alert>
            </motion.div>
          ) : verified ? (
            <motion.div
              key="verified-status"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex items-center justify-between border border-emerald-500/25 dark:border-emerald-500/35 bg-emerald-500/10 rounded-lg px-4 py-3 gap-8 select-none",
                size === "compact" ? "flex-col w-[130px] h-[120px] justify-center py-4 text-center gap-2" : "w-[300px] h-[65px] flex-row"
              )}
            >
              <div className={cn("flex items-center gap-2.5", size === "compact" && "flex-col gap-1.5")}>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400">Human Session Verified</span>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase select-none">CLOUDFLARE</span>
            </motion.div>
          ) : (
            <motion.div
              key="widget-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              {loading && (
                <Skeleton
                  className={cn(
                    "bg-zinc-100 dark:bg-zinc-900",
                    size === "compact" ? "w-[130px] h-[120px]" : "w-[300px] h-[65px]"
                  )}
                />
              )}
              
              <div 
                className={cn(
                  "transition-all duration-200",
                  loading ? "absolute invisible pointer-events-none" : "block",
                  disabled ? "opacity-50 pointer-events-none" : "opacity-100"
                )}
              >
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  options={{
                    theme,
                    size,
                    appearance,
                  }}
                  onSuccess={handleSuccess}
                  onExpire={handleExpire}
                  onError={handleFailure}
                  onLoad={handleLoad}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

export default React.memo(TurnstileWidget);

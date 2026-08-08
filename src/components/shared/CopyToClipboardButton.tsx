import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { copyToClipboard } from '@/lib/shared';
import { toast } from 'sonner';
import type { CopyToClipboardButtonProps } from '@/types/shared';

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = React.memo(({
  text,
  label = 'Copy to clipboard'
}) => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy text');
    }
  };

  const animProps = shouldReduceMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { scale: 0.7, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.7, opacity: 0 } };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-secondary cursor-pointer shrink-0 flex items-center justify-center"
            aria-label={label}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="copied"
                  {...animProps}
                  transition={{ duration: 0.15 }}
                  className="text-emerald-500 flex items-center justify-center"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 animate-none" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  {...animProps}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center text-zinc-500 dark:text-zinc-400"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="size-4 animate-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-950 text-white border border-zinc-850 text-[10px] py-1 px-2.5 rounded-lg font-sans font-semibold">
          {copied ? 'Copied!' : label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

CopyToClipboardButton.displayName = 'CopyToClipboardButton';

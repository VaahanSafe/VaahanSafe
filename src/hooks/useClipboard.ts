import { useState, useCallback } from 'react';

export interface UseClipboardOptions {
  timeoutMs?: number; // Reset copied state after ms (default: 2000ms)
}

/**
 * Enterprise Clipboard Hook
 * Uses modern Async Clipboard API with execCommand legacy fallback.
 */
export function useClipboard({ timeoutMs = 2000 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      setError(null);

      if (!text) {
        setError('Nothing to copy');
        return false;
      }

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Legacy execCommand fallback
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (!success) {
            throw new Error('execCommand copy failed');
          }
        }

        setCopied(true);
        setTimeout(() => setCopied(false), timeoutMs);
        return true;
      } catch (err: any) {
        setError(err?.message || 'Failed to copy to clipboard');
        setCopied(false);
        return false;
      }
    },
    [timeoutMs]
  );

  return { copy, copied, error };
}

export default useClipboard;

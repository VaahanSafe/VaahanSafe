import { useState, memo } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Cancel01Icon } from '@hugeicons/core-free-icons';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AllergyTagInputProps } from '@/types/medical';
import { uniqueTags } from '@/lib/medical';

export const AllergyTagInput = memo(function AllergyTagInput({
  value = [],
  onChange,
  disabled = false,
  placeholder = 'Add allergy (e.g. Peanuts, Penicillin)...',
  error,
}: AllergyTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTagString = (rawText: string) => {
    if (!rawText || disabled) return;

    const candidates = rawText.split(',').map((s) => s.trim()).filter(Boolean);
    if (candidates.length === 0) return;

    const updated = uniqueTags([...value, ...candidates]);
    onChange(updated);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (inputValue.trim()) {
        e.preventDefault();
        addTagString(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && pasted.includes(',')) {
      e.preventDefault();
      addTagString(pasted);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2 text-left select-none font-sans">
      {/* Active Tags Display */}
      <div className="flex flex-wrap gap-2 min-h-6">
        <AnimatePresence>
          {value.map((tag, index) => (
            <motion.span
              key={`${tag}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 font-semibold text-xs tracking-wide shadow-xs"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="size-4 rounded-lg flex items-center justify-center hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 cursor-pointer transition-colors"
                  aria-label={`Remove allergy ${tag}`}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Input row */}
      {value.length < 20 && (
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : 'Add another allergy...'}
            disabled={disabled}
            maxLength={50}
            className="h-10 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-orange-500"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTagString(inputValue)}
            disabled={disabled || !inputValue.trim()}
            className="h-10 px-3.5 text-xs font-bold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-transparent shrink-0 cursor-pointer flex items-center gap-1"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5 text-orange-500" />
            <span>Add</span>
          </Button>
        </div>
      )}

      {/* Limit hint / Error */}
      <div className="flex items-center justify-between text-[10.5px] text-zinc-500 dark:text-zinc-400 font-mono">
        <span>{value.length}/20 allergies tagged</span>
        {error && <span className="text-red-500 font-bold">{error}</span>}
      </div>
    </div>
  );
});

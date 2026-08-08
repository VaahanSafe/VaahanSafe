import { useState, memo } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Delete02Icon, HealtcareIcon } from '@hugeicons/core-free-icons';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MedicationListProps } from '@/types/medical';
import { uniqueMedications } from '@/lib/medical';

export const MedicationList = memo(function MedicationList({
  value = [],
  onChange,
  disabled = false,
  placeholder = 'e.g. Insulin 10 units / Aspirin / EpiPen...',
  error,
}: MedicationListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddMedication = () => {
    if (!inputValue.trim() || disabled) return;
    const updated = uniqueMedications([...value, inputValue]);
    onChange(updated);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMedication();
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (disabled) return;
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3 text-left select-none font-sans">
      {/* Input row */}
      {value.length < 20 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={100}
            className="h-10 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-orange-500 w-full"
          />
          <Button
            type="button"
            onClick={handleAddMedication}
            disabled={disabled || !inputValue.trim()}
            className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shrink-0 border-none shadow-xs w-full sm:w-auto"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            <span>Add Medication</span>
          </Button>
        </div>
      )}

      {/* Medication Items List */}
      {value.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
            No emergency medications listed.
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {value.map((med, index) => (
              <motion.div
                key={`${med}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-7 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={HealtcareIcon} className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {med}
                    </span>
                  </div>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      className="size-7 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10 cursor-pointer shrink-0"
                      title="Remove Medication"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center justify-between text-[10.5px] text-zinc-500 dark:text-zinc-400 font-mono">
        <span>{value.length}/20 medications recorded</span>
        {error && <span className="text-red-500 font-bold">{error}</span>}
      </div>
    </div>
  );
});

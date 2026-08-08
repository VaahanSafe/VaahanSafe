import { useState, useEffect, useCallback } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Menu01Icon, 
  Sorting01Icon, 
  User03Icon, 
  Call02Icon, 
  WhatsappIcon, 
  UserGroupIcon, 
  PencilEdit02Icon, 
  Delete02Icon 
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { ContactPriorityListProps, EmergencyContact } from '@/types/contacts';
import { maskPhoneNumber, relationshipLabel } from '@/lib/contacts';

export function ContactPriorityList({
  contacts,
  loading = false,
  onReorder,
  onEditContact,
  onDeleteContact,
  onToggleWhatsApp,
}: ContactPriorityListProps) {
  const [items, setItems] = useState<EmergencyContact[]>(contacts);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if props change from external source
  useEffect(() => {
    setItems(contacts);
  }, [contacts]);

  // Reorder handler called by Framer Motion during active drag
  const handleReorderLocal = (newOrder: EmergencyContact[]) => {
    const reorderedWithPriorities = newOrder.map((contact, idx) => ({
      ...contact,
      priority: idx + 1,
    }));
    setItems(reorderedWithPriorities);
  };

  // Called when dragging finishes to send ONE bulk request to backend
  const handleDragEnd = useCallback(async () => {
    const finalContacts = items.map((c, idx) => ({
      ...c,
      priority: idx + 1,
    }));

    setIsSaving(true);
    try {
      await onReorder(finalContacts);
      toast.success('Emergency contact priority order saved');
    } catch (err) {
      toast.error('Failed to save contact priorities. Rolling back changes.');
      setItems(contacts);
    } finally {
      setIsSaving(false);
    }
  }, [items, contacts, onReorder]);

  const isPending = loading || isSaving;

  if (!items || items.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900/90 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center select-none">
        <div className="size-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-3">
          <HugeiconsIcon icon={Sorting01Icon} className="size-6" />
        </div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 font-display">
          No Emergency Contacts Registered
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          Add up to 5 emergency contacts to receive instant WhatsApp notifications & roadside dispatches in priority order.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 relative select-none font-sans">
      {/* Priority Instruction Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-zinc-500 dark:text-zinc-400">
          <HugeiconsIcon icon={Sorting01Icon} className="size-3.5 text-orange-500 shrink-0" />
          Drag rows to reorder alert priority (Highest Priority #1)
        </span>
        {isSaving && (
          <span className="flex items-center gap-1.5 text-orange-500 text-[11px] font-bold animate-pulse">
            <span className="size-2 rounded-full bg-orange-500 animate-ping" />
            Saving priority order...
          </span>
        )}
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center pointer-events-none" />
      )}

      {/* Reorder Group Container */}
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorderLocal}
        className="space-y-2.5"
      >
        <AnimatePresence>
          {items.map((contact, index) => {
            const maskedPhone = maskPhoneNumber(contact.phone);
            const relText = relationshipLabel(contact.relationship);
            const displayPriority = index + 1;
            const isTopPriority = displayPriority === 1;

            return (
              <Reorder.Item
                key={contact.id}
                value={contact}
                onDragEnd={handleDragEnd}
                className="touch-none"
              >
                <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 sm:p-4 shadow-sm hover:shadow-md active:border-orange-500/50 active:shadow-orange-500/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  
                  {/* Left Section: Drag Handle & Details */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    
                    {/* Drag Handle Icon */}
                    <div 
                      className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-orange-500 hover:bg-orange-500/10 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                      title="Drag to reorder priority"
                    >
                      <HugeiconsIcon icon={Menu01Icon} className="size-5" />
                    </div>

                    {/* Priority Badge */}
                    <div className="shrink-0">
                      <Badge
                        variant="outline"
                        className={`h-7 min-w-7 px-2 rounded-lg font-mono font-black text-xs flex items-center justify-center transition-colors ${
                          isTopPriority
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none shadow-xs'
                            : 'border-orange-500/30 bg-orange-500/10 text-orange-500 font-bold'
                        }`}
                      >
                        #{displayPriority}
                      </Badge>
                    </div>

                    {/* Contact Avatar */}
                    <div className="size-9 rounded-lg bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={User03Icon} className="size-4" />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate font-display">
                          {contact.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
                          <HugeiconsIcon icon={UserGroupIcon} className="size-3 text-orange-500 shrink-0" />
                          {relText}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                        <HugeiconsIcon icon={Call02Icon} className="size-3 text-orange-500/80 shrink-0" />
                        <span>{maskedPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: WhatsApp Switch & Quick Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60 pt-2 sm:pt-0 shrink-0">
                    
                    {/* WhatsApp Toggle */}
                    <div 
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
                        contact.whatsappEnabled
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <HugeiconsIcon
                        icon={WhatsappIcon}
                        className={`size-3.5 ${contact.whatsappEnabled ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400'}`}
                      />
                      <span className="text-[10px] font-extrabold font-mono">
                        WhatsApp
                      </span>
                      <Switch
                        checked={contact.whatsappEnabled}
                        onCheckedChange={(checked) => onToggleWhatsApp?.(contact.id, checked)}
                        className="scale-90 data-checked:bg-emerald-500 data-[checked]:bg-emerald-500 cursor-pointer"
                        aria-label={`Toggle WhatsApp for ${contact.name}`}
                      />
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      {onEditContact && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditContact(contact)}
                          className="size-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                          title="Edit Contact"
                        >
                          <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
                        </Button>
                      )}

                      {onDeleteContact && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteContact(contact.id)}
                          className="size-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                          title="Delete Contact"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                        </Button>
                      )}
                    </div>

                  </div>

                </Card>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}

import { memo } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  User03Icon, 
  Call02Icon, 
  WhatsappIcon, 
  UserGroupIcon, 
  PencilEdit02Icon, 
  Delete02Icon, 
  MoreVerticalIcon
} from '@hugeicons/core-free-icons';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import type { ContactCardProps } from '@/types/contacts';
import { maskPhoneNumber, relationshipLabel } from '@/lib/contacts';

export const ContactCard = memo(function ContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleWhatsApp
}: ContactCardProps) {
  const maskedPhone = maskPhoneNumber(contact.phone);
  const relText = relationshipLabel(contact.relationship);
  const isTopPriority = contact.priority === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:shadow-md dark:hover:border-zinc-700/80 transition-all overflow-hidden select-none">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Contact Main Details */}
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {/* Priority Badge Indicator */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <Badge 
                variant="outline"
                className={`h-8 min-w-8 px-2 rounded-lg font-mono font-black text-xs flex items-center justify-center p-0 transition-all ${
                  isTopPriority 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none shadow-xs' 
                    : 'border-orange-500/30 bg-orange-500/10 text-orange-500'
                }`}
              >
                #{contact.priority}
              </Badge>
              <span className="text-[9px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500 mt-1">
                PRIORITY
              </span>
            </div>

            {/* Avatar Icon Box */}
            <div className="size-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={User03Icon} className="size-5" />
            </div>

            {/* Information */}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate tracking-tight font-display">
                  {contact.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
                  <HugeiconsIcon icon={UserGroupIcon} className="size-3 text-orange-500 shrink-0" />
                  {relText}
                </span>
              </div>

              {/* Phone Number Display */}
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                <HugeiconsIcon icon={Call02Icon} className="size-3.5 text-orange-500/80 shrink-0" />
                <span>{maskedPhone}</span>
              </div>
            </div>
          </div>

          {/* Right Control Actions (WhatsApp Switch & Dropdown) */}
          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60 pt-3 sm:pt-0 shrink-0">
            {/* WhatsApp Dispatch Toggle Pill */}
            <div 
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all ${
                contact.whatsappEnabled
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon 
                  icon={WhatsappIcon} 
                  className={`size-4 ${contact.whatsappEnabled ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400'}`} 
                />
                <span className="text-[11px] font-extrabold font-mono">
                  WhatsApp
                </span>
              </div>
              <Switch
                checked={contact.whatsappEnabled}
                onCheckedChange={(checked) => onToggleWhatsApp?.(checked)}
                className="data-checked:bg-emerald-500 data-[checked]:bg-emerald-500 cursor-pointer"
                aria-label={`Toggle WhatsApp notifications for ${contact.name}`}
              />
            </div>

            {/* Quick Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="h-9 w-9 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 cursor-pointer flex items-center justify-center transition-colors"
                aria-label="Contact Quick Actions"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-1.5 rounded-lg shadow-2xl w-44 select-none"
              >
                <DropdownMenuItem 
                  onClick={onEdit}
                  className="text-xs font-semibold cursor-pointer rounded-lg px-2.5 py-2 text-zinc-800 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-white focus:bg-zinc-100 dark:focus:bg-zinc-800/80 flex items-center gap-2.5 transition-colors"
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} className="size-4 text-orange-500 shrink-0" />
                  <span>Edit Contact</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />

                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-xs font-semibold cursor-pointer rounded-lg px-2.5 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:bg-red-500/10 dark:focus:bg-red-500/15 flex items-center gap-2.5 transition-colors"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4 text-red-500 shrink-0" />
                  <span>Delete Contact</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
});

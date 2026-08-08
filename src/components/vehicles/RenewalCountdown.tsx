import React from "react";
import type { RenewalCountdownProps } from "@/types/vehicle";
import { daysUntilRenewal, renewalStatusColor } from "@/lib/vehicle";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const RenewalCountdown: React.FC<RenewalCountdownProps> = ({
  renewalDate,
  className = "",
}) => {
  const days = daysUntilRenewal(renewalDate);
  const colorClass = renewalStatusColor(days);
  const isExpired = days <= 0;

  const displayLabel = isExpired ? "Expired" : `${days} Days Left`;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold select-none shadow-xs font-sans w-fit transition-all duration-200",
        colorClass,
        className
      )}
    >
      <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 shrink-0 opacity-80" />
      <motion.span
        key={displayLabel}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        {displayLabel}
      </motion.span>
    </div>
  );
};

export default React.memo(RenewalCountdown);

import React from "react";
import type { VehicleStatusBadgeProps } from "@/types/vehicle";
import { statusLabel, statusIcon } from "@/lib/vehicle";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const label = statusLabel(status);
  const icon = statusIcon(status);

  const stylesMap = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    expired: "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    suspended: "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
  };

  const badgeStyle = stylesMap[status] || stylesMap.suspended;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-semibold tracking-wide font-sans select-none w-fit",
        badgeStyle,
        className
      )}
    >
      <HugeiconsIcon icon={icon} className="size-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export default React.memo(VehicleStatusBadge);

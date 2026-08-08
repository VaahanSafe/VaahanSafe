import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Car01Icon,
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Delete02Icon,
  Download01Icon,
  Calendar03Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import type { VehicleCardProps } from "@/types/vehicle";
import { formatVehicleNumber } from "@/lib/vehicle";
import VehicleStatusBadge from "./VehicleStatusBadge";
import QRCodeDisplay from "./QRCodeDisplay";
import QRCodeDownloadButton from "./QRCodeDownloadButton";
import RenewalCountdown from "./RenewalCountdown";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onEdit,
  onDelete,
  onRenew,
  onDownloadQR,
  onView,
  className = "",
}) => {
  const formattedPlate = formatVehicleNumber(vehicle.licensePlate);
  const formattedDate = new Date(vehicle.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("w-full h-full", className)}
    >
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-zinc-950/50 transition-shadow duration-300 p-4 flex flex-col justify-between h-full font-sans text-zinc-950 dark:text-white">
        
        {/* Header */}
        <CardHeader className="p-0 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Car01Icon} className="size-4.5" />
            </div>
            <div className="text-left">
              <span className="font-mono text-sm font-extrabold tracking-wider">{formattedPlate}</span>
              <div className="mt-0.5">
                <VehicleStatusBadge status={vehicle.status} />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={false}
              render={
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850/60 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Actions Menu"
                >
                  <HugeiconsIcon icon={MoreHorizontalCircle01Icon} className="size-5" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44 font-sans">
              <DropdownMenuItem onClick={onView} className="cursor-pointer">
                <HugeiconsIcon icon={EyeIcon} className="size-3.5 text-zinc-500" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5 text-zinc-500" />
                <span>Edit Note</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadQR} className="cursor-pointer">
                <HugeiconsIcon icon={Download01Icon} className="size-3.5 text-zinc-500" />
                <span>Download Sticker</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRenew} className="cursor-pointer">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-zinc-500" />
                <span>Renew Validity</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete} 
                variant="destructive"
                className="cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5 text-red-500" />
                <span>Delete Vehicle</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <Separator className="my-3 bg-zinc-100 dark:bg-zinc-800" />

        {/* Body */}
        <CardContent className="p-0 flex-1 grid grid-cols-[1fr_auto] items-start gap-4 text-left">
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold block">Sticker Note</span>
              <p className="text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-300 leading-normal line-clamp-2">
                {vehicle.note || "No custom sticker note configured."}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold block">Subscription Validity</span>
                <RenewalCountdown renewalDate={vehicle.renewalDate} />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-550 block font-sans">
                Registered: {formattedDate}
              </span>
            </div>
          </div>

          <QRCodeDisplay imageUrl={vehicle.qrImageUrl} vehicleNumber={vehicle.licensePlate} />
        </CardContent>

        <Separator className="my-3 bg-zinc-100 dark:bg-zinc-800" />

        {/* Footer */}
        <CardFooter className="p-0 flex items-center gap-2 mt-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1 text-[11px] font-bold rounded-lg cursor-pointer h-8"
          >
            View
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-[11px] font-bold rounded-lg cursor-pointer h-8"
          >
            Edit
          </Button>
          <QRCodeDownloadButton 
            vehicleId={vehicle.id}
            licensePlate={vehicle.licensePlate}
            subscriptionStatus={vehicle.status}
            downloadUrl={vehicle.qrImageUrl} 
            filename={`qr-${vehicle.licensePlate}.png`}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={onRenew}
            className="flex-1 text-[11px] font-bold rounded-lg cursor-pointer bg-orange-500 hover:bg-orange-600 text-white h-8 transition-colors duration-200"
          >
            Renew
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default React.memo(VehicleCard);

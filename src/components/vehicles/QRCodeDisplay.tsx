import React, { useState, useEffect } from "react";
import type { QRCodeDisplayProps } from "@/types/vehicle";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { QrCodeIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  imageUrl,
  vehicleNumber,
  loading = false,
  className = "",
}) => {
  const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://vaahansafe.com/scan/${vehicleNumber || 'VAAHANSAFE'}`)}`;

  const [currentSrc, setCurrentSrc] = useState<string>(imageUrl || fallbackUrl);
  const [hasTriedFallback, setHasTriedFallback] = useState<boolean>(!imageUrl);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initial = imageUrl || fallbackUrl;
    setCurrentSrc(initial);
    setHasTriedFallback(!imageUrl);
    setImgLoading(true);
    setImgError(false);
  }, [imageUrl, vehicleNumber, fallbackUrl]);

  const handleImageLoad = () => {
    setImgLoading(false);
  };

  const handleImageError = () => {
    if (!hasTriedFallback) {
      setHasTriedFallback(true);
      setCurrentSrc(fallbackUrl);
    } else {
      setImgLoading(false);
      setImgError(true);
    }
  };

  const isWidgetLoading = loading || (imgLoading && !imgError);

  return (
    <>
      <div
        className={cn(
          "relative flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] rounded-lg overflow-hidden cursor-zoom-in group size-24 shrink-0 select-none shadow-md transition-all hover:border-orange-500/40",
          className
        )}
        onClick={() => {
          if (!imgError && !isWidgetLoading) setOpen(true);
        }}
      >
        {isWidgetLoading && (
          <Skeleton className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 animate-pulse size-full" />
        )}

        {imgError ? (
          <div className="flex flex-col items-center justify-center p-2 text-center text-amber-500 gap-1 size-full">
            <HugeiconsIcon icon={Alert02Icon} className="size-5" />
            <span className="text-[9px] font-bold font-mono">QR Error</span>
          </div>
        ) : (
          <motion.img
            src={currentSrc}
            alt={`QR sticker code decal for vehicle ${vehicleNumber}`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoading ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "object-contain p-2 w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-105 bg-white",
              imgLoading ? "invisible" : "visible"
            )}
          />
        )}

        {!imgError && !isWidgetLoading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white rounded-lg">
            <HugeiconsIcon icon={QrCodeIcon} className="size-5 text-white" />
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 max-w-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xl flex flex-col items-center text-center font-sans">
          <DialogTitle className="text-sm font-extrabold text-zinc-900 dark:text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
            <HugeiconsIcon icon={QrCodeIcon} className="size-4 text-orange-500" />
            Windshield Decal Preview
          </DialogTitle>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mb-4">VEHICLE ID: {vehicleNumber}</p>
          
          <div className="relative border border-zinc-200 dark:border-zinc-800 bg-white p-4 rounded-lg shadow-inner flex items-center justify-center size-64 select-none">
            <img
              src={currentSrc}
              alt={`Enlarged QR sticker decal for vehicle ${vehicleNumber}`}
              className="object-contain w-full h-full"
            />
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-4 leading-normal font-medium">
            Bystanders scan this windshield code decal to securely connect with your emergency contacts anonymously.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(QRCodeDisplay);

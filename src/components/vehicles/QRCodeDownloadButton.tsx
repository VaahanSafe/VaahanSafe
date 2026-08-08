import React, { useState } from "react";
import type { QRCodeDownloadButtonProps } from "@/types/vehicle";
import { downloadVehicleSticker, downloadVehicleCertificate } from "@/features/vehicles/vehicles.api";
import { downloadSignedFile } from "@/lib/vehicle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, FileValidationIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { motion } from "framer-motion";

const QRCodeDownloadButton: React.FC<QRCodeDownloadButtonProps> = ({
  downloadUrl,
  vehicleId,
  licensePlate = "vehicle",
  subscriptionStatus = "pending",
  loading = false,
  filename = "vehicle-qr-sticker.png",
  className = "",
}) => {
  const [downloadingSticker, setDownloadingSticker] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const checkActiveSubscription = (): boolean => {
    if (!subscriptionStatus || subscriptionStatus !== "active") {
      toast.error("Active subscription required to download decal stickers & certificates. Please upgrade or renew your plan.");
      return false;
    }
    return true;
  };

  const handleDownloadSticker = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadingSticker || loading) return;
    if (!checkActiveSubscription()) return;

    setDownloadingSticker(true);
    const toastId = toast.loading("Generating printable decal sticker PDF...");

    try {
      if (vehicleId) {
        await downloadVehicleSticker(vehicleId, licensePlate);
        toast.success("Decal sticker PDF downloaded!", { id: toastId });
      } else if (downloadUrl) {
        await downloadSignedFile(downloadUrl, filename);
        toast.success("Decal downloaded successfully!", { id: toastId });
      } else {
        const targetUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`https://vaahansafe.com/scan/${filename.replace('.png', '')}`)}`;
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Decal downloaded successfully!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to download sticker PDF.";
      toast.error(msg, { id: toastId });
    } finally {
      setDownloadingSticker(false);
    }
  };

  const handleDownloadCertificate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadingCert || loading) return;
    if (!checkActiveSubscription()) return;
    if (!vehicleId) {
      toast.error("Vehicle ID missing for certificate download.");
      return;
    }

    setDownloadingCert(true);
    const toastId = toast.loading("Generating official protection certificate PDF...");

    try {
      await downloadVehicleCertificate(vehicleId, licensePlate);
      toast.success("Protection Certificate PDF downloaded!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to download certificate PDF.";
      toast.error(msg, { id: toastId });
    } finally {
      setDownloadingCert(false);
    }
  };

  const isDisabled = downloadingSticker || downloadingCert || loading;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Decal Sticker PDF Download Button */}
      <motion.div
        whileHover={!isDisabled ? { scale: 1.01 } : {}}
        whileTap={!isDisabled ? { scale: 0.99 } : {}}
      >
        <Button
          type="button"
          variant="outline"
          disabled={isDisabled}
          onClick={handleDownloadSticker}
          className="w-full h-10 text-xs font-extrabold uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {downloadingSticker ? (
            <Spinner className="size-4 text-orange-500 animate-spin" />
          ) : (
            <HugeiconsIcon icon={Download01Icon} className="size-4 text-orange-500" />
          )}
          <span>{downloadingSticker ? "Generating Sticker..." : "Download Decal Sticker (PDF)"}</span>
        </Button>
      </motion.div>

      {/* Protection Certificate PDF Download Button (if vehicleId is present) */}
      {vehicleId && (
        <motion.div
          whileHover={!isDisabled ? { scale: 1.01 } : {}}
          whileTap={!isDisabled ? { scale: 0.99 } : {}}
        >
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            onClick={handleDownloadCertificate}
            className="w-full h-9 text-[11px] font-bold uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-2 border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {downloadingCert ? (
              <Spinner className="size-3.5 text-emerald-500 animate-spin" />
            ) : (
              <HugeiconsIcon icon={FileValidationIcon} className="size-3.5 text-emerald-500" />
            )}
            <span>{downloadingCert ? "Generating Certificate..." : "Download Certificate (PDF)"}</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(QRCodeDownloadButton);

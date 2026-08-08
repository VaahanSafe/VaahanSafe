import { useState, useRef, memo } from 'react';
import type { ChangeEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Camera01Icon, 
  Upload01Icon, 
  Delete02Icon, 
  CheckmarkCircle02Icon, 
  Alert02Icon 
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CameraCaptureProps } from '@/types/scan';
import { compressImage } from '@/lib/scan';
import { cn } from '@/lib/utils';

export const CameraCapture = memo(function CameraCapture({
  onCapture,
  onRemove,
  loading = false,
  disabled = false,
  maxSizeBytes = 2 * 1024 * 1024,
  className = '',
}: CameraCaptureProps) {
  const [streamActive, setStreamActive] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Request camera permission ONLY when user clicks "Take Photo"
  const startLiveCamera = async () => {
    if (disabled || loading || compressing) return;
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setStreamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.warn('Live camera access failed or denied, falling back to file picker input.', err);
      setCameraError('Camera access not available. Please pick or snap a photo.');
      fileInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const captureSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopLiveCamera();

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const rawFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        await processAndSetImage(rawFile);
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSetImage(file);
    }
  };

  const processAndSetImage = async (file: File) => {
    setCompressing(true);
    setCameraError(null);
    try {
      const compressed = await compressImage(file, 1920, 0.8, maxSizeBytes);
      const url = URL.createObjectURL(compressed);

      setCapturedFile(compressed);
      setPreviewUrl(url);
      onCapture(compressed);
      toast.success(`Photo captured & compressed (${(compressed.size / 1024).toFixed(0)} KB)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to process photo');
      setCameraError(err.message || 'Image exceeds size limit');
    } finally {
      setCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedFile(null);
    setPreviewUrl(null);
    stopLiveCamera();
    onRemove?.();
  };

  const isPending = loading || compressing;

  return (
    <Card className={cn('bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-md text-left select-none font-sans', className)}>
      
      {/* Fallback Native Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Captured Image Preview */}
      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Evidence photo preview"
              className="object-contain size-full"
            />
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
              <span>UPLOAD READY</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-mono text-zinc-500 dark:text-zinc-400">
              Size: {capturedFile ? `${(capturedFile.size / 1024).toFixed(0)} KB` : ''}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={isPending || disabled}
              className="h-8 px-3 text-xs font-bold rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/10 cursor-pointer flex items-center gap-1"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
              <span>Retake Photo</span>
            </Button>
          </div>
        </div>
      ) : streamActive ? (
        /* Live Camera Stream Container */
        <div className="space-y-3">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="object-cover size-full"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={stopLiveCamera}
              className="h-9 px-4 text-xs font-bold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 bg-transparent cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={captureSnapshot}
              className="h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <HugeiconsIcon icon={Camera01Icon} className="size-4" />
              Snap Photo
            </Button>
          </div>
        </div>
      ) : (
        /* Default Initial Trigger View */
        <div className="space-y-3">
          <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 text-center flex flex-col items-center justify-center space-y-2">
            <div className="size-12 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <HugeiconsIcon icon={Camera01Icon} className="size-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                Attach Evidence Photo (Optional)
              </h4>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Snap or upload a quick photo of the blocked vehicle scene to help responders.
              </p>
            </div>
          </div>

          {cameraError && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} className="size-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={startLiveCamera}
              disabled={isPending || disabled}
              className="flex-1 h-9.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-2 border-none shadow-md"
            >
              <HugeiconsIcon icon={Camera01Icon} className="size-4" />
              <span>Take Photo</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || disabled}
              className="flex-1 h-9.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-2 bg-transparent"
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-4" />
              <span>Choose File</span>
            </Button>
          </div>
        </div>
      )}

    </Card>
  );
});

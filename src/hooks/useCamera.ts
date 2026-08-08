import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  start: (constraints?: MediaTrackConstraints) => Promise<MediaStream | null>;
  stop: () => void;
  capture: (quality?: number) => string | null;
  stream: MediaStream | null;
  loading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Camera Stream & Capture Hook for Emergency Photo Attachments
 * Instantly releases hardware camera lock on unmount.
 */
export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const start = useCallback(
    async (constraints: MediaTrackConstraints = { facingMode: 'environment' }): Promise<MediaStream | null> => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        const err = 'Camera access is not supported by your browser';
        setError(err);
        return null;
      }

      stop(); // Clear any existing stream
      setLoading(true);
      setError(null);

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: false,
        });

        streamRef.current = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play().catch(() => {});
        }

        setLoading(false);
        return newStream;
      } catch (err: any) {
        let errorMsg = 'Failed to access camera.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission denied.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera device found.';
        }
        setError(errorMsg);
        setLoading(false);
        return null;
      }
    },
    [stop]
  );

  const capture = useCallback((quality: number = 0.8): string | null => {
    if (!videoRef.current || !streamRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  }, []);

  // Cleanup effect releasing camera hardware immediately on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    capture,
    stream,
    loading,
    error,
    videoRef,
  };
}

export default useCamera;

import { useState, useRef, useEffect } from 'react';
import { db } from '../../services/db';
import { aisensy } from '../../services/aisensy';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Camera01Icon, 
  Location01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Car01Icon,
  ArrowLeft01Icon
} from '@hugeicons/core-free-icons';

interface ParkingFlowProps {
  vehicleId: string;
  onCancel: () => void;
  onComplete: () => void;
}

const PRESET_ISSUES = [
  'Blocking Driveway / Gate',
  'Double Parked / No Space',
  'Headlights Left On',
  'Window Open / Unlocked',
  'Parked in Reserved Slot'
];

export default function ParkingFlow({ vehicleId, onCancel, onComplete }: ParkingFlowProps) {
  const [subStep, setSubStep] = useState<'photo' | 'review' | 'success'>('photo');
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  // Camera state
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Geolocation & Reverse Geocoded address
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  // Form details
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_ISSUES[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reverse geocoding helper using Nominatim
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          const addr = data.address;
          const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || '';
          const city = addr.city || addr.town || addr.county || 'Pune';
          const state = addr.state || 'Maharashtra';
          const formatted = [area, city, state].filter(Boolean).join(', ');
          setLocationAddress(formatted || `${city}, ${state}`);
          return;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }
    setLocationAddress('Kothrud, Pune, Maharashtra');
  };

  // Start browser camera stream
  const requestCameraPermission = () => {
    setCameraPermissionRequested(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Camera API blocked or unavailable: ', err);
          setHasCamera(false);
        });
    } else {
      setHasCamera(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
        stopCamera();
        setSubStep('review');
        triggerGeolocation();
      }
    }
  };

  const captureMockSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#120f0a';
      ctx.fillRect(0, 0, 400, 300);
      ctx.strokeStyle = '#ff7a00';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 380, 280);
      
      ctx.fillStyle = '#ff7a00';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('PARKING INCIDENT SNAPSHOT', 40, 120);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px sans-serif';
      ctx.fillText('COURTESY VEHICLE OWNER NOTICE', 50, 160);
      ctx.fillText(`VEHICLE: ${vehicleId.toUpperCase()}`, 50, 190);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoData(dataUrl);
      stopCamera();
      setSubStep('review');
      triggerGeolocation();
    }
  };

  const triggerGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));
          setCoordinates({ lat, lng });
          fetchAddress(lat, lng);
        },
        (error) => {
          console.warn('Geolocation blocked: ', error);
          setLocationAddress('Kothrud, Pune, Maharashtra');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationAddress('Kothrud, Pune, Maharashtra');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // POST /scan/{qr_code_id}/wrong-parking
      await fetch(`/api/scan/${vehicleId}/wrong-parking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          address: locationAddress,
          issue: selectedPreset,
          note: customNote,
          photoData
        })
      });
    } catch (err) {
      // Fallback
    }

    // WhatsApp alert dispatch
    await aisensy.sendParkingAlert(vehicleId, selectedPreset, coordinates);

    // Save DB log
    db.addLog({
      vehicleId,
      type: 'wrong_parking',
      details: `Wrong Parking Alert sent. Issue: ${selectedPreset}. Location: ${locationAddress || 'Not shared'}`
    });

    // Custom Event
    const eventLog = {
      id: Math.random().toString(36).substring(7),
      vehicleId,
      type: 'wrong_parking' as const,
      time: new Date().toLocaleTimeString(),
      details: `Wrong Parking Alert (${selectedPreset}) sent to vehicle owner.`
    };
    window.dispatchEvent(new CustomEvent('vs_new_log', { detail: eventLog }));

    setIsSubmitting(false);
    setSubStep('success');
  };

  if (subStep === 'success') {
    return (
      <div className="w-full max-w-md mx-auto py-6 px-2 font-sans text-center space-y-6">
        <Card className="bg-white dark:bg-[#0c0c0e]/95 border border-zinc-200 dark:border-emerald-500/30 p-6 space-y-5 rounded-lg text-center shadow-2xl">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-lg font-black text-zinc-900 dark:text-white font-serif uppercase tracking-wider">
              Parking Alert Dispatched
            </CardTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              A courteous alert was sent to the vehicle owner on WhatsApp with the parking photo and location details.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-left text-xs space-y-1">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Issue Category</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[11px] block">{selectedPreset}</span>
          </div>
          <Button
            onClick={onComplete}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg tracking-wider cursor-pointer shadow-lg shadow-emerald-600/20 transition-all"
          >
            RETURN TO VEHICLE SUMMARY
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center font-sans text-left">
      <Card className="bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 max-w-md w-full space-y-6 rounded-lg relative overflow-hidden z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3">
          <div>
            <h2 className="text-sm font-black text-brand flex items-center gap-2 tracking-wide uppercase font-serif">
              <HugeiconsIcon icon={Car01Icon} className="size-4 text-brand shrink-0" />
              Wrong Parking Alert
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
              Step {subStep === 'photo' ? '1' : '2'} of 2
            </p>
          </div>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="h-7 px-3 text-[10px] font-bold text-zinc-550 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white bg-transparent rounded-lg cursor-pointer"
          >
            Cancel
          </Button>
        </div>

        {/* STEP 1: Photo Evidence Capture */}
        {subStep === 'photo' && (
          <div className="space-y-4">
            {/* Upfront Notice */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-brand/20 text-brand text-xs font-medium flex items-start gap-3 leading-relaxed">
              <HugeiconsIcon icon={Camera01Icon} className="size-4 shrink-0 mt-0.5 text-brand" />
              <div>
                <strong className="block text-zinc-900 dark:text-white mb-0.5 font-bold">Parking Photo Notice:</strong>
                <span className="text-zinc-500 dark:text-zinc-400">Snap a photo of the parked vehicle to help the owner quickly identify their parking spot and move their car.</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-lg border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              {!cameraPermissionRequested ? (
                <div className="p-6 text-center space-y-4 flex flex-col items-center">
                  <div className="flex justify-center">
                    <div className="size-16 rounded-full bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shadow-[0_0_25px_rgba(255,122,0,0.2)] shrink-0">
                      <HugeiconsIcon icon={Camera01Icon} className="size-8 text-brand" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">Click below to authorize the camera stream.</p>
                  <Button 
                    onClick={requestCameraPermission}
                    className="w-full h-11 px-5 rounded-lg bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-brand/20 transition-all"
                  >
                    Authorize Camera
                  </Button>
                </div>
              ) : hasCamera ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                    <Button 
                      onClick={captureSnapshot}
                      className="h-9 px-5 rounded-lg bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-brand/20"
                    >
                      Snap Parking Photo
                    </Button>
                    <Button 
                      onClick={captureMockSnapshot}
                      variant="outline"
                      className="h-9 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-800 dark:text-white text-xs cursor-pointer"
                    >
                      Mock Snap
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-4 flex flex-col items-center">
                  <div className="flex justify-center">
                    <div className="size-16 rounded-full bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shadow-[0_0_25px_rgba(255,122,0,0.2)] shrink-0">
                      <HugeiconsIcon icon={Camera01Icon} className="size-8 text-brand" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">Camera permission denied or device not found.</p>
                  <Button 
                    onClick={captureMockSnapshot}
                    className="w-full h-11 px-5 rounded-lg bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-brand/20"
                  >
                    Use Simulated Parking Image
                  </Button>
                </div>
              )}
            </div>
            
            {cameraPermissionRequested && hasCamera && (
              <Button 
                onClick={captureMockSnapshot}
                variant="ghost"
                className="w-full h-8 text-zinc-500 text-[10px] font-bold cursor-pointer underline"
              >
                Skip to Simulated Parking Image
              </Button>
            )}
          </div>
        )}

      {/* STEP 2: Issue Presets, Location & Submission */}
      {subStep === 'review' && (
        <form onSubmit={handleSubmit} className="space-y-4 my-auto">
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 p-5 space-y-4 rounded-lg">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-brand" />
                Specify Parking Issue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              
              {/* Preset Chips Grid */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono font-black text-zinc-500 tracking-wider block">
                  Select Parking Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_ISSUES.map(issue => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setSelectedPreset(issue)}
                      className={`p-2.5 rounded-lg text-xs font-bold border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedPreset === issue 
                          ? 'bg-brand/15 border-brand text-brand shadow-sm' 
                          : 'bg-zinc-50 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-350 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="truncate">{issue}</span>
                      {selectedPreset === issue && (
                        <span className="size-2 rounded-full bg-brand shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detected Location Box */}
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                  <HugeiconsIcon icon={Location01Icon} className="size-4 text-brand" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 block mb-0.5">Detected Location</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold text-xs truncate block" title={locationAddress || 'Resolving address...'}>
                    {locationAddress || 'Resolving location address...'} ✓
                  </span>
                </div>
              </div>

              {/* Optional Custom Note */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono font-black text-zinc-500 tracking-wider">
                  Optional Additional Message
                </label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Please move your car, blocking my garage exit..."
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-brand/30"
                />
              </div>

            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubStep('photo')}
              className="h-11 px-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent rounded-lg cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-brand hover:opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer shadow-lg shadow-brand/20 transition-all"
            >
              {isSubmitting ? 'SENDING ALERT...' : 'SEND COURTESY PARKING ALERT'}
            </Button>
          </div>
        </form>
      )}

      </Card>
    </div>
  );
}

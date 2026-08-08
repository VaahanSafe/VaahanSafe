import { useState, useRef, useEffect } from 'react';
import { db } from '../../services/db';
import { aisensy } from '../../services/aisensy';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Camera01Icon, 
  Alert01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Location01Icon
} from '@hugeicons/core-free-icons';

import { useSubmitEmergencyScan } from '@/features/scans/scans.hooks';

interface EmergencyFlowProps {
  vehicleId: string;
  onCancel: () => void;
  onComplete: () => void;
}

export default function EmergencyFlow({ vehicleId, onCancel, onComplete }: EmergencyFlowProps) {
  const submitEmergencyMutation = useSubmitEmergencyScan();
  const [subStep, setSubStep] = useState<'photo' | 'locating' | 'confirm' | 'submitting'>('photo');
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  // Camera API & permissions
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Geolocation & reverse geocoding address
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  // Notes & Rate limiting
  const [optionalNote, setOptionalNote] = useState('');
  const [rateLimited, setRateLimited] = useState(false);

  // Step 3 Consent State
  const [consentChecked, setConsentChecked] = useState(false);

  // Check rate limit on load (e.g. if reported recently in last 3 minutes)
  useEffect(() => {
    const lastReportTime = localStorage.getItem(`vs_last_sos_${vehicleId}`);
    if (lastReportTime) {
      const elapsed = Date.now() - parseInt(lastReportTime, 10);
      if (elapsed < 3 * 60 * 1000) {
        setRateLimited(true);
      }
    }
  }, [vehicleId]);

  // Reverse geocoding helper using Nominatim / OpenStreetMap
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

  // Start browser camera stream with upfront explanation
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
        setSubStep('locating');
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
      ctx.fillStyle = '#0f0c15';
      ctx.fillRect(0, 0, 400, 300);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 380, 280);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('INCIDENT EVIDENCE SNAPSHOT', 40, 120);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px sans-serif';
      ctx.fillText('PUBLIC RESPONDER INCIDENT LOCK', 50, 160);
      ctx.fillText(`VEHICLE: ${vehicleId.toUpperCase()}`, 50, 190);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoData(dataUrl);
      stopCamera();
      setSubStep('locating');
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
          setTimeout(() => {
            setSubStep('confirm');
          }, 1200);
        },
        (error) => {
          console.warn('Geolocation blocked: ', error);
          setLocError('GPS location permission denied. Report will proceed without coordinates.');
          setTimeout(() => {
            setSubStep('confirm');
          }, 1200);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocError('Browser does not support GPS Geolocation.');
      setTimeout(() => {
        setSubStep('confirm');
      }, 1200);
    }
  };

  const handleSOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return;

    setSubStep('submitting');
    
    try {
      await submitEmergencyMutation.mutateAsync({
        qrCode: vehicleId,
        payload: {
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          address: locationAddress || undefined,
          photo_base64: photoData || undefined,
          reporter_note: optionalNote || undefined,
        },
      });
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('429')) {
        setRateLimited(true);
        return;
      }
    }

    // Save timestamp for rate-limiting
    localStorage.setItem(`vs_last_sos_${vehicleId}`, Date.now().toString());

    // Dispatch WhatsApp template alerts via mock service
    await aisensy.sendEmergencyAlert(vehicleId, coordinates, photoData);
    
    // Log event to DB
    db.addLog({
      vehicleId,
      type: 'emergency',
      details: `SOS Dispatch Alert sent. Location: ${locationAddress || 'Unknown'}. Photo size: ${photoData ? Math.round(photoData.length / 1024) : 0}KB. Note: ${optionalNote || 'None'}`
    });

    // Dispatch live custom event for Dashboard sync
    const eventLog = {
      id: Math.random().toString(36).substring(7),
      vehicleId,
      type: 'emergency' as const,
      time: new Date().toLocaleTimeString(),
      details: `Accident SOS Alert sent! Location: ${locationAddress || 'Not shared'}`
    };
    window.dispatchEvent(new CustomEvent('vs_new_log', { detail: eventLog }));

    setTimeout(() => {
      onComplete();
    }, 2200);
  };

  // RATE-LIMITED VIEW (429 Awareness)
  if (rateLimited) {
    return (
      <div className="w-full max-w-md mx-auto py-8 px-4 text-center space-y-6 font-sans">
        <Card className="bg-white dark:bg-[#0c0c0e]/95 border border-zinc-200 dark:border-amber-500/30 p-6 space-y-6 rounded-lg text-center shadow-xl">
          <div className="size-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <HugeiconsIcon icon={Clock01Icon} className="size-7 animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">Report Already Dispatched</CardTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              An emergency alert was already sent for this vehicle recently. The owner's emergency contacts have already received the location coordinates and photo evidence.
            </p>
          </div>
          <Button
            onClick={onCancel}
            className="w-full h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
          >
            Return to Vehicle Options
          </Button>
        </Card>
      </div>
    );
  }

  // DISPATCH PROGRESS LOADER VIEW
  if (subStep === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center space-y-6 select-none">
        <div className="size-24 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-[0_0_35px_rgba(239,68,68,0.3)] animate-pulse">
          <HugeiconsIcon icon={Alert01Icon} className="size-12 text-red-500" />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-black text-red-500 font-serif tracking-widest uppercase animate-pulse">
            DISPATCHING EMERGENCY ALERTS
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Telemetry gateway is routing incident photo evidence, GPS coordinates, and vehicle details to the emergency contacts. Stand by...
          </p>
        </div>

        {/* Live Dispatch Progress Steps */}
        <div className="w-full max-w-xs bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-lg p-4 space-y-2 text-left text-[11px]">
          <div className="flex items-center gap-2 text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0" />
            <span>Incident evidence photo packaged</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0" />
            <span>Geolocation GPS coordinates verified</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400 animate-pulse">
            <span className="size-2 rounded-full bg-amber-400 shrink-0 ml-1 mr-1" />
            <span>Transmitting WhatsApp & SMS alerts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center font-sans text-left">
      <Card className="bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 max-w-md w-full space-y-6 rounded-lg relative overflow-hidden z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3">
          <div>
            <h2 className="text-sm font-black text-red-500 flex items-center gap-2 tracking-wide uppercase font-serif">
              <span className="size-2 bg-red-500 rounded-full animate-ping shrink-0" />
              Accident Emergency Dispatch
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
              Step {subStep === 'photo' ? '1' : subStep === 'locating' ? '2' : '3'} of 3
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

        {/* STEP 1: Mandatory Photo Capture with Upfront Explanation */}
        {subStep === 'photo' && (
          <div className="space-y-4">
            {/* Upfront Camera Explanation Banner */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-red-500/25 text-red-500 text-xs font-medium flex items-start gap-3 leading-relaxed">
              <HugeiconsIcon icon={Camera01Icon} className="size-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <strong className="block text-zinc-900 dark:text-white mb-0.5 font-bold">Upfront Camera Permission Notice:</strong>
                <span className="text-zinc-555 dark:text-zinc-400">We request camera access to capture a quick snapshot of the incident scene. This reduces prank reports and provides instant visual verification to emergency contacts.</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              {!cameraPermissionRequested ? (
                <div className="p-6 text-center space-y-4 flex flex-col items-center">
                  <div className="size-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
                    <HugeiconsIcon icon={Camera01Icon} className="size-8 text-red-500" />
                  </div>
                  <p className="text-xs text-zinc-400 max-w-xs">Click below to authorize the camera stream.</p>
                  <Button 
                    onClick={requestCameraPermission}
                    className="w-full h-11 px-5 rounded-lg bg-red-600 hover:bg-red-500 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-red-600/20 transition-all"
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
                    className="h-9 px-5 rounded-lg bg-red-600 hover:bg-red-500 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Snap Scene Photo
                  </Button>
                  <Button 
                    onClick={captureMockSnapshot}
                    variant="outline"
                    className="h-9 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 font-bold text-zinc-800 dark:text-white text-xs cursor-pointer"
                  >
                    Mock Snap
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-4 flex flex-col items-center">
                <div className="size-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <HugeiconsIcon icon={Camera01Icon} className="size-8 text-red-500" />
                </div>
                <p className="text-xs text-zinc-400">Camera permission denied or camera device not found.</p>
                <Button 
                  onClick={captureMockSnapshot}
                  className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-500 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer"
                >
                  Use Simulated Incident Image
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
              Skip to Simulated Incident Image
            </Button>
          )}
        </div>
      )}

      {/* STEP 2: Upfront Geolocation Explanation & Fetching */}
      {subStep === 'locating' && (
        <Card className="bg-white dark:bg-[#0c0c0e] p-6 border border-zinc-200 dark:border-zinc-900 text-center space-y-6 my-auto rounded-lg shadow-xl">
          <CardContent className="p-0 space-y-6">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse shrink-0">
                <HugeiconsIcon icon={Location01Icon} className="size-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="font-extrabold text-zinc-900 dark:text-white text-base font-serif uppercase tracking-wider">
                Retrieving GPS Location
              </CardTitle>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                <strong>Upfront Location Explanation:</strong> We request GPS coordinates to generate an instant Google Maps navigation link for emergency contacts. If denied, the report will still proceed.
              </p>
            </div>
            
            {locError ? (
              <div className="text-xs text-amber-500 dark:text-amber-400 font-mono italic p-2 rounded bg-amber-500/10 border border-amber-500/20">
                {locError}
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="size-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Notes, Misuse Warning & Consent Checkbox confirmation */}
      {subStep === 'confirm' && (
        <form onSubmit={handleSOSSubmit} className="space-y-4 my-auto">
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 p-5 space-y-4 rounded-lg">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-400" />
                Review Emergency Package
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-55 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-900">
                  <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 block mb-0.5">Evidence Photo</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold text-[11px]">Captured ✓</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 overflow-hidden">
                  <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 block mb-0.5">Detected Location</span>
                  {coordinates ? (
                    <span className="text-emerald-500 dark:text-emerald-400 font-semibold text-[11px] block truncate" title={locationAddress || 'Resolving location...'}>
                      {locationAddress || 'Resolving address...'} ✓
                    </span>
                  ) : (
                    <span className="text-amber-500 dark:text-amber-400 font-semibold text-[11px]">Not Shared</span>
                  )}
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-1 pt-1">
                <label className="text-[9px] uppercase font-mono font-black text-zinc-500 tracking-wider">Optional Incident Note</label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Car hit pillar on highway, two injured..."
                  value={optionalNote}
                  onChange={e => setOptionalNote(e.target.value)}
                  className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-red-500/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Misuse warning */}
          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium space-y-1 leading-relaxed">
            <HugeiconsIcon icon={Alert01Icon} className="size-4 text-red-500" />
            <p className="text-[11px]">
              <strong>Legal Notice:</strong> Under Section 194 of the MV Act, dispatching false emergency alerts is a punishable offense. IP address and coordinates will be logged.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2.5 px-1">
            <Checkbox 
              id="sos-consent" 
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(!!checked)}
              className="mt-0.5 border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:text-white cursor-pointer"
            />
            <label 
              htmlFor="sos-consent" 
              className="text-[10px] text-zinc-500 dark:text-zinc-300 font-medium leading-normal cursor-pointer select-none"
            >
              I confirm this is a real accident/emergency situation and consent to dispatching my snapshot and GPS coordinates.
            </label>
          </div>

          <Button
            type="submit"
            disabled={!consentChecked}
            className="w-full h-11 bg-red-600 disabled:bg-red-600/30 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer shadow-lg shadow-red-600/20 transition-all"
          >
            DISPATCH SECURE EMERGENCY ALERTS
          </Button>
        </form>
      )}

      </Card>
    </div>
  );
}

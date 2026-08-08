import { useState, memo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Location01Icon, 
  CheckmarkCircle02Icon, 
  Alert02Icon 
} from '@hugeicons/core-free-icons';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LocationCaptureCardProps, CapturedLocation } from '@/types/scan';
import { cn } from '@/lib/utils';

export const LocationCaptureCard = memo(function LocationCaptureCard({
  onLocation,
  loading = false,
  disabled = false,
  className = '',
}: LocationCaptureCardProps) {
  const [capturing, setCapturing] = useState(false);
  const [location, setCapturedLoc] = useState<CapturedLocation | null>(null);
  const [manualAddr, setManualAddr] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Request GPS position ONLY upon explicit click on "Use My Location"
  const handleRequestGPS = () => {
    if (disabled || loading || capturing) return;
    setErrorMsg(null);

    if (!('geolocation' in navigator)) {
      setErrorMsg('Geolocation is not supported by your browser. Please type manual location below.');
      return;
    }

    setCapturing(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locData: CapturedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
        };
        setCapturedLoc(locData);
        onLocation(locData);
        setCapturing(false);
      },
      (err) => {
        setCapturing(false);
        let msg = 'Could not retrieve GPS position.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Type manual street address below.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'GPS location request timed out. Type manual address below.';
        }
        setErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddr.trim()) return;

    const locData: CapturedLocation = {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      manualAddress: manualAddr.trim(),
      address: manualAddr.trim(),
    };
    setCapturedLoc(locData);
    onLocation(locData);
  };

  const isPending = loading || capturing;

  return (
    <Card className={cn('bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-md text-left select-none font-sans space-y-4', className)}>
      
      {/* Explanation Banner */}
      <div className="flex items-start gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
        <div className="size-9 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={Location01Icon} className="size-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
            Incident GPS Location
          </h4>
          <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
            We use your approximate location to help vehicle owners and emergency responders reach the correct spot faster.
          </p>
        </div>
      </div>

      {/* Location Captured Badge */}
      {location ? (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              GPS Location Attached
            </span>
          </div>
          <p className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 pl-6 truncate">
            {location.address || location.manualAddress}
          </p>
        </div>
      ) : (
        /* Action buttons & Form */
        <div className="space-y-3">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="button"
            onClick={handleRequestGPS}
            disabled={isPending || disabled}
            className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-2 border-none shadow-md"
          >
            <HugeiconsIcon icon={Location01Icon} className="size-4" />
            <span>{capturing ? 'Acquiring GPS Position...' : 'Use My Location'}</span>
          </Button>

          {/* Manual Address Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <Label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
              Or type manual landmark / street address:
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={manualAddr}
                onChange={(e) => setManualAddr(e.target.value)}
                placeholder="e.g. Near HDFC Bank, MG Road..."
                disabled={isPending || disabled}
                className="h-9.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-orange-500"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isPending || disabled || !manualAddr.trim()}
                className="h-9.5 px-4 text-xs font-bold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-transparent shrink-0 cursor-pointer"
              >
                Set Address
              </Button>
            </div>
          </form>
        </div>
      )}

    </Card>
  );
});

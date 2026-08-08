import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Vehicle } from '@/services/db';
import { useUpdateVehicle } from '@/features/vehicles/vehicles.hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  QrCodeIcon,
  Shield02Icon,
  BellIcon,
  BellOffIcon,
  UserGroupIcon,
  PlusSignIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';

import { 
  VehicleStatusBadge, 
  RenewalCountdown, 
  QRCodeDisplay,
  QRCodeDownloadButton
} from '@/components/vehicles';
import { 
  ContactCard,
  ContactLimitBanner
} from '@/components/contacts';

import type { EmergencyContact } from '@/types/contacts';
import { normalizePhoneNumber } from '@/lib/contacts';

interface VehicleOutletContext {
  vehicle: Vehicle;
  reloadVehicle: () => Promise<void>;
}

export default function VehicleOverviewPage() {
  const { vehicle, reloadVehicle } = useOutletContext<VehicleOutletContext>();
  const navigate = useNavigate();
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);

  const regPlate = vehicle.licensePlate || vehicle.id;
  const status = (vehicle as any).status || 'pending';
  const renewalDate = vehicle.expiryDate || '2026-12-31';
  const qrImageUrl = (vehicle as any).qrImageUrl || ((vehicle as any).qrCodeId ? `https://res.cloudinary.com/vaahansafe/image/upload/w_1000,h_1000,c_pad,q_auto,f_auto,fl_attachment/v1/stickers/${(vehicle as any).qrCodeId}.png` : '');

  // Parse emergency contacts for overview display
  const contacts: EmergencyContact[] = useMemo(() => {
    const raw = (vehicle.emergencyContacts || []) as (string | EmergencyContact)[];
    return raw.map((item, idx) => {
      if (typeof item === 'string') {
        const parts = item.split(' ');
        const phone = normalizePhoneNumber(parts[0] || '');
        const relRaw = (parts[1] || '').replace(/[()]/g, '');
        return {
          id: `contact-${idx}-${phone}`,
          vehicleId: vehicle.id,
          name: `Contact #${idx + 1}`,
          relationship: relRaw || 'Relative',
          phone: phone,
          whatsappEnabled: true,
          priority: idx + 1,
        };
      }
      return {
        ...item,
        id: item.id || `contact-${idx}`,
        vehicleId: vehicle.id,
        priority: idx + 1,
      };
    });
  }, [vehicle]);

  const updateVehicleMutation = useUpdateVehicle();

  const handleToggleAlerts = async () => {
    setToggleLoading(true);
    const newPausedState = !vehicle.activeAlertsPaused;
    try {
      await updateVehicleMutation.mutateAsync({
        id: vehicle.id,
        payload: { active_alerts_paused: newPausedState } as any
      });
      await reloadVehicle();
    } catch (err) {
      console.error('Failed to toggle alerts', err);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleToggleWhatsApp = async (_contactId: string, _enabled: boolean) => {
    await reloadVehicle();
  };

  const handleDeleteContact = async (_contactId: string) => {
    await reloadVehicle();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-sans">
      {/* Overview Cards (Left 2 Columns) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Alert Control Status Card */}
        <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-md">
          <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Active Decal Alert System</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Temporarily pause roadside notification pings to emergency contacts.</CardDescription>
            </div>
            <HugeiconsIcon 
              icon={vehicle.activeAlertsPaused ? BellOffIcon : BellIcon} 
              className={`size-5 ${vehicle.activeAlertsPaused ? 'text-amber-500' : 'text-emerald-500'}`} 
            />
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-900/60">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider block">
                {vehicle.activeAlertsPaused ? 'Protection Alerts Paused' : 'Telemetry Alerts Active'}
              </span>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal">
                {vehicle.activeAlertsPaused 
                  ? 'Roadside scanners will see a maintenance screen. WhatsApp dispatches and Exotel call routes are muted.'
                  : 'WhatsApp alerts, Exotel phone masks, and medical emergency information are scanning ready.'}
              </p>
            </div>
            <Switch 
              checked={!vehicle.activeAlertsPaused}
              onCheckedChange={handleToggleAlerts}
              disabled={toggleLoading}
              className="cursor-pointer text-brand data-[state=checked]:bg-brand"
            />
          </CardContent>
        </Card>

        {/* Subscription Plan details Card */}
        <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-md">
          <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Sticker Subscription Plan</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Manage billing plans and renew decal protection coverage.</CardDescription>
            </div>
            <VehicleStatusBadge status={status} />
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Shield02Icon} className="size-5 text-orange-500" />
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 dark:text-zinc-400 uppercase font-black block tracking-wider">Active Plan</span>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{vehicle.tier} Shield</span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] text-zinc-500 dark:text-zinc-400 uppercase font-black block tracking-wider">Coverage Validity</span>
                <RenewalCountdown renewalDate={renewalDate} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts Section */}
        <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md space-y-4">
          <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} className="size-4 text-orange-500" />
                Emergency SOS Contacts ({contacts.length}/5)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Primary recipients dispatched during roadside parking & medical alerts.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`contacts`)}
              className="h-8 px-3 text-xs font-bold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-transparent flex items-center gap-1.5 cursor-pointer"
            >
              <span>Manage Contacts</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            <ContactLimitBanner currentCount={contacts.length} maxCount={5} />

            {contacts.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">No emergency contacts registered yet.</p>
                <Button
                  onClick={() => navigate(`contacts`)}
                  className="h-8 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 mx-auto"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                  Add First Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 3).map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={() => navigate(`contacts`)}
                    onDelete={() => handleDeleteContact(contact.id)}
                    onToggleWhatsApp={(enabled) => handleToggleWhatsApp(contact.id, enabled)}
                  />
                ))}

                {contacts.length > 3 && (
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center pt-1">
                    + {contacts.length - 3} more emergency contacts configured
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* QR Windshield Decal Preview (Right Column) */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-md relative overflow-hidden group select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -z-10" />
          <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 font-display">
            <HugeiconsIcon icon={QrCodeIcon} className="size-4 text-orange-500" /> Windshield Decal Preview
          </h4>
          
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50 dark:bg-zinc-950/40 flex flex-col items-center space-y-4 shadow-inner">
            {/* Decal Logo */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">VAAHANSAFE</span>
            </div>

            {/* Interactive QR Display Component */}
            <QRCodeDisplay
              imageUrl={qrImageUrl}
              vehicleNumber={regPlate}
              className="size-32"
            />

            {/* License Plate Display Box */}
            <div className="w-full h-10 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-center px-3">
              <span className="text-xs font-mono font-extrabold tracking-widest text-zinc-900 dark:text-white uppercase">
                {regPlate}
              </span>
            </div>

            {/* Download Button Component */}
            <QRCodeDownloadButton
              vehicleId={vehicle.id}
              licensePlate={regPlate}
              subscriptionStatus={status}
              downloadUrl={qrImageUrl}
              filename={`decal-${regPlate}.png`}
              className="w-full"
            />
          </div>
        </Card>
      </div>

      {/* Decal Download Confirmation Alert Dialog */}
      <AlertDialog open={showDownloadAlert} onOpenChange={setShowDownloadAlert}>
        <AlertDialogContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-6 max-w-sm rounded-lg select-none">
          <AlertDialogHeader className="p-0 pb-3 text-left">
            <AlertDialogTitle className="text-sm font-extrabold text-zinc-900 dark:text-white font-serif flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#ff7a00] animate-pulse" />
              Download Decal Sticker Pack
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-normal">
              Preparing high-resolution vector SVG windshield decal zip package for vehicle{" "}
              <strong className="text-zinc-900 dark:text-white font-mono">{regPlate}</strong>.
              <span className="block mt-2">
                This package contains retroreflective decals, safety instructions, and windshield mounting advice.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-grow flex-1 h-9.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-lg font-bold text-xs uppercase cursor-pointer flex items-center justify-center">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowDownloadAlert(false);
              }}
              className="flex-grow flex-1 h-9.5 bg-[#ff7a00] hover:bg-[#e06b00] text-white rounded-lg font-bold text-xs uppercase cursor-pointer flex items-center justify-center"
            >
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useParams, useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Car01Icon, 
  UserGroupIcon, 
  HealtcareIcon, 
  Search01Icon, 
  AlertCircleIcon,
  ArrowLeft01Icon,
  Calendar03Icon
} from '@hugeicons/core-free-icons';

import { useVehicle } from '@/features/vehicles/vehicles.hooks';

export default function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: vehicleData, isLoading: loading, isError, refetch } = useVehicle(vehicleId || '');

  const rawNotes = vehicleData?.medical_info?.medical_notes || '';
  let medicalConditions = '';
  let additionalNotes = rawNotes;

  if (rawNotes.includes(' | ')) {
    const parts = rawNotes.split(' | ');
    for (const part of parts) {
      if (part.startsWith('Conditions: ')) {
        medicalConditions = part.replace('Conditions: ', '');
      } else if (part.startsWith('Notes: ')) {
        additionalNotes = part.replace('Notes: ', '');
      }
    }
  } else if (rawNotes.startsWith('Conditions: ')) {
    medicalConditions = rawNotes.replace('Conditions: ', '');
    additionalNotes = '';
  } else if (rawNotes.startsWith('Notes: ')) {
    additionalNotes = rawNotes.replace('Notes: ', '');
  }

  const vehicle = vehicleData ? {
    id: vehicleData.id,
    licensePlate: vehicleData.vehicle_number,
    ownerName: 'Vehicle Operator',
    ownerPhone: '',
    bloodGroup: vehicleData.medical_info?.blood_group || '',
    allergies: (vehicleData.medical_info?.allergies || []).join(', '),
    emergencyContacts: (vehicleData.emergency_contacts || []).map(c => `${c.phone} (${c.relationship})`),
    medicalNotes: additionalNotes,
    medicalConditions: medicalConditions,
    additionalNotes: additionalNotes,
    medications: vehicleData.medical_info?.emergency_medication || [],
    status: vehicleData.subscription_status,
    stickerStatus: vehicleData.subscription_status === 'pending' ? 'Processing' : (vehicleData as any).sticker_dispatched_at ? 'Shipped' : 'Delivered',
    tier: vehicleData.tier || 'Shield',
    activeAlertsPaused: false,
    expiryDate: vehicleData.renewal_date || new Date().toISOString().split('T')[0],
    qrImageUrl: vehicleData.qr_image_url,
    qrCodeId: (vehicleData as any).qr_code_id
  } : null;

  const error = isError ? 'Vehicle profile not found or paired QR sticker deactivated.' : null;

  const reloadVehicle = async () => {
    await refetch();
  };

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/contacts')) return 'contacts';
    if (path.endsWith('/medical')) return 'medical';
    if (path.endsWith('/scans')) return 'scans';
    if (path.endsWith('/alerts')) return 'alerts';
    return 'overview';
  };

  const activeTab = getActiveTab();

  if (loading) {
    return (
      <div className="w-full space-y-6 text-left py-6 select-none animate-pulse">
        {/* Header Shimmer */}
        <div className="h-16 w-1/3 bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
        {/* Navigation Tabs Shimmer */}
        <div className="h-11 w-full bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
        {/* Grid Content Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
          <div className="h-96 bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none">
        <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-8 max-w-md w-full shadow-xl space-y-4">
          <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-6 text-red-500" />
          </div>
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white font-serif">Vehicle Workspace Alert</CardTitle>
            <CardDescription className="text-xs text-zinc-500 leading-normal mt-1">
              {error || 'The requested vehicle profile could not be retrieved from secure telemetry registries.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Button
              onClick={() => navigate('/dashboard/vehicles')}
              className="w-full h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-1.5" />
              Return to Fleet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(vehicle.expiryDate) < new Date();

  return (
    <div className="w-full space-y-6 text-left py-4">
      {/* Header Profile Summary */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif tracking-tight uppercase">
              {vehicle.licensePlate}
            </h1>
            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
              vehicle.stickerStatus === 'Delivered' 
                ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/25'
                : 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/25'
            }`}>
              {vehicle.stickerStatus}
            </span>
            {isExpired && (
              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/25">
                Subscription Expired
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-zinc-550 dark:text-zinc-400" />
            Decal Coverage Expires: <span className="font-semibold text-zinc-550 dark:text-zinc-400">{vehicle.expiryDate}</span>
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/vehicles')}
          variant="outline"
          className="h-9.5 px-4 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-1.5" />
          Back to Fleet
        </Button>
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-900/60 pb-px flex gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', path: '', icon: Car01Icon },
          { id: 'contacts', label: 'Emergency Contacts', path: 'contacts', icon: UserGroupIcon },
          { id: 'medical', label: 'Medical Card', path: 'medical', icon: HealtcareIcon },
          { id: 'scans', label: 'Scan History', path: 'scans', icon: Search01Icon },
          { id: 'alerts', label: 'Alert logs', path: 'alerts', icon: AlertCircleIcon }
        ].map((tab) => {
          const pathTarget = `/dashboard/vehicles/${vehicleId}${tab.path ? `/${tab.path}` : ''}`;
          const isCurrent = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={pathTarget}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isCurrent 
                  ? 'border-brand text-brand bg-brand/5 rounded-t-lg'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-200 dark:hover:border-zinc-800'
              }`}
            >
              <HugeiconsIcon icon={tab.icon} className="size-3.5 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Child Outlets Container */}
      <div className="w-full">
        <Outlet context={{ vehicle, reloadVehicle }} />
      </div>
    </div>
  );
}

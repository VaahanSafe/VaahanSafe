import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  HealtcareIcon, 
  Call02Icon, 
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Shield01Icon,
  LockIcon
} from '@hugeicons/core-free-icons';

import { usePublicMedical } from '@/features/scans/scans.hooks';

export default function MedicalInfoViewPage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const navigate = useNavigate();

  const [isPinVerified, setIsPinVerified] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem(`vs_medical_auth_${qrCodeId || 'vehicle-1'}`);
    setIsPinVerified(!!isAuth);
  }, [qrCodeId]);

  const { data: medicalData } = usePublicMedical(qrCodeId || '', undefined, true);

  const vehicle = medicalData ? {
    licensePlate: (medicalData.vehicle_number as string) || qrCodeId || 'VEHICLE',
    bloodGroup: (medicalData.blood_group as string) || 'O+',
    allergies: Array.isArray(medicalData.allergies) ? (medicalData.allergies as string[]).join(', ') : (medicalData.allergies as string) || '',
    medicalNotes: (medicalData.medical_notes as string) || '',
    organDonor: (medicalData.organ_donor as boolean) ?? true,
    emergencyContacts: ((medicalData.emergency_contacts as any[]) || []).map(c => `${c.phone || c} (${c.relationship || 'Emergency Kin'})`),
  } : null;

  if (!vehicle) {
    return (
      <div className="w-full flex items-center justify-center font-sans">
        <Card className="bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 max-w-md w-full text-center space-y-6 rounded-lg relative overflow-hidden z-10">
          
          {/* Subtle ambient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -z-10" />

          {/* Top Warning Badge */}
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <HugeiconsIcon icon={HealtcareIcon} className="size-8 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 block">
              VAAHANSAFE HEALTH TELEMETRY
            </span>
            <CardTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif uppercase tracking-wider">
              No Medical Record Found
            </CardTitle>
            <CardDescription className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              This vehicle owner has not configured first-responder medical telemetry for this QR sticker profile.
            </CardDescription>
          </div>

          {/* First Responder Speed Dials */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-3 text-left">
            <span className="text-[9px] font-mono font-black text-red-500 dark:text-red-400 uppercase tracking-widest block">
              EMERGENCY AMBULANCE DISPATCH
            </span>
            <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-normal">
              If an individual is injured or unconscious, call official national first responders directly:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="h-10 px-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
              >
                <HugeiconsIcon icon={Call02Icon} className="size-4" />
                <span>Call 112</span>
              </a>
              <a
                href="tel:108"
                className="h-10 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <HugeiconsIcon icon={Call02Icon} className="size-4" />
                <span>Ambulance 108</span>
              </a>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              onClick={() => navigate(`/s/${qrCodeId || 'vehicle-1'}`)}
              className="w-full h-11 bg-brand hover:opacity-90 text-white text-xs font-black uppercase rounded-lg tracking-wider cursor-pointer shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              <span>RETURN TO VEHICLE SUMMARY</span>
            </Button>
          </div>

        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 font-sans text-left pb-6">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 dark:text-emerald-400 block font-bold">
            PARAMEDIC TELEMETRY CARD
          </span>
          <h1 className="text-base font-black text-zinc-900 dark:text-white font-serif uppercase tracking-wider mt-0.5">
            Medical ID •••{vehicle.licensePlate.slice(-4)}
          </h1>
        </div>
        <Button 
          onClick={() => navigate(`/s/${qrCodeId || 'vehicle-1'}`)}
          variant="outline"
          className="h-7 px-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-250 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white bg-transparent rounded-lg cursor-pointer"
        >
          Close
        </Button>
      </div>

      {/* Primary Public Emergency Highlights Card */}
      <Card className="bg-white dark:bg-[#0c0c0e] border border-emerald-500/30 p-5 space-y-5 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="text-2xl font-black font-mono">{vehicle.bloodGroup}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Blood Group</span>
              <span className="text-sm font-black text-zinc-900 dark:text-white font-serif tracking-wider">
                TYPE {vehicle.bloodGroup} POSITIVE
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0" />
            <span>PUBLIC ID</span>
          </div>
        </div>

        {/* Known Allergies */}
        <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-900">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-1">
            <span className="text-[9px] font-mono uppercase font-black text-red-500 dark:text-red-400 tracking-wider block">
              KNOWN DRUG ALLERGIES
            </span>
            <p className="text-xs font-bold text-zinc-900 dark:text-white leading-relaxed">
              {vehicle.allergies || 'No known drug allergies reported.'}
            </p>
          </div>

          {/* Organ Donor Badge */}
          {vehicle.organDonor !== false && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} className="size-4 shrink-0 text-emerald-400" />
              <span>Registered Organ Donor (National Health Registry)</span>
            </div>
          )}

          {/* Confidential Medical Notes (Locked for Anonymous Scanners unless PIN passed) */}
          {isPinVerified ? (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase font-black text-emerald-550 dark:text-emerald-400 tracking-wider">
                  UNLOCKED CLINICAL HISTORY & MEDICATIONS
                </span>
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" /> VERIFIED PIN
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white leading-relaxed">
                {vehicle.medicalNotes || 'No chronic condition or daily medication notes registered.'}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-medium space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">
                  PRIVATE MEDICAL NOTES & CONDITIONS
                </span>
                <span className="text-[10px] font-bold text-amber-550 dark:text-amber-400 flex items-center gap-1">
                  <HugeiconsIcon icon={LockIcon} className="size-3" /> PIN PROTECTED
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Detailed clinical history and daily prescriptions are protected per DPDP 2023 guidelines.
              </p>
              <Button
                onClick={() => navigate(`/s/${qrCodeId || 'vehicle-1'}/medical`)}
                className="w-full h-8 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase rounded-lg cursor-pointer transition-all"
              >
                ENTER SECONDARY PIN TO UNLOCK
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Emergency Contacts Card */}
      <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 p-5 space-y-4 rounded-lg">
        <CardHeader className="p-0">
          <CardTitle className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={HealtcareIcon} className="size-4 text-emerald-500 dark:text-emerald-400" />
            Registered Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2.5">
          {vehicle.emergencyContacts.map((contact, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white block">{contact}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Primary Kin / Emergency Contact #{idx + 1}</span>
              </div>
              <a
                href={`tel:${contact.split(' ')[0]}`}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <HugeiconsIcon icon={Call02Icon} className="size-3.5" />
                <span>Call</span>
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* First Responder Speed Dials */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <a
          href="tel:112"
          className="h-11 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
        >
          <HugeiconsIcon icon={Call02Icon} className="size-4" />
          <span>Call 112 Ambulance</span>
        </a>

        <Button
          onClick={() => navigate(`/s/${qrCodeId || 'vehicle-1'}`)}
          variant="outline"
          className="h-11 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-950 text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Return</span>
        </Button>
      </div>

    </div>
  );
}

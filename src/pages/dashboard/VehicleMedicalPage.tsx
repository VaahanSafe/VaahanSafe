import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Vehicle } from '@/services/db';
import { useSaveMedicalInfo, useMedicalAiSummary } from '@/features/medical/medical.hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { SparklesIcon } from '@hugeicons/core-free-icons';

import { MedicalInfoForm } from '@/components/medical';
import type { MedicalFormData } from '@/types/medical';

interface VehicleOutletContext {
  vehicle: Vehicle;
  reloadVehicle: () => Promise<void>;
}

export default function VehicleMedicalPage() {
  const { vehicle, reloadVehicle } = useOutletContext<VehicleOutletContext>();
  
  const hasSavedMedicalData = !!(vehicle.bloodGroup || vehicle.allergies || vehicle.medicalNotes);
  const [submitting, setSubmitting] = useState(false);

  const saveMedicalMutation = useSaveMedicalInfo();
  const { data: aiData, isLoading: aiLoading } = useMedicalAiSummary(vehicle.id, hasSavedMedicalData);

  const aiSummary = aiData?.summary || null;

  const handleSaveMedical = async (data: MedicalFormData) => {
    setSubmitting(true);

    const allergyArray = data.allergies.filter(Boolean);
    const notesString = [
      data.medicalConditions ? `Conditions: ${data.medicalConditions}` : '',
      data.additionalNotes ? `Notes: ${data.additionalNotes}` : '',
    ].filter(Boolean).join(' | ');

    try {
      await saveMedicalMutation.mutateAsync({
        vehicleId: vehicle.id,
        payload: {
          blood_group: data.bloodGroup || 'Unknown',
          allergies: allergyArray,
          medical_notes: notesString,
          organ_donor: false,
          emergency_medication: data.medications.filter(Boolean),
          consent_ip: '127.0.0.1',
        },
      });

      await reloadVehicle();
      toast.success('Roadside medical card updated successfully!');
    } catch (err) {
      toast.error('Failed to update medical info');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedAllergies = vehicle.allergies ? vehicle.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 text-left font-sans items-start">
      {/* Left side (7 cols on xl): Sensitive Medical Form Card */}
      <div className="xl:col-span-7">
        <MedicalInfoForm
          defaultValues={{
            bloodGroup: (vehicle.bloodGroup as any) || '',
            allergies: parsedAllergies,
            medications: (vehicle as any).medications || [],
            medicalConditions: (vehicle as any).medicalConditions || '',
            additionalNotes: (vehicle as any).additionalNotes || '',
            consent: hasSavedMedicalData,
          }}
          loading={submitting}
          isFirstSubmission={!hasSavedMedicalData}
          consentAcceptedAt={hasSavedMedicalData ? new Date().toISOString() : null}
          onSubmit={handleSaveMedical}
        />
      </div>

      {/* Right side (5 cols on xl): AI telemetry summary card block */}
      <div className="xl:col-span-5 space-y-6">
        {hasSavedMedicalData ? (
          <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-orange-500/30 rounded-lg p-6 shadow-xl relative overflow-hidden flex flex-col justify-between select-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -z-10" />
            <div>
              <CardHeader className="p-0 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={SparklesIcon} className="size-5 text-orange-500 animate-pulse" />
                  <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5 font-display">
                    AI First-Aid Summary
                  </CardTitle>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-black text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                  Telemetry AI
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {aiLoading ? (
                  <div className="space-y-2.5 animate-pulse py-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-5/6" />
                  </div>
                ) : aiSummary ? (
                  <div className="p-4 rounded-lg bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 text-zinc-800 dark:text-zinc-200 text-xs leading-relaxed font-semibold italic">
                    "{aiSummary}"
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No summary available.</p>
                )}
              </CardContent>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-6">
              AI summary is compiled automatically from your medical card to give roadside responders quick diagnostic indicators upon QR scan.
            </div>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-[#121215] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xl flex flex-col justify-between select-none">
            <div>
              <CardHeader className="p-0 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={SparklesIcon} className="size-5 text-zinc-400" />
                  <CardTitle className="text-base font-bold text-zinc-500 tracking-tight flex items-center gap-1.5 font-display">
                    AI Summary Teaser
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 py-8 text-center">
                <HugeiconsIcon icon={SparklesIcon} className="size-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                <span className="text-xs font-bold text-zinc-500 block uppercase tracking-wider font-mono">AI Summaries Offline</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xs mx-auto mt-2">
                  Once you check consent and save your medical details, VaahanSafe AI will compile a roadside responder first-aid guide here.
                </p>
              </CardContent>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800/80">
              Sensitive health info is processed on VaahanSafe telemetry servers and never cached offline.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

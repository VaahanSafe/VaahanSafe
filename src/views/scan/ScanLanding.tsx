import { useState, useEffect } from 'react'
import EmergencyFlow from './EmergencyFlow'
import AlertSent from './AlertSent'
import ScanNotFoundPage from '@/pages/scan/ScanNotFoundPage'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  AlertCircleIcon, 
  HealtcareIcon, 
  Call02Icon,
  Cancel01Icon,
  Alert01Icon,
  ArrowLeft01Icon,
  Location01Icon
} from '@hugeicons/core-free-icons'
import { ScanPulseLoader, OfflineSignal } from '../../components/svg'
import { usePublicVehicleLookup, useSubmitParkingScan } from '@/features/scans/scans.hooks';

interface ScanLandingProps {
  vehicleId: string
}

export default function ScanLanding({ vehicleId }: ScanLandingProps) {
  const { data: lookupData, isLoading: loading } = usePublicVehicleLookup(vehicleId);
  const submitParkingMutation = useSubmitParkingScan();

  const [step, setStep] = useState<'landing' | 'emergency' | 'sent' | 'medical'>('landing')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  
  // Modals state
  const [showParkingModal, setShowParkingModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)

  // Phone call bridge fields
  const [scannerPhone, setScannerPhone] = useState('')
  const [submittingCall, setSubmittingCall] = useState(false)
  const [callResult, setCallResult] = useState<string | null>(null)

  // Notify other issues fields
  const [issueType, setIssueType] = useState('window_open')
  const [issueDetails, setIssueDetails] = useState('')
  const [submittingIssue, setSubmittingIssue] = useState(false)

  const vehicle = lookupData ? {
    id: (lookupData.vehicle_id as string) || vehicleId,
    licensePlate: (lookupData.vehicle_number as string) || vehicleId,
    ownerPhone: '',
    activeAlertsPaused: (lookupData.active_alerts_paused as boolean) || false,
    bloodGroup: (lookupData.blood_group as string) || '',
    allergies: (lookupData.allergies as string) || '',
    medicalNotes: (lookupData.medical_notes as string) || '',
  } : null;

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleWrongParkingCall = async (e: React.FormEvent) => {
    e.preventDefault()
    if (scannerPhone.length < 10) {
      setCallResult('error: Please enter a valid 10-digit mobile number')
      return
    }

    setSubmittingCall(true)
    setCallResult(null)

    try {
      await submitParkingMutation.mutateAsync({
        qrCode: vehicleId,
        payload: {
          reporter_phone: scannerPhone,
          issue_type: 'wrong_parking',
          notes: 'Wrong parking call request',
        },
      });
      setCallResult('success');
    } catch (err: any) {
      setCallResult(`error: ${err.message || 'Call bridge service busy. Please try again.'}`);
    } finally {
      setSubmittingCall(false);
    }
  }

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingIssue(true)

    // Simulate dispatching silent SMS notification
    setTimeout(() => {
      setSubmittingIssue(false)
      setShowIssueModal(false)
      alert('Notification dispatched securely to the vehicle owner. Thank you!')

      // Log event
      console.log('Issue reported:', issueType, issueDetails);

      // Dispatch live custom event for Dashboard sync
      const eventLog = {
        id: Math.random().toString(36).substring(7),
        vehicleId,
        type: 'issue' as const,
        time: new Date().toLocaleTimeString(),
        details: `Issue reported: ${issueType.replace('_', ' ').toUpperCase()}.${issueDetails ? ` Notes: ${issueDetails}` : ''}`
      }
      window.dispatchEvent(new CustomEvent('vs_new_log', { detail: eventLog }))
      
      setIssueDetails('')
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-4">
        <ScanPulseLoader size={120} className="text-brand" />
        <p className="text-xs font-mono text-brand uppercase tracking-widest animate-pulse">Resolving VaahanSafe Profile...</p>
      </div>
    )
  }

  if (!vehicle) {
    return <ScanNotFoundPage />;
  }

  if (isOffline) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 space-y-6 flex flex-col items-center justify-center min-h-[80vh]">
        <OfflineSignal size={120} className="text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Offline Fallback Mode</h2>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          No internet connection detected. Please dial our Exotel offline IVR helpline printed on the windshield sticker:
        </p>
        <a 
          href="tel:+918047190000" 
          className="px-6 py-3 bg-brand text-white font-bold text-sm rounded-lg shadow-lg inline-flex items-center gap-2 hover:opacity-90"
        >
          <HugeiconsIcon icon={Call02Icon} className="size-4" />
          Call IVR Helpline
        </a>
        <span className="font-mono text-xs text-brand block uppercase tracking-widest mt-2">
          Sticker ID: {vehicle.id.toUpperCase()}
        </span>
      </div>
    )
  }

  if (step === 'emergency') {
    return <EmergencyFlow vehicleId={vehicleId} onCancel={() => setStep('landing')} onComplete={() => setStep('sent')} />
  }

  if (step === 'sent') {
    return <AlertSent vehicleId={vehicleId} onRestart={() => setStep('landing')} />
  }

  if (step === 'medical') {
    return (
      <div className="max-w-md mx-auto py-8 px-4 flex flex-col justify-between min-h-[85vh]">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold text-foreground">Paramedic Medical Info</h2>
            <Button 
              onClick={() => setStep('landing')} 
              variant="outline" 
              className="h-8 text-xs font-semibold border border-border text-foreground cursor-pointer flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              Back
            </Button>
          </div>

          <Card className="glass-panel border-emergency/30 bg-emergency/5 p-6 space-y-4">
            <CardHeader className="p-0 border-b border-emergency/20 pb-3 flex flex-row items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emergency animate-ping"></span>
              <HugeiconsIcon icon={HealtcareIcon} className="size-4 text-emergency shrink-0" />
              <CardTitle className="font-extrabold text-sm uppercase tracking-wider text-emergency">First Responder Card</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Blood Group</span>
                  <span className="text-3xl font-black text-foreground block font-mono">{vehicle.bloodGroup || 'Not Disclosed'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Special Allergies</span>
                  <span className="text-xs font-bold text-foreground block leading-snug">{vehicle.allergies || 'None Reported'}</span>
                </div>
              </div>
              <div className="space-y-1 border-t border-emergency/10 pt-3">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Critical Medical Notes</span>
                <p className="text-xs font-bold text-foreground/80 leading-relaxed">{vehicle.medicalNotes || 'No specific notes saved.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            This card is read-only and complies with the DPDP Privacy Act. Paramedics may utilize these metrics for emergency support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-2rem)] max-w-md mx-auto flex flex-col justify-between p-4 relative select-none font-sans">
      
      {/* 1. Vehicle Masked Identifier & City Metadata */}
      <div className="text-center pt-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">
          VaahanSafe Secure Telemetry
        </span>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-brand shrink-0" />
          <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            City: Pune, Maharashtra
          </span>
        </div>
        <h1 className="font-mono text-xl sm:text-2xl font-black tracking-wider mt-2 text-foreground">
          VEHICLE •••{vehicle.licensePlate.replace(/\s+/g, '').toUpperCase().slice(-4)}
        </h1>
        {vehicle.activeAlertsPaused && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 leading-normal max-w-xs mx-auto animate-pulse">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0" />
            <span>Alerts paused by the owner</span>
          </div>
        )}
      </div>

      {/* 2. Three Oversized Action Targets stacked */}
      <div className="space-y-4 my-auto">
        {/* Action 1: Wrong Parking (Amber) */}
        <button 
          onClick={() => setShowParkingModal(true)}
          className="w-full min-h-[88px] flex items-center justify-between p-5 rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/30 text-foreground font-bold active:scale-[0.97] transition-all duration-100 ease-out cursor-pointer gap-4 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Call02Icon} className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-base tracking-wide font-display font-extrabold text-foreground">Wrong Parking Alert</span>
              <span className="block text-[11px] text-muted-foreground font-normal mt-0.5 font-sans">Contact vehicle owner anonymously</span>
            </div>
          </div>
          <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Action 2: Emergency / Accident (Emergency Red - Reserverd exclusively) */}
        <button 
          onClick={() => {
            if (vehicle.activeAlertsPaused) {
              alert('Alerts are paused by the owner.')
              return
            }
            setStep('emergency')
          }}
          className="w-full min-h-[88px] flex items-center justify-between p-5 rounded-lg bg-emergency hover:opacity-95 text-white font-bold active:scale-[0.97] transition-all duration-100 ease-out cursor-pointer shadow-lg shadow-emergency/25 gap-4 text-left border border-emergency-dark/30"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-white/15 border border-white/20 text-white flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-base tracking-wide font-display font-extrabold text-white">Emergency / Accident</span>
              <span className="block text-[11px] text-red-100 font-normal mt-0.5 font-sans">Send coordinates + photo to family</span>
            </div>
          </div>
          <svg className="h-5 w-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Action 3: Vehicle Issue (Teal/Brand) */}
        <button 
          onClick={() => setShowIssueModal(true)}
          className="w-full min-h-[88px] flex items-center justify-between p-5 rounded-lg bg-brand/5 hover:bg-brand/10 border border-brand/30 text-foreground font-bold active:scale-[0.97] transition-all duration-100 ease-out cursor-pointer gap-4 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Alert01Icon} className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-base tracking-wide font-display font-extrabold text-foreground">Vehicle Issue</span>
              <span className="block text-[11px] text-muted-foreground font-normal mt-0.5 font-sans">Notify open window, flat tire, etc.</span>
            </div>
          </div>
          <svg className="h-5 w-5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 3. Paramedic info card link + Misuse Warning */}
      <div className="space-y-4 pb-4">
        {/* Paramedic medical card quick view button */}
        <Button 
          onClick={() => setStep('medical')}
          variant="outline"
          className="w-full h-10 border border-border hover:bg-accent/5 text-foreground/80 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={HealtcareIcon} className="size-4 text-brand" />
          View Paramedic Medical Card
        </Button>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
          <strong>Misuse Warning:</strong> Alerting emergency contacts falsely is a punishable offense under Sec 194 MV Act. Incident coordinates are logged.
        </p>
      </div>

      {/* WRONG PARKING CALL MODAL */}
      {showParkingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="glass-panel border-border max-w-sm w-full p-6 space-y-4 shadow-xl">
            <CardHeader className="p-0 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="font-extrabold text-foreground text-base">Masked Call Relay</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Exotel secure phone bridge</CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setShowParkingModal(false)
                  setCallResult(null)
                }}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0 cursor-pointer flex items-center justify-center"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {callResult === 'success' ? (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold text-center space-y-2 leading-relaxed flex items-center gap-2">
                  <HugeiconsIcon icon={Call02Icon} className="size-4 text-green-500 shrink-0" />
                  <span>Connecting anonymous call bridge... Check your phone. Real number hidden.</span>
                </div>
              ) : (
                <form onSubmit={handleWrongParkingCall} className="space-y-4">
                  {callResult && callResult.startsWith('error') && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                      {callResult}
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Your Phone Number</label>
                    <Input 
                      type="tel" 
                      placeholder="Enter your 10-digit number"
                      value={scannerPhone}
                      onChange={e => setScannerPhone(e.target.value)}
                      required
                      className="h-8"
                    />
                    <span className="text-[9px] text-muted-foreground leading-normal block pt-0.5">
                      We dial your phone and the owner's phone to connect you securely. Privacy is 100% guaranteed.
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submittingCall}
                    className="w-full h-10 bg-brand hover:opacity-90 font-bold text-white shadow-lg text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {submittingCall ? 'CONNECTING BRIDGE...' : 'START SECURE BRIDGE CALL'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* NOTIFY OTHER ISSUES MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="glass-panel border-border max-w-sm w-full p-6 space-y-4 shadow-xl">
            <CardHeader className="p-0 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="font-extrabold text-foreground text-base">Report Vehicle Issue</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Notify the owner silently</CardDescription>
              </div>
              <Button 
                onClick={() => setShowIssueModal(false)}
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0 cursor-pointer flex items-center justify-center"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Select Issue Type</label>
                  <Select value={issueType} onValueChange={v => setIssueType(v || '')}>
                    <SelectTrigger className="w-full h-8 data-[size=default]:h-8 text-xs">
                      <SelectValue placeholder="Select issue..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window_open">Car window is open</SelectItem>
                      <SelectItem value="key_inside">Keys left inside the car</SelectItem>
                      <SelectItem value="flat_tire">Tire is punctured/flat</SelectItem>
                      <SelectItem value="headlights_on">Headlights are left on</SelectItem>
                      <SelectItem value="towing_active">Vehicle is being towed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Additional details (Optional)</label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. Left rear window is half open..."
                    value={issueDetails}
                    onChange={e => setIssueDetails(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingIssue}
                  className="w-full h-10 bg-brand hover:opacity-90 font-bold text-white shadow-lg text-xs uppercase tracking-wider cursor-pointer"
                >
                  {submittingIssue ? 'DISPATCHING NOTIFICATION...' : 'SEND SECURE NOTIFICATION'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}

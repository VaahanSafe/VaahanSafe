import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  LockIcon, 
  HealtcareIcon, 
  AlertCircleIcon, 
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Shield01Icon
} from '@hugeicons/core-free-icons';

export default function MedicalInfoGatePage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const navigate = useNavigate();

  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isParamedicMode, setIsParamedicMode] = useState(false);
  const [paramedicBadge, setParamedicBadge] = useState('');

  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null)
  ];

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);
    setErrorMsg(null);

    // Auto-advance
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pinDigits.join('');
    if (enteredPin.length !== 4) {
      setErrorMsg('Please enter a complete 4-digit PIN.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      // Valid PIN check (default emergency PINs: 1234, 9999, or owner set)
      if (enteredPin === '1234' || enteredPin === '9999' || enteredPin === '0000') {
        sessionStorage.setItem(`vs_medical_auth_${qrCodeId || 'vehicle-1'}`, 'true');
        navigate(`/s/${qrCodeId || 'vehicle-1'}/medical/view`);
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid Medical PIN. Default demo PIN is 1234.');
      }
    }, 600);
  };

  const handleParamedicBypass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramedicBadge.trim()) {
      setErrorMsg('Please enter your Hospital / EMS Badge ID.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      sessionStorage.setItem(`vs_medical_auth_${qrCodeId || 'vehicle-1'}`, 'paramedic');
      navigate(`/s/${qrCodeId || 'vehicle-1'}/medical/view`);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center font-sans text-left">
      <Card className="bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 w-full space-y-6 rounded-lg relative overflow-hidden z-10">
        
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <HugeiconsIcon icon={HealtcareIcon} className="size-8 text-emerald-400" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 block">
            DPDP PROTECTED HEALTH TELEMETRY
          </span>
          <CardTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif uppercase tracking-wider">
            Paramedic Medical Gate
          </CardTitle>
          <CardDescription className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Enter the 4-digit Emergency PIN provided by the vehicle owner to unlock confidential first-aid medical records.
          </CardDescription>
        </div>

        {/* PIN Entry Form */}
        {!isParamedicMode ? (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div className="flex justify-center gap-3">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="size-12 sm:size-14 text-center text-xl font-bold font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-550 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-zinc-900 dark:text-white rounded-lg transition-all outline-none"
                />
              ))}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg tracking-wider cursor-pointer shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={LockIcon} className="size-4" />
              <span>{isVerifying ? 'VERIFYING PIN...' : 'UNLOCK MEDICAL RECORDS'}</span>
            </Button>
          </form>
        ) : (
          /* Paramedic Emergency Bypass Form */
          <form onSubmit={handleParamedicBypass} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <HugeiconsIcon icon={Shield01Icon} className="size-4 text-emerald-500 dark:text-emerald-400" />
                <span>EMS / Paramedic Protocol Override</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Authorized first responders may override the secondary PIN by supplying their Medical Registration ID.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono font-black text-zinc-500 tracking-wider">
                EMS / Hospital Badge Number
              </label>
              <Input
                type="text"
                placeholder="e.g. EMS-10492 / Max Hospital"
                value={paramedicBadge}
                onChange={(e) => setParamedicBadge(e.target.value)}
                className="h-10 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-emerald-550 dark:focus:border-emerald-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg tracking-wider cursor-pointer shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
              <span>{isVerifying ? 'VERIFYING OVERRIDE...' : 'CONFIRM PARAMEDIC ACCESS'}</span>
            </Button>
          </form>
        )}

        {/* Toggle Paramedic Mode vs Return */}
        <div className="pt-2 space-y-2 border-t border-zinc-200 dark:border-zinc-900">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsParamedicMode(!isParamedicMode);
              setErrorMsg(null);
            }}
            className="w-full h-9 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold cursor-pointer underline"
          >
            {isParamedicMode ? 'Switch to PIN Entry' : 'First Responder / EMS Paramedic Override'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/s/${qrCodeId || 'vehicle-1'}`)}
            className="w-full h-10 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>RETURN TO VEHICLE SUMMARY</span>
          </Button>
        </div>

      </Card>
    </div>
  );
}

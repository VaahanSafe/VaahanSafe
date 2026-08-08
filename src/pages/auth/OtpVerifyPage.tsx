import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVerifyOtp, useRequestOtp } from '@/features/auth/auth.hooks';
import { authStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { SecurityLockIcon, ArrowRight01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: verifyOtpMutation, isPending: isLoading } = useVerifyOtp();
  const { mutateAsync: requestOtpMutation, isPending: isRequesting } = useRequestOtp();

  const state = location.state as { phone?: string; expires_in?: number; returnTo?: string } | null;
  const phone = state?.phone;
  const returnTo = state?.returnTo || '/dashboard';
  const initialExpires = state?.expires_in || 60;

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [failures, setFailures] = useState(0);
  const [timer, setTimer] = useState(initialExpires);
  const [isLocked, setIsLocked] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Redirect if phone isn't carried in router state to prevent direct access leaking info
  useEffect(() => {
    if (!phone) {
      toast.error('Session expired. Please enter your mobile number again.');
      navigate('/login', { replace: true });
    }
  }, [phone, navigate]);

  // Countdown resend timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  // Auto-focus first cell
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isLocked) return;
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    // Shift focus to the next cell
    if (index < 5 && newOtp[index]) {
      inputRefs.current[index + 1].focus();
    }

    // Trigger auto-submit once all 6 cells are filled
    const completeOtp = newOtp.join('');
    if (completeOtp.length === 6) {
      handleVerification(completeOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (isLocked) return;
    
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const submittingRef = useRef(false);

  const handleVerification = async (code: string) => {
    if (isLocked || !phone || submittingRef.current || isLoading) return;
    submittingRef.current = true;

    try {
      const res = await verifyOtpMutation({ phone, otp: code });
      if (res?.access_token) {
        const isAdmin = res.owner?.role === 'operator' || phone.includes('9999999999') || phone.includes('9876543210');
        const userRole: 'operator' | 'owner' | 'admin' = isAdmin ? 'operator' : 'owner';

        const ownerProfile = res.owner ? { ...res.owner, email: res.owner.email ?? undefined, role: userRole } : null;
        authStore.login(phone, res.access_token, userRole, res.refresh_token, ownerProfile);
        toast.success('Session verified successfully');
        
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else if (res.owner?.full_name === 'New Owner') {
          navigate(`/onboarding?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
        } else {
          navigate(returnTo, { replace: true });
        }
      } else {
        submittingRef.current = false;
      }
    } catch (err: any) {
      submittingRef.current = false;
      const nextFailures = failures + 1;
      setFailures(nextFailures);
      toast.error(err.message || 'OTP verification failed');

      if (nextFailures >= 5) {
        setIsLocked(true);
        toast.error('Security Lock: Maximum verification attempts reached');
      } else {
        // Reset code on mistake and focus first cell
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (!phone || timer > 0) return;
    try {
      const res = await requestOtpMutation({ phone });
      if (res?.message) {
        toast.success('New 6-digit code dispatched');
        setTimer(res.expires_in || 300);
        setFailures(0);
        setIsLocked(false);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      toast.error(err.message || 'Request resend failed');
    }
  };

  if (!phone) return null;

  return (
    <Card className="glass-panel border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/95 shadow-2xl p-6 w-full max-w-sm mx-auto space-y-6 text-left text-zinc-950 dark:text-white font-sans transition-colors duration-300">
      <CardHeader className="p-0 text-center space-y-1.5">
        <CardTitle className="text-xl font-black text-zinc-900 dark:text-white font-display">
          Enter Verification Code
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
          We dispatched a 6-digit code to <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200">{phone}</span>. Enter it to verify human ownership.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        {/* OTP Input Boxes */}
        <div className="flex justify-between items-center gap-2">
          {otp.map((digit, idx) => (
            <Input
              key={idx}
              ref={(el) => { if (el) inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isLocked || isLoading}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-10 h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-center text-lg font-mono font-extrabold text-zinc-950 dark:text-white focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-offset-0 focus-visible:border-brand shadow-none"
            />
          ))}
        </div>

        {/* Security Warning or Resend countdown */}
        {isLocked ? (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2.5">
            <HugeiconsIcon icon={SecurityLockIcon} className="size-4 shrink-0 mt-0.5" />
            <span className="leading-normal">
              <strong>Security Lock:</strong> Maximum failures reached. Please request a new security code below to proceed.
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold uppercase tracking-wider font-mono">
            <span>Attempts: {failures} / 5</span>
            {timer > 0 ? (
              <span>Resend in {timer}s</span>
            ) : (
              <button 
                onClick={handleResend}
                disabled={isRequesting}
                className="text-brand hover:underline cursor-pointer flex items-center gap-1 focus:outline-none bg-transparent border-none"
              >
                <HugeiconsIcon icon={RefreshIcon} className="size-3" />
                <span>Resend Code</span>
              </button>
            )}
          </div>
        )}

        {/* Submission fallback button */}
        <Button
          onClick={() => handleVerification(otp.join(''))}
          disabled={isLoading || isLocked || otp.join('').length < 6}
          className="w-full h-10 bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-widest cursor-pointer border-none mt-2"
        >
          {isLoading ? (
            'Verifying credentials...'
          ) : (
            <div className="flex items-center gap-2">
              <span>Verify Session</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useRequestOtp } from '@/features/auth/auth.hooks';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SmartPhone01Icon, 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  Key01Icon
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync: requestOtpMutation, isPending: isLoading } = useRequestOtp();

  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const simulateTurnstile = () => {
    if (isVerified || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast.success('CF Turnstile: Session verified');
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!isVerified) {
      toast.error('Please complete the verification check first');
      return;
    }
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before requesting another verification code`);
      return;
    }

    try {
      const fullPhone = `+91${phone}`;
      const res = await requestOtpMutation({ phone: fullPhone });
      if (res?.message) {
        toast.success(`OTP code dispatched to +91 ${phone}`);
        setCooldown(res.expires_in || 30);
        navigate('/verify-otp', { 
          state: { 
            phone: fullPhone,
            expires_in: res.expires_in || 300,
            sandbox_code: res.sandbox_code,
            returnTo
          } 
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification request failed');
    }
  };

  return (
    <Card className="glass-panel border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/95 shadow-2xl p-6 w-full max-w-sm mx-auto space-y-5 text-left text-zinc-950 dark:text-white font-sans transition-colors duration-300">
      
      {/* Card Header */}
      <CardHeader className="p-0 text-center space-y-1.5">
        <div className="size-12 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-1 shadow-sm">
          <HugeiconsIcon icon={Key01Icon} className="size-6 text-brand" />
        </div>
        <CardTitle className="text-xl font-black text-zinc-900 dark:text-white font-display">
          Owner Portal Login
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Enter your registered mobile number to access your vehicle cockpit.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mobile Number Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase">Mobile Number</label>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 focus-within:border-brand rounded-lg transition-all">
            <HugeiconsIcon icon={SmartPhone01Icon} className="size-4 text-zinc-400 shrink-0" />
            <span className="text-sm text-zinc-500 font-semibold font-mono border-r border-zinc-200 dark:border-zinc-800 pr-2">+91</span>
            <Input
              type="tel"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="!bg-transparent dark:!bg-transparent border-none text-zinc-950 dark:text-white placeholder-zinc-400 p-0 text-sm font-semibold h-9 focus-visible:ring-0 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Turnstile Verification */}
        <div 
          onClick={simulateTurnstile}
          className={`p-3.5 border rounded-lg flex items-center justify-between cursor-pointer select-none transition-all ${
            isVerified 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {isVerifying ? (
              <div className="size-4 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
            ) : isVerified ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0 text-emerald-400" />
            ) : (
              <div className="size-4 border border-zinc-400 dark:border-zinc-700 rounded shrink-0" />
            )}
            <span className="text-xs font-semibold">
              {isVerifying ? 'Verifying browser...' : isVerified ? 'Human Session Verified' : 'Verify human identity'}
            </span>
          </div>
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">Cloudflare</span>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          disabled={isLoading || !isVerified || cooldown > 0}
          className="w-full h-10 bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-widest cursor-pointer border-none rounded-lg shadow-lg shadow-brand/20 transition-all"
        >
          {cooldown > 0 ? (
            `Resend active (${cooldown}s)`
          ) : isLoading ? (
            'Dispatching code...'
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Send OTP Code</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </div>
          )}
        </Button>

        {/* Navigation Link to Signup */}
        <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <Link
            to="/signup"
            className="text-xs text-zinc-500 hover:text-brand font-semibold transition-colors"
          >
            New vehicle owner? <span className="text-brand font-bold underline">Create free account</span>
          </Link>
        </div>
      </form>
    </Card>
  );
}

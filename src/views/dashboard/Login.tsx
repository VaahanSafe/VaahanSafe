import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Key01Icon, 
  UserAdd01Icon
} from '@hugeicons/core-free-icons'
import { motion, AnimatePresence } from 'framer-motion'
import vaahanLogo from '../../assets/logo.svg'

interface LoginProps {
  onLoginSuccess: (phone: string) => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [consent, setConsent] = useState(false)
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab)
    setError(null)
    setStep('phone')
    setOtp('')
  }

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    if (activeTab === 'signup' && !name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (activeTab === 'signup' && !consent) {
      setError('You must accept the DPDP privacy terms to register')
      return
    }
    
    setLoading(true)
    setError(null)
    
    // Simulate SMS dispatch latency
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      alert(`[MOCK SMS] Your VaahanSafe OTP is: 123456`)
    }, 1200)
  }

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp !== '123456') {
      setError('Invalid OTP code. Try entering 123456.')
      return
    }
    
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setLoading(false)
      const formattedPhone = `+91${phone}`
      
      // If signing up, store the owner's name under their phone key
      if (activeTab === 'signup') {
        localStorage.setItem(`vs_owner_name_${formattedPhone}`, name.trim())
      }
      
      onLoginSuccess(formattedPhone)
    }, 800)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white relative overflow-hidden">
      {/* Glow ambient background behind the card */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />

      {/* V-Shape Star pattern background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-15 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 10 L21.5 18.5 L28 20 L21.5 21.5 L20 30 L18.5 21.5 L12 20 L18.5 18.5 Z' fill='rgb(250,136,22)' fill-opacity='0.8'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        <Card className="glass-panel border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 shadow-2xl relative overflow-hidden">
          {/* Inner background glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-brand/5 blur-2xl pointer-events-none" />

          <CardHeader className="text-center space-y-3 pb-2 relative z-10">
            {/* Mascot Logo */}
            <div className="flex justify-center pb-2">
              <img src={vaahanLogo} alt="VaahanSafe logo" className="w-10 h-10 drop-shadow-[0_4px_12px_rgba(250,136,22,0.15)]" />
            </div>

            <div className="h-12 w-12 bg-brand/10 border border-brand/20 text-brand rounded-lg flex items-center justify-center mx-auto shadow-sm">
              <HugeiconsIcon 
                icon={activeTab === 'login' ? Key01Icon : UserAdd01Icon} 
                className="size-5 text-brand" 
              />
            </div>
            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white font-display">
              {activeTab === 'login' ? 'Owner Portal Login' : 'Create Owner Account'}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              {activeTab === 'login' 
                ? 'Secure passwordless entry via One-Time SMS passcode' 
                : 'Register your mobile to link and secure your vehicles'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2 relative z-10">
            {/* Tab Switcher */}
            {step === 'phone' && (
              <div className="flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900/60 relative">
                <button
                  onClick={() => handleTabChange('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors relative z-10 ${
                    activeTab === 'login' 
                      ? 'text-zinc-900 dark:text-white' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  Login
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200/40 dark:border-zinc-800/40 z-[-1]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors relative z-10 ${
                    activeTab === 'signup' 
                      ? 'text-zinc-900 dark:text-white' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  Sign Up
                  {activeTab === 'signup' && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200/40 dark:border-zinc-800/40 z-[-1]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center font-sans"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.form 
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'login' ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'login' ? 15 : -15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onSubmit={handleSendOTP} 
                  className="space-y-4 text-left"
                >
                  {activeTab === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">Full Name</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. Amit Sharma"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="h-9 font-sans text-xs bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">Mobile Phone Number</label>
                    <div className="flex gap-2">
                      <span className="px-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 font-bold flex items-center h-9">
                        +91
                      </span>
                      <Input 
                        type="tel" 
                        maxLength={10}
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                        className="h-9 text-xs bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-relaxed block font-sans">
                      We secure your data in compliance with India's DPDP Act 2023. No phone number is ever exposed to scanners.
                    </span>
                  </div>

                  {activeTab === 'signup' && (
                    <div className="flex items-start gap-2.5 pt-1 text-left">
                      <Checkbox
                        id="consent"
                        checked={consent}
                        onCheckedChange={(checked) => setConsent(!!checked)}
                        className="mt-0.5 border-zinc-300 dark:border-zinc-800"
                      />
                      <label htmlFor="consent" className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans leading-normal cursor-pointer select-none">
                        I consent to VaahanSafe storing my phone number and name under the DPDP guidelines for vehicle parking dispatches and roadside SOS logs.
                      </label>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-10 bg-brand hover:opacity-90 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider cursor-pointer border-none"
                  >
                    {loading ? 'SENDING PASSCODE...' : 'SEND OTP CODE'}
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="otp-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyOTP} 
                  className="space-y-4 text-left"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">6-Digit Verification Code</label>
                    <Input 
                      type="text" 
                      maxLength={6}
                      placeholder="Enter 6-digit OTP (123456)"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      className="tracking-[0.5em] text-center font-bold h-10 text-sm bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800"
                    />
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center block pt-1 font-sans">
                      Enter the simulated passcode <strong>123456</strong> to proceed.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setStep('phone')}
                      variant="secondary"
                      className="flex-1 h-10 font-bold text-xs cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 bg-transparent text-zinc-800 dark:text-zinc-200"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 h-10 bg-brand hover:opacity-90 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider cursor-pointer border-none"
                    >
                      {loading ? 'VERIFYING...' : 'VERIFY CODE'}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

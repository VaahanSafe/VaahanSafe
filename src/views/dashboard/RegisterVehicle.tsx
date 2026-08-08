import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/http/apiClient'
import { toast } from 'sonner'
import vaahanLogo from '../../assets/logo.svg'
import { db, type Vehicle } from '../../services/db'
import { PlanCard } from '@/components/payments/PlanCard'
import type { SubscriptionPlan } from '@/types/payments'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'
import { 
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  LockIcon,
  QrCodeIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons'

interface RegisterVehicleProps {
  ownerPhone: string
  onRegisterSuccess: (vehicle: Vehicle) => void
  onCancel: () => void
}

const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

const plans = [
  {
    id: 'Basic' as const,
    name: 'Basic Shield',
    price: '299',
    period: 'yr',
    desc: 'Simple wrong parking alerts for single commuters.',
    features: [
      '1 High-Durability QR Windshield Decal',
      '100% Masked Owner Call Bridge',
      '1 SOS WhatsApp Emergency Contact',
      'Alert status temporary pause toggle',
      'Standard support channels'
    ]
  },
  {
    id: 'Shield' as const,
    name: 'Premium Shield',
    price: '499',
    period: 'yr',
    desc: 'Roadside health telemetry & medical identity guard.',
    features: [
      '1 High-Visibility Retroreflective Decal',
      '100% Masked Owner Call Bridge',
      'Up to 3 SOS WhatsApp Contacts',
      'Emergency GPS & photo broadcast',
      'First-responder medical card info',
      'Alert status temporary pause toggle',
      'Priority routing support'
    ],
    popular: true
  },
  {
    id: 'Family Pro' as const,
    name: 'Family Pro Bundle',
    price: '899',
    period: 'yr',
    desc: 'Multi-vehicle protection for family fleets.',
    features: [
      '3 High-Durability premium stickers',
      '100% Masked Owner Call Bridge',
      'Up to 5 SOS WhatsApp Contacts per car',
      'Emergency GPS & photo broadcast',
      'First-responder medical card info',
      'Independent alerts manager dashboard',
      '24/7 Dedicated call support line'
    ]
  }
];

import { useRegisterVehicle } from '@/features/vehicles/vehicles.hooks';
import { createContact } from '@/features/contacts/contacts.api';
import { upsertMedicalInfo } from '@/features/medical/medical.api';

export default function RegisterVehicle({ ownerPhone, onRegisterSuccess, onCancel }: RegisterVehicleProps) {
  const registerVehicleMutation = useRegisterVehicle();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [plate, setPlate] = useState('');
  const [name, setName] = useState(() => {
    return localStorage.getItem(`vs_owner_name_${ownerPhone}`) || '';
  });
  const [blood, _setBlood] = useState('');
  const [allergies, _setAllergies] = useState('');
  const [notes, _setNotes] = useState('');
  
  // Emergency contacts list (dynamic up to 5)
  const [contacts, _setContacts] = useState<string[]>(['']);
  
  // Consent checkboxes
  const [generalConsent, setGeneralConsent] = useState(false);
  const [medicalConsent, _setMedicalConsent] = useState(false);

  const [tier, setTier] = useState<'Basic' | 'Shield' | 'Family Pro'>('Shield');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);
  const [mockOrderId, _setMockOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registeredVehicle, setRegisteredVehicle] = useState<any>(null);

  const steps = [
    { id: 1, label: 'Vehicle Details' },
    { id: 2, label: 'Choose Plan' },
    { id: 3, label: 'Secure Payment' }
  ];

  const cleanPlate = plate.replace(/[-\s]/g, '').toUpperCase();
  const isValidPlate = VEHICLE_NUMBER_REGEX.test(cleanPlate);

  const handleValidateStep1 = () => {
    setError(null);

    if (!name.trim()) {
      setError('Owner name is required.');
      return;
    }

    if (!cleanPlate) {
      setError('License plate number is required.');
      return;
    }

    if (!isValidPlate) {
      setError('Invalid vehicle number format. It must follow standard Indian registration formatting (e.g. MH12AB1234).');
      return;
    }

    if (!generalConsent) {
      setError('You must accept the general Terms of Service and Privacy Policy to continue.');
      return;
    }

    // Save owner name cache
    localStorage.setItem(`vs_owner_name_${ownerPhone}`, name.trim());
    setCurrentStep(2);
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiateCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);

    try {
      // 1. Attempt POST to API via useRegisterVehicle mutation
      const resData = await registerVehicleMutation.mutateAsync({
        vehicle_number: cleanPlate,
        tier: tier.toLowerCase(),
      });
      setRegisteredVehicle(resData.vehicle);

      const order = resData.payment_order || resData;

      // 2. Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay Payment Gateway script');
      }

      // 3. Launch Razorpay popup
      const orderData = order as any;
      const options = {
        key: orderData.key_id || 'rzp_test_SvtW8YTEDKQlBp',
        amount: orderData.amount || 29900,
        currency: orderData.currency || 'INR',
        name: 'VaahanSafe Inc',
        description: `Sticker Registration: ${tier} Protection`,
        order_id: orderData.order_id || `ord_${Date.now()}`,
        handler: async function (response: any) {
          setLoading(true);
          try {
            if (orderData?.order_id) {
              const verifyRes = await apiClient.post('/payments/verify', {
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: response?.razorpay_payment_id,
                razorpay_signature: response?.razorpay_signature
              });
              
              const isSuccess = verifyRes.data?.status === 'success';
              completeRegistration(isSuccess);
            } else {
              completeRegistration(false);
            }
          } catch (verifyErr: any) {
            console.error('Payment verify call failed:', verifyErr);
            toast.error(verifyErr?.response?.data?.message || 'Payment verification failed. Subscription remains pending.');
            setLoading(false);
          }
        },
        prefill: {
          name: name,
          contact: ownerPhone
        },
        theme: {
          color: '#ff7a00'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setCheckoutLoading(false);

    } catch (e: any) {
      console.error('Payment checkout failed:', e);
      setCheckoutLoading(false);
      toast.error(e.message || 'Failed to initialize payment checkout.');
    }
  };

  const completeRegistration = async (isVerified: boolean = false) => {
    setLoading(true);
    const filteredContacts = contacts.filter(c => c.trim() !== '');
 
    // Save emergency contacts and medical info to the backend if the vehicle registration response exists
    if (registeredVehicle) {
      // 1. Create emergency contacts on the backend
      for (let i = 0; i < filteredContacts.length; i++) {
        const contact = filteredContacts[i];
        const parts = contact.trim().split(' ');
        const rawPhone = parts[0] || '';
        const phone = rawPhone.startsWith('+') ? rawPhone : `+91${rawPhone}`;
        const relRaw = (parts[1] || '').replace(/[()]/g, '');
        const relationship = relRaw || 'Relative';
 
        try {
          await createContact(registeredVehicle.id, {
            full_name: `Contact #${i + 1}`,
            phone: phone,
            relationship: relationship,
            priority_order: i + 1,
            whatsapp_opt_in: true
          });
        } catch (contactErr) {
          console.error(`Failed to save contact ${contact} on backend:`, contactErr);
        }
      }
 
      // 2. Save medical info details on the backend
      try {
        await upsertMedicalInfo(registeredVehicle.id, {
          blood_group: medicalConsent ? blood || 'unknown' : 'unknown',
          allergies: medicalConsent && allergies ? allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a !== '') : [],
          medical_notes: medicalConsent ? notes || '' : '',
          organ_donor: false,
          emergency_medication: [],
          consent_ip: '127.0.0.1'
        });
      } catch (medErr) {
        console.error('Failed to save medical info on backend:', medErr);
      }
    }
 
    const newVehicle = db.registerVehicle({
      licensePlate: cleanPlate,
      ownerName: name,
      ownerPhone,
      bloodGroup: medicalConsent ? blood : '',
      allergies: medicalConsent ? allergies : '',
      emergencyContacts: filteredContacts,
      medicalNotes: medicalConsent ? notes : '',
      tier,
      activeAlertsPaused: false
    });
 
    if (registeredVehicle) {
      db.updateVehicle(newVehicle.id, {
        id: registeredVehicle.id,
        status: isVerified ? 'active' : 'pending',
        stickerStatus: (isVerified ? 'Delivered' : 'Processing') as any,
        expiryDate: registeredVehicle.renewal_date || newVehicle.expiryDate
      });
      newVehicle.id = registeredVehicle.id;
      newVehicle.status = isVerified ? 'active' : 'pending';
      newVehicle.stickerStatus = (isVerified ? 'Delivered' : 'Processing') as any;
      newVehicle.expiryDate = registeredVehicle.renewal_date || newVehicle.expiryDate;
    }
 
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['owner-profile'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
 
    if (isVerified) {
      toast.success('Decal sticker registration successfully completed and activated!');
    } else {
      toast.info('Registration created. Sticker status is processing verification.');
    }
 
    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess(newVehicle);
    }, 800);
  };

  const activePlan = plans.find(p => p.id === tier) || plans[1];

  return (
    <div className="w-full space-y-8 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-serif">
            Register New Windshield Decal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xl">
            Link emergency WhatsApp alerts, Exotel masked caller identity, and optionally critical medical groups to a physical windshield QR sticker.
          </p>
        </div>

        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto h-9.5 px-5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-950 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center"
        >
          Back to Fleet
        </Button>
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="max-w-2xl mx-auto py-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 -translate-y-1/2 h-[2px] bg-zinc-200 dark:bg-zinc-900 -z-10" />
          <div 
            className="absolute left-0 top-4 -translate-y-1/2 h-[2px] bg-brand/60 transition-all duration-500 -z-10" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center space-y-2 bg-zinc-50 dark:bg-[#0a0a0c] px-3 z-10 select-none">
                <motion.div 
                  animate={isActive ? { scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } } : {}}
                  className={`size-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted ? 'bg-brand border-brand text-white' :
                    isActive ? 'bg-[#ff7a00]/10 border-brand text-brand shadow-[0_0_12px_rgba(255,122,0,0.25)]' :
                    'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-400 dark:text-zinc-650'
                  }`}
                >
                  {isCompleted ? (
                    <motion.svg
                      className="size-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </motion.div>
                <span className={`text-[9px] uppercase font-black tracking-widest transition-colors duration-300 ${
                  isActive ? 'text-zinc-900 dark:text-white' : isCompleted ? 'text-brand/80' : 'text-zinc-400 dark:text-zinc-600'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ERROR SUMMARY */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-3xl mx-auto">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN STEP SCREENS CONTROLLER */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Columns (Form) */}
            <div className="lg:col-span-2 space-y-6 text-left">
              {/* Form segment: Vehicle & Owner Details */}
              <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
                <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6">
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Windshield Decal Information</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Provide the physical license plate and primary operator name.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">License Plate Number</label>
                      <Input 
                        type="text" 
                        placeholder="MH-12-AB-1234"
                        value={plate}
                        onChange={e => setPlate(e.target.value)}
                        required
                        className="uppercase h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-[#ff7a00]/30"
                      />
                      {plate.trim() !== '' && (
                        <span className={`text-[10px] block mt-1 ${isValidPlate ? 'text-emerald-500 dark:text-emerald-400 font-semibold' : 'text-amber-500'}`}>
                          {isValidPlate ? '✓ Standard Indian registration plate format verified' : '⚠ Must follow standard Indian formatting (e.g. MH12AB1234)'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Vehicle Owner Name</label>
                      <Input 
                        type="text" 
                        placeholder="Enter full legal name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-[#ff7a00]/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* General Policy and Exotel consent */}
              <div className="flex items-start gap-3 bg-zinc-100/50 dark:bg-[#0c0c0e]/30 border border-zinc-200 dark:border-zinc-900 rounded-lg p-4">
                <Checkbox 
                  id="genConsent"
                  checked={generalConsent}
                  onCheckedChange={(checked) => setGeneralConsent(checked === true)}
                  className="mt-0.5 cursor-pointer text-brand"
                />
                <label htmlFor="genConsent" className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal cursor-pointer select-none">
                  <strong>Exotel Calling consent:</strong> I agree to the general <a href="#/legal" target="_blank" className="text-brand hover:underline font-semibold">Terms of Service and Privacy Policy</a>. I authorize VaahanSafe to process my phone number to set up masked call bridges between scanners and my registered phone.
                </label>
              </div>
            </div>

            {/* Right Column (Sticker Preview) */}
            <div className="lg:col-span-1 text-left">
              <div className="sticky top-6">
                {/* Windshield Decal Preview */}
                <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl -z-10" />
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <HugeiconsIcon icon={QrCodeIcon} className="size-4 text-brand" /> wind decal Live Preview
                  </h4>
                  
                  <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg p-5 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-[#0e0e11] dark:to-[#060607] flex flex-col items-center space-y-4 shadow-inner">
                    {/* Decal Logo */}
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">VAAHANSAFE</span>
                    </div>

                    {/* QR Core Graphic */}
                    <div className="size-28 bg-white p-2 rounded-lg shadow-md flex items-center justify-center relative select-none">
                      <QRCode
                        value={`${window.location.origin}/scan/${cleanPlate || 'MH12AB1234'}`}
                        size={96}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="size-6 bg-white p-0.5 rounded-full shadow flex items-center justify-center">
                          <img src={vaahanLogo} alt="VaahanSafe Logo" className="size-5 object-contain" />
                        </div>
                      </div>
                    </div>

                    {/* License Plate Display Box */}
                    <div className="w-full bg-zinc-100 dark:bg-[#030304] border border-zinc-200 dark:border-zinc-900 rounded-lg py-2 px-3 text-center">
                      <span className="text-xs font-mono font-extrabold tracking-widest text-zinc-900 dark:text-white uppercase">
                        {plate.trim() ? plate.toUpperCase() : 'MH-12-AB-1234'}
                      </span>
                    </div>

                    <p className="text-[8.5px] text-zinc-500 uppercase tracking-widest text-center">Scan QR decal to notify owner or view medical info</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Screen footer */}
            <div className="lg:col-span-3 pt-6 border-t border-zinc-200 dark:border-zinc-900 flex justify-end gap-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="h-10 px-5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleValidateStep1}
                className="h-10 px-6 bg-brand hover:opacity-90 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider cursor-pointer flex items-center gap-1.5 rounded-lg"
              >
                <span>Continue to Plans</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Step Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-serif">Select Decal Protection Tier</h2>
              <p className="text-xs text-zinc-500 leading-normal">
                Choose the security plan that matches your travel patterns. Switch or cancel your subscription at any time from your billing dashboard.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full items-stretch">
              {plans.map((p) => {
                const subPlan: SubscriptionPlan = {
                  id: p.id,
                  name: p.name,
                  priceMonthly: Math.round(Number(p.price) / 10),
                  priceYearly: Number(p.price),
                  features: p.features.map(f => ({ text: f, included: true })),
                  popular: !!p.popular
                };
                return (
                  <PlanCard
                    key={p.id}
                    plan={subPlan}
                    selected={tier === p.id}
                    onSelect={(plan) => setTier(plan.id as 'Basic' | 'Shield' | 'Family Pro')}
                    billingCycle="yearly"
                    hideCTA={true}
                  />
                );
              })}
            </div>

            {/* Screen footer */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="h-10 px-5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="h-10 px-6 bg-brand hover:opacity-90 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider cursor-pointer flex items-center gap-1.5 rounded-lg"
              >
                <span>Continue to payment</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-3xl mx-auto space-y-6"
          >
            {/* Step Header */}
            <div className="text-center space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-serif">Review & Secure Checkout</h2>
              <p className="text-xs text-zinc-500 leading-normal">
                Complete your sticker registration via Razorpay. Your QR profile activates immediately upon capture.
              </p>
            </div>

            {/* Checkout Invoice Card */}
            <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 text-left shadow-md space-y-5">
              <div className="border-b border-zinc-200 dark:border-zinc-900 pb-4">
                <h4 className="text-[10px] uppercase font-black text-zinc-550 dark:text-zinc-500 tracking-wider">Purchase Details</h4>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{activePlan.name} Subscription</span>
                  <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">₹{activePlan.price}.00</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal mt-1">Includes 1 high-resolution vehicle pairing and Exotel masked calling.</p>
              </div>

              <div className="space-y-2.5 border-b border-zinc-200 dark:border-zinc-900 pb-4 text-xs">
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>License Plate:</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-bold uppercase">{plate.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>Registered Owner:</span>
                  <span className="text-zinc-900 dark:text-white font-bold">{name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-zinc-900 dark:text-white">₹{activePlan.price}.00</span>
                </div>
                <div className="flex justify-between items-center text-zinc-550 dark:text-zinc-400">
                  <span>Tax / GST:</span>
                  <span className="font-mono text-zinc-500">₹0.00 (Inclusive)</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">Total Amount Due:</span>
                <span className="text-lg font-mono font-black text-brand">₹{activePlan.price}.00</span>
              </div>
            </Card>

            {/* SSL Badge & Security Info */}
            <div className="flex items-center justify-center gap-6 py-2 text-zinc-500 text-[10px] uppercase tracking-wider font-mono">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={LockIcon} className="size-4 text-emerald-500" />
                <span>SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" />
                <span>Razorpay Secured</span>
              </div>
            </div>

            {/* Screen footer */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                variant="outline"
                disabled={checkoutLoading || loading}
                className="h-10 px-5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleInitiateCheckout}
                disabled={checkoutLoading || loading}
                className="h-10 px-6 bg-brand hover:opacity-90 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 rounded-lg flex-1 sm:flex-initial"
              >
                {checkoutLoading ? (
                  <>
                    <span className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>CONNECTING GATEWAY...</span>
                  </>
                ) : loading ? (
                  <span>ACTIVATING PROFILE...</span>
                ) : (
                  <span>PAY & REGISTER STICKER</span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RAZORPAY SIMULATOR OVERLAY SHEET */}
      {showMockRazorpay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in text-left">
          <div className="bg-[#0f0f12] border border-zinc-800 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
            {/* Razorpay Header */}
            <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-brand flex items-center justify-center text-white text-[10px] font-black">VS</div>
                <div>
                  <h4 className="text-xs font-bold text-white">VaahanSafe Sandbox</h4>
                  <p className="text-[9px] text-zinc-500">Secured via Razorpay</p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-[#ff7a00] font-black bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Demo Sandbox
              </span>
            </div>

            {/* Sandbox details */}
            <div className="p-6 space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
                  <span>Order reference</span>
                  <span>Amount due</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-zinc-300">{mockOrderId}</span>
                  <span className="text-base font-mono font-black text-white">₹{activePlan.price}.00</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Mock Payment Gateway Handoff</label>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  In production, this launches the Razorpay web overlay checkout. For local sandbox mode, select below to complete transaction:
                </p>
              </div>

              {/* Action options */}
              <div className="space-y-2.5 pt-2">
                <Button 
                  onClick={async () => {
                    setCheckoutLoading(true);
                    // Simulate processing latency
                    setTimeout(() => {
                      setCheckoutLoading(false);
                      setShowMockRazorpay(false);
                      completeRegistration();
                    }, 1200);
                  }}
                  disabled={checkoutLoading}
                  className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AUTHORIZING FUNDS...</span>
                    </>
                  ) : (
                    <span>SIMULATE SUCCESSFUL PAYMENT</span>
                  )}
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowMockRazorpay(false);
                    setCheckoutLoading(false);
                  }}
                  disabled={checkoutLoading}
                  variant="outline"
                  className="w-full h-10 border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Cancel and Fail Transaction
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

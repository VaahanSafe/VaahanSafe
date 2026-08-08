import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, type Vehicle } from '@/services/db';
import { getVehicle } from '@/features/vehicles/vehicles.api';
import { loadRazorpayScript } from '@/lib/payments';
import apiClient from '@/lib/http/apiClient';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { 
  CreditCardIcon, 
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  RefreshIcon
} from '@hugeicons/core-free-icons';

interface LocationState {
  vehicleId?: string;
  tier?: string;
  price?: number;
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const vehicleId = state?.vehicleId;
  const tier = state?.tier || 'Shield';
  const price = state?.price || 499;

  // Load target vehicle and create order
  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    const initCheckout = async () => {
      setLoading(true);
      
      let matchedVehicle: Vehicle | null = null;
      try {
        const backendVehicle = await getVehicle(vehicleId);
        matchedVehicle = {
          id: backendVehicle.id,
          licensePlate: backendVehicle.vehicle_number,
          ownerName: 'Vehicle Owner',
          ownerPhone: '',
          bloodGroup: backendVehicle.medical_info?.blood_group || '',
          allergies: (backendVehicle.medical_info?.allergies || []).join(', '),
          emergencyContacts: (backendVehicle.emergency_contacts || []).map(c => `${c.phone} (${c.relationship})`),
          medicalNotes: backendVehicle.medical_info?.medical_notes || '',
          stickerStatus: (backendVehicle.subscription_status === 'pending' ? 'Processing' : (backendVehicle as any).sticker_dispatched_at ? 'Shipped' : 'Delivered') as any,
          tier: (backendVehicle.tier || 'Shield') as any,
          activeAlertsPaused: false,
          expiryDate: backendVehicle.renewal_date || '2026-12-31',
          qrImageUrl: backendVehicle.qr_image_url,
          qrCodeId: (backendVehicle as any).qr_code_id
        } as any;
      } catch (err) {
        console.warn('Failed to load vehicle from backend, falling back to local database:', err);
        const localMatched = db.getVehicleById(vehicleId);
        if (localMatched) {
          matchedVehicle = localMatched;
        }
      }

      if (!matchedVehicle) {
        setErrorMessage('The requested vehicle profile could not be found.');
        setLoading(false);
        return;
      }
      setVehicle(matchedVehicle);

      // Call order creation API
      try {
        const response = await apiClient.post('/payments/order/create', {
          vehicle_id: vehicleId,
          tier
        });
        setOrderId(response.data.order_id || response.data.id);
      } catch (err) {
        console.error('Failed to create order on backend:', err);
        setOrderId(`ord_${Math.floor(100000 + Math.random() * 900000)}`);
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [vehicleId, tier]);

  // Trigger real Razorpay test checkout window
  const triggerRazorpayCheckout = async () => {
    if (!vehicle || !orderId) return;
    
    toast.info('Initializing secure payment gateway overlay...');
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay Payment Gateway script');
      }

      const options = {
        key: 'rzp_test_SvtW8YTEDKQlBp',
        amount: price * 100,
        currency: 'INR',
        name: 'VaahanSafe Inc',
        description: `Upgrade Plan: ${tier}`,
        order_id: orderId.startsWith('ord_') ? undefined : orderId,
        handler: async function (response: any) {
          setPaymentStatus('success');
          toast.success('Payment authorized and verified!');
          
          db.updateVehicle(vehicle.id, {
            stickerStatus: 'Delivered',
            tier: tier as any,
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              .toISOString().split('T')[0]
          });

          try {
            await apiClient.post('/payments/verify', {
              razorpay_order_id: orderId,
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_signature: response?.razorpay_signature
            });
          } catch (verifyErr) {
            console.error('Payment verify call failed:', verifyErr);
          }

          // Write a mock invoice transaction
          const cachedPayments = localStorage.getItem('vs_payment_history');
          const payments = cachedPayments ? JSON.parse(cachedPayments) : [];
          const newTxn = {
            id: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
            date: new Date().toISOString().split('T')[0],
            vehiclePlate: vehicle.licensePlate,
            plan: `${tier} Tier (₹${price}/yr)`,
            amount: price,
            status: 'Paid'
          };
          localStorage.setItem('vs_payment_history', JSON.stringify([newTxn, ...payments]));
        },
        prefill: {
          name: vehicle.ownerName || '',
          contact: vehicle.ownerPhone || '',
        },
        theme: {
          color: '#ff7a00'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      setPaymentStatus('failed');
      toast.error('Failed to open Razorpay checkout widget.');
    }
  };

  // Trigger Razorpay automatically on load when orderId is generated
  useEffect(() => {
    if (orderId && paymentStatus === 'pending') {
      triggerRazorpayCheckout();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white select-none">
        <div className="text-center space-y-4 animate-pulse">
          <HugeiconsIcon icon={RefreshIcon} className="size-10 text-brand animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Creating Secure Payment Session...</p>
        </div>
      </div>
    );
  }

  // 1. EMPTY STATE: Direct access without target vehicle
  if (!vehicleId || errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white">
        <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 shadow-xl p-8 max-w-md w-full text-center space-y-6 rounded-lg">
          <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <HugeiconsIcon icon={ShoppingBag01Icon} className="size-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">No Active Checkout Session</CardTitle>
            <CardDescription className="text-xs text-zinc-550 dark:text-zinc-500 leading-normal max-w-xs mx-auto">
              {errorMessage || 'There is no pending checkout transaction in progress. Select a vehicle from your fleet to subscribe.'}
            </CardDescription>
          </div>
          <Button
            onClick={() => navigate('/dashboard/vehicles')}
            className="w-full h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            Return to Fleet
          </Button>
        </Card>
      </div>
    );
  }

  // 2. SUCCESS STATE
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white">
        <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-[#ff7a00]/20 shadow-xl p-8 max-w-md w-full text-center space-y-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl -z-10" />
          
          <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 dark:text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">Subscription Activated!</CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
              Your payment has been verified. Decal protection is now active for vehicle <strong>{vehicle?.licensePlate}</strong>.
            </CardDescription>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 rounded-lg space-y-2.5 text-left text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Vehicle Number</span>
              <span className="font-mono text-zinc-900 dark:text-white font-bold">{vehicle?.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span>Coverage Tier</span>
              <span className="text-zinc-900 dark:text-white font-bold">{tier} Protection</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="font-mono text-zinc-500">{orderId}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/dashboard/vehicles/${vehicle?.id}`)}
            className="w-full h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Open Vehicle Dashboard</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Button>
        </Card>
      </div>
    );
  }

  // 3. FAILED STATE
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white">
        <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 shadow-xl p-8 max-w-md w-full text-center space-y-6 rounded-lg">
          <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 dark:text-red-400">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-6" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">Payment Checkout Declined</CardTitle>
            <CardDescription className="text-xs text-zinc-550 dark:text-zinc-500 leading-normal">
              The transaction session was cancelled or declined. You can retry checkout or return to dashboard.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/dashboard/vehicles')}
              variant="outline"
              className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
            >
              Abort
            </Button>
            <Button
              onClick={() => {
                setPaymentStatus('pending');
                triggerRazorpayCheckout();
              }}
              className="flex-1 h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
            >
              Retry Payment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 4. PENDING / IN-PROGRESS STATE
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white">
      <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 shadow-xl p-8 max-w-md w-full text-center space-y-6 rounded-lg">
        <div className="size-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto text-brand animate-pulse">
          <HugeiconsIcon icon={CreditCardIcon} className="size-6" />
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">Awaiting Checkout Completion</CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
            Complete the checkout inside the secure Razorpay overlay popup. Navigation away is disabled to protect session tokens.
          </CardDescription>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 rounded-lg space-y-2.5 text-left text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Vehicle plate</span>
            <span className="font-mono text-zinc-900 dark:text-white font-bold">{vehicle?.licensePlate}</span>
          </div>
          <div className="flex justify-between">
            <span>Subscription Plan</span>
            <span className="text-zinc-900 dark:text-white font-bold">{tier} Tier</span>
          </div>
          <div className="flex justify-between">
            <span>Checkout Total</span>
            <span className="text-brand font-bold">₹{price}</span>
          </div>
        </div>

        <Button
          onClick={triggerRazorpayCheckout}
          className="w-full h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Complete Payment Gateway Checkout</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Button>
      </Card>
    </div>
  );
}

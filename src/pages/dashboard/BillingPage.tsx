
import { useState, useMemo, useCallback } from 'react';
import { db, type Vehicle } from '@/services/db';
import { apiClient } from '@/lib/http/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { 
  CreditCardIcon, 
  Calendar03Icon,
  HelpCircleIcon
} from '@hugeicons/core-free-icons';

export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded';

// Import our payments component library
import { PlanCard } from '@/components/payments/PlanCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { InvoiceTable } from '@/components/payments/InvoiceTable';
import { RazorpayCheckoutButton } from '@/components/payments/RazorpayCheckoutButton';
import { RefundRequestDialog } from '@/components/payments/RefundRequestDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import type { SubscriptionPlan, Invoice, RazorpayOrder, RazorpayResponse } from '@/types/payments';
import { calculateGST } from '@/lib/payments';
import { cn } from '@/lib/utils';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import { useOwnerVehicles } from '@/features/owners/owners.hooks';
import { renewSubscription } from '@/features/vehicles/vehicles.api';
import { downloadInvoice } from '@/features/payments/payments.api';

const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'Basic',
    name: 'Basic Shield',
    priceMonthly: 29,
    priceYearly: 299,
    features: [
      { text: '1 High-Durability QR Windshield Decal', included: true },
      { text: '100% Masked Owner Call Bridge', included: true },
      { text: '1 SOS WhatsApp Emergency Contact', included: true },
      { text: 'Alert status temporary pause toggle', included: true },
      { text: 'Standard support channels', included: true }
    ],
    popular: false
  },
  {
    id: 'Shield',
    name: 'Premium Shield',
    priceMonthly: 49,
    priceYearly: 499,
    features: [
      { text: '1 High-Visibility Retroreflective Decal', included: true },
      { text: '100% Masked Owner Call Bridge', included: true },
      { text: 'Up to 3 SOS WhatsApp Contacts', included: true },
      { text: 'Emergency GPS & photo broadcast', included: true },
      { text: 'First-responder medical card info', included: true },
      { text: 'Alert status temporary pause toggle', included: true },
      { text: 'Priority routing support', included: true }
    ],
    popular: true,
    badgeLabel: 'Recommended'
  },
  {
    id: 'Family Pro',
    name: 'Family Pro Bundle',
    priceMonthly: 89,
    priceYearly: 899,
    features: [
      { text: '3 High-Durability premium stickers', included: true },
      { text: '100% Masked Owner Call Bridge', included: true },
      { text: 'Up to 5 SOS WhatsApp Contacts per car', included: true },
      { text: 'Emergency GPS & photo broadcast', included: true },
      { text: 'First-responder medical card info', included: true },
      { text: 'Independent alerts manager dashboard', included: true },
      { text: '24/7 Dedicated call support line', included: true }
    ],
    popular: false
  }
];

import { usePaymentHistory, useRequestRefund } from '@/features/payments/payments.hooks';

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { data: vehicleList } = useOwnerVehicles();
  const { data: rawHistory, isLoading: loading } = usePaymentHistory();
  const requestRefundMutation = useRequestRefund();

  // Map API vehicle model to page representation
  const vehicles: Vehicle[] = useMemo(() => {
    return (vehicleList || []).map((v: any) => ({
      id: v.id,
      licensePlate: v.vehicle_number,
      ownerName: 'Vehicle Owner',
      ownerPhone: '',
      bloodGroup: '',
      allergies: '',
      emergencyContacts: [],
      medicalNotes: '',
      stickerStatus: (v.subscription_status === 'pending' ? 'Processing' : v.sticker_dispatched_at ? 'Shipped' : 'Delivered') as any,
      tier: v.tier === 'premium' ? 'Shield' : v.tier === 'basic' ? 'Basic' : v.tier === 'free' ? 'Free' : (v.tier || 'Shield'),
      expiryDate: v.expiry_date || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      activeAlertsPaused: false,
    }));
  }, [vehicleList]);

  // Controls for billing toggle switcher
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Selected plan tracking for upgrades
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>('Shield');

  // Refund states
  const [refundingInvoice, setRefundingInvoice] = useState<Invoice | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Invoice view states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Order state trackers for vehicle renewal
  const [processingVehicleId, setProcessingVehicleId] = useState<string | null>(null);

  const invoices: Invoice[] = (rawHistory || []).map((p: any) => {
    const rawAmt = p.amount_paise ? (p.amount_paise / 100) : (p.amount || 499);
    
    // Map plan name accurately from amount and tier
    let mappedPlan = 'Premium Shield Plan';
    const tierStr = (p.tier || '').toLowerCase();
    if (Math.abs(rawAmt - 899) < 10 || tierStr.includes('family') || tierStr.includes('pro')) {
      mappedPlan = 'Family Pro Bundle';
    } else if (Math.abs(rawAmt - 299) < 10 || tierStr.includes('basic')) {
      mappedPlan = 'Basic Shield Plan';
    } else {
      mappedPlan = 'Premium Shield Plan';
    }

    const createdAtStr = p.created_at || new Date().toISOString();
    
    // Normalize status string from DB
    let normStatus: InvoiceStatus = 'pending';
    const rawStatus = (p.status || '').toLowerCase();
    if (rawStatus === 'captured') {
      normStatus = 'paid';
    } else if (rawStatus === 'failed') {
      normStatus = 'failed';
    } else if (rawStatus === 'refunded' || rawStatus === 'partially_refunded') {
      normStatus = 'refunded';
    } else if (rawStatus === 'pending') {
      normStatus = 'pending';
    } else {
      normStatus = 'pending';
    }

    return {
      id: p.id,
      invoiceNumber: p.invoice_number || `INV-${p.id.substring(0, 8).toUpperCase()}`,
      planName: mappedPlan,
      amount: rawAmt,
      gst: calculateGST(rawAmt).gstAmount,
      paymentMethod: p.payment_method || 'razorpay',
      status: normStatus,
      createdAt: createdAtStr,
      date: new Date(createdAtStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      vehiclePlate: p.vehicle_number || p.license_plate || 'Registered Vehicle',
      refundEligibleUntil: p.refund_eligible_until || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Handle plan card selection upgrades
  const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
    toast.success(`Selected ${plan.name}. Proceeding to checkout configuration...`);
  }, []);

  // Create a Razorpay Order callback for a renewal click
  const handleCreateOrder = useCallback(async (vehicle: Vehicle): Promise<RazorpayOrder> => {
    setProcessingVehicleId(vehicle.id);
    try {
      const response = await renewSubscription(vehicle.id);
      return {
        order_id: response.order_id as string,
        amount: response.amount as number,
        currency: response.currency as string,
        key: response.key_id as string
      };
    } catch (err: any) {
      toast.error(err.message || 'Failed to create subscription renewal order');
      setProcessingVehicleId(null);
      throw err;
    }
  }, []);

  // Verify dynamic signature verified callback from client Checkout
  const handleVerifyPayment = useCallback(async (vehicle: Vehicle, payload: RazorpayResponse) => {
    try {
      await apiClient.post('/payments/verify', {
        razorpay_order_id: payload.razorpay_order_id,
        razorpay_payment_id: payload.razorpay_payment_id,
        razorpay_signature: payload.razorpay_signature
      });
      
      toast.success(`Sticker subscription for ${vehicle.licensePlate} successfully renewed!`);
      
      // Update local storage vehicle status to active
      const localMatch = db.getVehicles().find(v => v.id === vehicle.id);
      if (localMatch) {
        db.updateVehicle(vehicle.id, {
          status: 'active',
          expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
        });
      }
    } catch (err: any) {
      console.error('Payment renewal verification failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to verify renewal payment signature with backend.');
    }
    
    // Invalidate queries so that the updated list is automatically fetched from the backend
    queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list() });
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.owner.stats() });
    
    setProcessingVehicleId(null);
  }, [queryClient]);

  // Print/Download Invoice PDF Generator
  const printInvoice = useCallback(async (invoice: Invoice) => {
    const toastId = toast.loading(`Generating invoice PDF for ${invoice.invoiceNumber}...`);
    try {
      await downloadInvoice(invoice.id, invoice.invoiceNumber, true);
      toast.success(`Invoice PDF downloaded successfully!`, { id: toastId });
    } catch (err: any) {
      console.error('Invoice download failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to download invoice PDF.', { id: toastId });
    }
  }, []);

  // Handle invoice actions callbacks
  const handleDownloadInvoice = useCallback((invoice: Invoice) => {
    printInvoice(invoice);
    toast.success(`Initiated invoice print/download for ${invoice.invoiceNumber}`);
  }, [printInvoice]);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewOpen(true);
  }, []);

  const handleRefundRequestTrigger = useCallback((invoice: Invoice) => {
    setRefundingInvoice(invoice);
    setRefundOpen(true);
  }, []);

  // Confirm Refund request submit action
  const handleConfirmRefund = useCallback(async () => {
    if (!refundingInvoice) return;
    setSubmittingRefund(true);

    try {
      await requestRefundMutation.mutateAsync(refundingInvoice.id);
      toast.success(`Refund requested for invoice ${refundingInvoice.invoiceNumber}. Funds will credit within 5-7 days.`);
    } catch (err: any) {
      toast.error(err.message || 'Could not submit refund. Please retry.');
    } finally {
      setSubmittingRefund(false);
      setRefundOpen(false);
      setRefundingInvoice(null);
    }
  }, [refundingInvoice, requestRefundMutation]);

  // Compute pagination breakdown
  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return invoices.slice(start, start + pageSize);
  }, [invoices, page]);

  const totalPages = Math.ceil(invoices.length / pageSize);

  return (
    <div className="w-full space-y-8 text-left py-4 select-none font-sans">
      <PageHeader
        title="Billing & Invoices"
        description="Manage your VaahanSafe active decal subscriptions, renewals, and download payment history reports."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Billing' }]}
      />

      {/* Pricing Upgrade Cards Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Available Subscription Plans</h2>
            <p className="text-xs text-zinc-500">Choose or upgrade your decals protection package tier.</p>
          </div>
          
          {/* Switcher toggle Monthly/Yearly */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-secondary/30 dark:bg-[#0c0c0e]">
            <Button
              variant={billingCycle === 'monthly' ? 'secondary' : 'ghost'}
              className="h-6 px-3 text-[10px] uppercase font-bold tracking-wider rounded-lg"
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'secondary' : 'ghost'}
              className="h-6 px-3 text-[10px] uppercase font-bold tracking-wider rounded-lg"
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly (Save ~15%)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              selected={selectedPlanId === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>

      {/* Grid: Active Plans & Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2">
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md h-full flex flex-col justify-between">
            <div>
              <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Active Coverage List</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Decal sticker protection packages currently active on your dashboard fleet.</CardDescription>
                </div>
                <HugeiconsIcon icon={CreditCardIcon} className="size-5 text-primary" />
              </CardHeader>
              <CardContent className="p-0">
                {vehicles.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={<HugeiconsIcon icon={CreditCardIcon} className="size-6 text-primary" />}
                      title="No Registered Stickers"
                      description="You don't have any active windshield protection decal sticker plans linked to your fleet yet."
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-900">
                    {vehicles.map((v) => {
                      const cost = v.tier === 'Family Pro' ? 899 : v.tier === 'Shield' ? 499 : 299;
                      const isExpired = new Date(v.expiryDate) < new Date();
                      const isProcessing = processingVehicleId === v.id;
                      return (
                        <div key={v.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="w-full sm:w-auto flex flex-col gap-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{v.licensePlate}</span>
                              <span className={cn(
                                'text-[9px] uppercase font-black px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-800',
                                isExpired 
                                  ? 'bg-red-500/10 text-red-500 border-red-500/15'
                                  : 'bg-primary/10 text-primary border-primary/20'
                              )}>
                                {v.tier} Protection
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-muted-foreground" />
                              Decal Expiry Date: <strong className={isExpired ? "text-red-500 dark:text-red-400" : "text-zinc-700 dark:text-zinc-400"}>{v.expiryDate}</strong>
                            </p>
                          </div>
                          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border pt-3 sm:pt-0 mt-1 sm:mt-0">
                            <span className="text-xs font-black text-zinc-900 dark:text-white">₹{cost}/yr</span>
                            <div className="w-36">
                              <RazorpayCheckoutButton
                                createOrder={() => handleCreateOrder(v)}
                                verifyPayment={(payload) => handleVerifyPayment(v, payload)}
                                disabled={isProcessing}
                              >
                                Renew Plan
                              </RazorpayCheckoutButton>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Right side: Payment details policy card */}
        <div className="md:col-span-1">
          <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-[#0c0c0e] dark:to-[#0f0b15] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
            <div>
              <CardHeader className="p-0 pb-3 border-b border-zinc-250 dark:border-zinc-900 mb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={HelpCircleIcon} className="size-4 text-primary" />
                  Billing Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wide block">Refund Window</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    All payment transactions qualify for full refunds within 14 days of sticker registration if the decals have not been shipped. Wiped decals revoke protection.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wide block">Automatic Renewals</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    By default, subscriptions do not auto-renew. Renewal confirmations trigger standard Razorpay secure checkouts.
                  </p>
                </div>
              </CardContent>
            </div>
            <div className="text-[8px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 border-t border-zinc-250 dark:border-zinc-900/60 pt-4 mt-6 uppercase tracking-widest">
              SSL SECURED GATEWAY CONNECTIONS ACTIVE.
            </div>
          </Card>
        </div>
      </div>

      {/* Payment History Invoices Table component */}
      <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
        <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Payment Invoices & Receipts</CardTitle>
            <CardDescription className="text-xs text-zinc-500">History log of payment collections, refunds, and credits.</CardDescription>
          </div>
          <HugeiconsIcon icon={CreditCardIcon} className="size-5 text-primary" />
        </CardHeader>
        
        <CardContent className="p-0">
          <InvoiceTable
            data={paginatedInvoices}
            loading={loading}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            onDownload={handleDownloadInvoice}
            onView={handleViewInvoice}
            onRefundRequest={handleRefundRequestTrigger}
          />
        </CardContent>
      </Card>

      {/* Refund request dialogue confirmation details */}
      {refundingInvoice && (
        <RefundRequestDialog
          invoice={refundingInvoice}
          open={refundOpen}
          loading={submittingRefund}
          onConfirm={handleConfirmRefund}
          onCancel={() => {
            setRefundOpen(false);
            setRefundingInvoice(null);
          }}
        />
      )}

      {/* Interactive Invoice Details View Dialog */}
      {selectedInvoice && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="sm:max-w-[500px] p-6 bg-zinc-950 border border-zinc-800 text-white rounded-xl">
            <DialogHeader className="border-b border-zinc-800 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-base font-extrabold font-serif text-white tracking-tight">
                    Invoice Details
                  </DialogTitle>
                  <DialogDescription className="text-[10px] text-zinc-400 mt-1">
                    Invoice ID: <span className="font-mono text-zinc-300 font-bold">{selectedInvoice.invoiceNumber}</span>
                  </DialogDescription>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md",
                    selectedInvoice.status === 'paid' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
                    selectedInvoice.status === 'failed' && "bg-rose-500/10 text-rose-400 border border-rose-500/25",
                    selectedInvoice.status === 'pending' && "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  )}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4 text-[11px]">
              {/* Billing details grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <p className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Invoice Date</p>
                  <p className="text-zinc-200 mt-0.5 font-medium">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Vehicle License Plate</p>
                  <p className="text-zinc-200 mt-0.5 font-bold font-mono">{selectedInvoice.vehiclePlate}</p>
                </div>
              </div>

              {/* Items listing table */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between items-center text-zinc-400 font-bold text-[8px] uppercase tracking-wider pb-1.5 border-b border-zinc-900">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between items-start py-1">
                  <div>
                    <p className="font-bold text-zinc-200">{selectedInvoice.planName}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Annual Sticker Decal Subscription & mask call bridge</p>
                  </div>
                  <span className="font-bold text-zinc-200">₹{selectedInvoice.amount}</span>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(selectedInvoice.amount / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{(selectedInvoice.amount - (selectedInvoice.amount / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xs pt-2 border-t border-zinc-900">
                  <span>Total Amount Paid</span>
                  <span className="text-brand font-serif font-extrabold">₹{selectedInvoice.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <Button
                onClick={() => {
                  printInvoice(selectedInvoice);
                }}
                className="flex-1 h-9 bg-[#ff7a00] hover:bg-[#ff8f24] text-zinc-950 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Print / Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setViewOpen(false);
                  setSelectedInvoice(null);
                }}
                className="h-9 px-5 rounded-lg border-zinc-800 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, type Vehicle, type ScanLog } from '@/services/db';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDashboardStats } from '@/features/dashboard/dashboard.hooks';
import { useOwnerNotifications, useOwnerVehicles } from '@/features/owners';
import { StatCard } from '@/components/charts/StatCard';
import { ScansLineChart } from '@/components/charts/ScansLineChart';
import { DeliveryRateBarChart } from '@/components/charts/DeliveryRateBarChart';
import { HeatmapCalendar } from '@/components/charts/HeatmapCalendar';
import type { ScanMetric, HeatmapDay } from '@/types/charts';
import { 
  Car01Icon, 
  Shield01Icon, 
  AlertCircleIcon, 
  Alert01Icon, 
  Cancel01Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  Notification03Icon,
  SmartPhone01Icon,
  Location01Icon,
  HeartbreakIcon,
  CheckmarkCircle02Icon,
  QrCodeIcon,
  Logout01Icon
} from '@hugeicons/core-free-icons';

interface DashboardHomeProps {
  ownerPhone: string;
  onLogout: () => void;
  onRegisterNew: () => void;
}

const ConcentricRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-[1.3] md:scale-110 z-0">
    <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Background glow circle */}
      <circle cx="50" cy="50" r="45" fill="url(#ringGlow)" />
      
      {/* Outer Ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#ff6b00"
        strokeWidth="0.25"
        strokeOpacity="0.15"
        strokeDasharray="4 4"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: '50px 50px' }}
      />
      
      {/* Middle Ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke="#ff6b00"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: '50px 50px' }}
      />
      
      {/* Inner Ring */}
      <circle
        cx="50"
        cy="50"
        r="24"
        fill="none"
        stroke="#ff6b00"
        strokeWidth="0.75"
        strokeOpacity="0.5"
        strokeDasharray="2 2"
      />
    </svg>
  </div>
);

const StepConnector = () => (
  <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-8 h-4 hidden sm:block z-20 pointer-events-none">
    <svg className="w-full h-full overflow-visible" viewBox="0 0 32 16" fill="none">
      {/* Background track line */}
      <path
        d="M0 8h24"
        stroke="#27272a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Animated flowing dashed line */}
      <motion.path
        d="M0 8h24"
        stroke="url(#arrowGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 6"
        animate={{ strokeDashoffset: [0, -12] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      {/* Arrow head */}
      <path
        d="M20 4l4 4-4 4"
        stroke="#ff6b00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#ff6b00" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export default function DashboardHome({ ownerPhone, onLogout, onRegisterNew }: DashboardHomeProps) {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [_logs, setLogs] = useState<ScanLog[]>([]);
  
  const { owner } = useAuthStore();
  const displayName = owner?.full_name || owner?.name || ownerPhone || 'Owner';
  const firstName = displayName.trim().split(/\s+/)[0];
  
  const { data: notifications = [] } = useOwnerNotifications();
  const unreadCount = useMemo(() => notifications.filter((n: any) => n.unread).length, [notifications]);
  const { data: realVehicles = [], isLoading: loadingRealVehicles } = useOwnerVehicles();

  // Custom Hook to manage stats queries
  const { data: stats, isLoading, refetch } = useDashboardStats(ownerPhone);

  // Scans over time data directly from real backend dailyScans
  const scansLineData = useMemo(() => {
    if (stats?.dailyScans && stats.dailyScans.length > 0) {
      return stats.dailyScans.map(d => ({
        date: d.date,
        scans: d.scans,
        parking: d.parking,
        emergency: d.emergency
      }));
    }
    const end = new Date();
    const result: ScanMetric[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(end.getDate() - i);
      result.push({
        date: d.toISOString().split('T')[0],
        scans: 0,
        parking: 0,
        emergency: 0
      });
    }
    return result;
  }, [stats?.dailyScans]);

  // Delivery rates per channel directly from real backend
  const deliveryBarData = useMemo(() => {
    if (stats?.deliveryRates && stats.deliveryRates.length > 0) {
      return stats.deliveryRates;
    }
    return [
      { channel: 'WhatsApp' as const, success: 0, failure: 0, pending: 0 },
      { channel: 'Masked Call' as const, success: 0, failure: 0, pending: 0 },
      { channel: 'SMS' as const, success: 0, failure: 0, pending: 0 }
    ];
  }, [stats?.deliveryRates]);

  // Heatmap calendar points over past year directly from real backend
  const heatmapDays = useMemo(() => {
    if (stats?.heatmapDays && stats.heatmapDays.length > 0) {
      return stats.heatmapDays;
    }
    const end = new Date();
    const current = new Date();
    current.setDate(end.getDate() - 364);
    const result: HeatmapDay[] = [];
    while (current <= end) {
      result.push({
        date: current.toISOString().split('T')[0],
        count: 0
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [stats?.heatmapDays]);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContacts, setEditContacts] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editAllergies, setEditAllergies] = useState<string>('');
  const [editBlood, setEditBlood] = useState<string>('');

  useEffect(() => {
    loadOwnerData();
  }, [ownerPhone, realVehicles, loadingRealVehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      setLogs(db.getLogs(selectedVehicle.id));
    }
  }, [selectedVehicle]);

  const loadOwnerData = () => {
    // Clean up any duplicate local storage vehicles if a synced UUID version already exists
    const allVehicles = db.getVehicles();
    let hasMismatches = false;
    const cleanVehicles = allVehicles.filter(v => {
      if (v.id.startsWith('vehicle-')) {
        const cleanPlate = v.licensePlate.replace(/[-\s]+/g, '').toUpperCase();
        const hasUUIDVersion = allVehicles.some(other => 
          !other.id.startsWith('vehicle-') && 
          other.licensePlate.replace(/[-\s]+/g, '').toUpperCase() === cleanPlate
        );
        if (hasUUIDVersion) {
          hasMismatches = true;
          return false; // delete duplicate
        }
      }
      return true;
    });

    if (hasMismatches) {
      localStorage.setItem('vs_vehicles', JSON.stringify(cleanVehicles));
    }

    const localList = db.getVehicles().filter(v => v.ownerPhone === ownerPhone);
    
    let filteredList = localList;
    if (!loadingRealVehicles) {
      if (realVehicles && realVehicles.length > 0) {
        const realPlates = new Set(realVehicles.map((v: any) => v.vehicle_number.replace(/[-\s]+/g, '').toUpperCase()));
        
        // Filter local storage vehicles to only show those that exist on the backend
        filteredList = localList.filter(v => realPlates.has(v.licensePlate.replace(/[-\s]+/g, '').toUpperCase()));
        
        const localPlates = new Set(localList.map(v => v.licensePlate.replace(/[-\s]+/g, '').toUpperCase()));
        
        for (const rv of realVehicles) {
          const rvCleanPlate = rv.vehicle_number.replace(/[-\s]+/g, '').toUpperCase();
          if (!localPlates.has(rvCleanPlate)) {
            // Add sync placeholder if not in local storage
            const newV = db.registerVehicle({
              licensePlate: rv.vehicle_number,
              ownerName: displayName,
              ownerPhone: ownerPhone,
              bloodGroup: '',
              allergies: '',
              emergencyContacts: [ownerPhone],
              medicalNotes: 'Sync placeholder',
              tier: rv.tier === 'premium' ? 'Shield' : rv.tier === 'basic' ? 'Basic' : 'Shield',
              activeAlertsPaused: false
            });
            // Update local ID to be the real backend ID (UUID)
            db.updateVehicle(newV.id, {
              id: rv.id,
              stickerStatus: (rv.subscription_status === 'pending' ? 'Processing' : rv.sticker_dispatched_at ? 'Shipped' : 'Delivered') as any,
              expiryDate: rv.renewal_date || newV.expiryDate
            });
            filteredList.push(db.getVehicleById(rv.id)!);
          } else {
            // Update mismatched IDs to use the backend UUID
            const localMatch = localList.find(v => v.licensePlate.replace(/[-\s]+/g, '').toUpperCase() === rvCleanPlate);
            if (localMatch && localMatch.id !== rv.id) {
              db.updateVehicle(localMatch.id, {
                id: rv.id,
                stickerStatus: (rv.subscription_status === 'pending' ? 'Processing' : rv.sticker_dispatched_at ? 'Shipped' : 'Delivered') as any,
                expiryDate: rv.renewal_date || localMatch.expiryDate
              });
              localMatch.id = rv.id;
              localMatch.stickerStatus = (rv.subscription_status === 'pending' ? 'Processing' : rv.sticker_dispatched_at ? 'Shipped' : 'Delivered') as any;
              localMatch.expiryDate = rv.renewal_date || localMatch.expiryDate;
            }
          }
        }
      } else {
        // No vehicles on backend means none should show on front
        filteredList = [];
      }
    }
    
    setVehicles(filteredList);
    if (filteredList.length > 0) {
      setSelectedVehicle(prev => {
        if (prev && filteredList.some(v => v.id === prev.id)) {
          return prev;
        }
        return filteredList[0];
      });
    } else {
      setSelectedVehicle(null);
      setLogs([]);
    }
  };

  // Listen to live scanning updates and refresh cache statistics dynamically
  useEffect(() => {
    const handleNewLog = (e: Event) => {
      const customEvent = e as CustomEvent<ScanLog>;
      if (selectedVehicle && customEvent.detail.vehicleId === selectedVehicle.id) {
        setLogs(prev => [customEvent.detail, ...prev]);
        refetch(); // force stats query update
      }
    };
    window.addEventListener('vs_new_log', handleNewLog);
    return () => window.removeEventListener('vs_new_log', handleNewLog);
  }, [selectedVehicle, refetch]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const contactsList = editContacts.split('\n').map(c => c.trim()).filter(c => c !== '');
    if (contactsList.length === 0) {
      alert('Please provide at least one emergency contact.');
      return;
    }

    const updated = db.updateVehicle(selectedVehicle.id, {
      bloodGroup: editBlood,
      allergies: editAllergies,
      medicalNotes: editNotes,
      emergencyContacts: contactsList
    });

    setSelectedVehicle(updated);
    setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? updated : v));
    setShowEditModal(false);
    alert('Vehicle profile updated successfully!');
    refetch();
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  /* ──────────────────────────────────────────── Feature items for the "Why VaahanSafe?" panel ──── */
  const features = [
    { icon: Notification03Icon, title: 'Instant Emergency Alerts', desc: 'Get notified within seconds' },
    { icon: SmartPhone01Icon, title: 'Masked Calling', desc: 'Stay private, stay safe' },
    { icon: Location01Icon, title: 'SOS Coordinates', desc: 'Share exact location' },
    { icon: HeartbreakIcon, title: 'Medical Information', desc: 'Share critical info instantly' },
  ];

  /* ──────────────────────────────────────────── How It Works steps ──────────────────────────── */
  const steps = [
    { num: '01', icon: Car01Icon, title: 'Input Details', desc: 'Enter your vehicle number and emergency contact information.' },
    { num: '02', icon: QrCodeIcon, title: 'Paste Sticker', desc: 'Attach your QR sticker to the vehicle windshield.' },
    { num: '03', icon: Notification03Icon, title: 'Get Alerts', desc: 'Receive instant alerts and emergency notifications.' },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* ─── 1. HEADER BAR ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left side: Greeting + Mobile utilities */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-serif">
            {getGreeting()}, {firstName} <span className="inline-block">👋</span>
          </h1>

          {/* Mobile utilities: Bell + Logout (rendered side-by-side inline with greeting) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Notification bell */}
            <button 
              onClick={() => navigate('/dashboard/notifications')}
              className="relative h-9.5 w-9.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#13151d] hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 text-zinc-500 dark:text-zinc-400"
              title="Notification Centre"
            >
              <HugeiconsIcon icon={Notification03Icon} className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-[8px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Logout icon-only */}
            <Button 
              onClick={onLogout}
              variant="outline"
              className="h-9.5 w-9.5 p-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-[#13151d]/40 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 transition-all cursor-pointer rounded-lg flex items-center justify-center"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4" />
            </Button>
          </div>
        </div>

        {/* Right side: Stretches full-width on mobile to hold primary REGISTER QR */}
        <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <Button 
            onClick={onRegisterNew}
            className="w-full md:w-auto h-9.5 bg-[#ff7a00] hover:bg-[#e06b00] font-extrabold text-white text-xs shadow-sm transition-all cursor-pointer px-5 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            REGISTER QR
          </Button>

          {/* Desktop-only utilities (hidden on mobile since they render in the top row) */}
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => navigate('/dashboard/notifications')}
              className="relative h-9.5 w-9.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#13151d] hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 text-zinc-500 dark:text-zinc-400"
              title="Notification Centre"
            >
              <HugeiconsIcon icon={Notification03Icon} className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-[8px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <Button 
              onClick={onLogout}
              variant="outline"
              className="h-9.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-[#13151d]/40 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 text-xs transition-all cursor-pointer px-4 rounded-lg text-center"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 2. RENEWAL BANNER ─── */}
      {stats && stats.expiringSoonCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/[0.02] to-transparent border border-amber-500/20 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute -left-6 -top-6 w-16 h-16 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0 mt-0.5">
              <HugeiconsIcon icon={Alert01Icon} className="size-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide">Sticker Renewal Required</h4>
              <p className="text-[11px] text-zinc-400 leading-normal max-w-2xl">
                You have {stats.expiringSoonCount} sticker{stats.expiringSoonCount > 1 ? 's' : ''} expiring within 30 days. Renew now to maintain coverage.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/billing')}
            className="bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 text-[10px] tracking-wider cursor-pointer shadow-sm rounded-lg shrink-0 h-8 px-4 uppercase"
          >
            Renew Now
          </Button>
        </div>
      )}

      {((stats?.totalVehicles ?? 0) === 0 && realVehicles.length === 0) ? (
        /* ─── 3. EMPTY ONBOARDING STATE ─── */
        <div className="space-y-6">
          {/* Stats Row — Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Vehicles Registered"
              value={0}
              trend={0}
              icon={<HugeiconsIcon icon={Car01Icon} className="size-5" />}
              sparklineData={[0, 0, 0, 0, 0, 0, 0]}
              loading={isLoading}
            />
            <StatCard
              title="QR Stickers Linked"
              value={0}
              trend={0}
              icon={<HugeiconsIcon icon={QrCodeIcon} className="size-5" />}
              sparklineData={[0, 0, 0, 0, 0, 0, 0]}
              loading={isLoading}
            />
            <StatCard
              title="Active Alerts"
              value={0}
              trend={0}
              icon={<HugeiconsIcon icon={AlertCircleIcon} className="size-5" />}
              sparklineData={[0, 0, 0, 0, 0, 0, 0]}
              loading={isLoading}
            />
            <StatCard
              title="Protection Status"
              value={0}
              trend={0}
              icon={<HugeiconsIcon icon={Shield01Icon} className="size-5" />}
              sparklineData={[0, 0, 0, 0, 0, 0, 0]}
              suffix="%"
              loading={isLoading}
            />
          </div>

          {/* Hero Get Started Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Main hero panel */}
            <div className="lg:col-span-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 rounded-lg overflow-hidden min-h-[380px] md:min-h-[340px] grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
              {/* Left Column: Text Content */}
              <div className="md:col-span-7 flex flex-col justify-between z-10 text-left">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold uppercase tracking-widest mb-5">
                    <span>✨</span> Get Started
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight max-w-md font-serif">
                    Link Your QR Sticker<br />and Stay <span className="text-[#ff7a00]">Protected</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed max-w-sm">
                    Register your vehicle and link your QR sticker to enable masked calling, SOS routing, and instant medical alerts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <Button 
                    onClick={onRegisterNew}
                    className="h-10 bg-[#ff7a00] hover:bg-[#e06b00] font-extrabold text-white text-xs shadow-lg cursor-pointer px-6 rounded-lg uppercase tracking-widest flex items-center gap-2"
                  >
                    Link Sticker Now
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                  </Button>
                  <button className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium">
                    Learn how it works
                    <span className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-zinc-500 dark:text-zinc-400" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column: Car Illustration & Concentric rings */}
              <div className="md:col-span-5 relative flex items-center justify-center min-h-[220px] md:min-h-0 pointer-events-none select-none">
                {/* Concentric animated SVG rings */}
                <ConcentricRings />

                {/* Floating VAAHANSAFE text badge */}
                <div className="absolute top-[5%] md:top-[12%] left-[10%] bg-zinc-100 dark:bg-[#1a1c24]/90 border border-zinc-200 dark:border-zinc-700/35 backdrop-blur-sm rounded-full px-3 py-1 text-[8px] font-bold text-zinc-800 dark:text-white uppercase tracking-widest shadow-lg z-20">
                  VAAHANSAFE
                </div>

                {/* QR Badge Circle */}
                <div className="absolute right-[12%] top-[38%] w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#ff8c00] to-[#ff5100] p-0.5 shadow-[0_0_35px_rgba(255,107,0,0.25)] flex items-center justify-center text-white z-25">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#0d0e14] flex items-center justify-center">
                    <HugeiconsIcon icon={QrCodeIcon} className="size-6 text-[#ff7a00]" />
                  </div>
                </div>

                {/* SUV Car Image */}
                <img 
                  src="/images/car-hero.png" 
                  alt="Protected vehicle" 
                  className="absolute bottom-[-10px] md:bottom-[-16px] w-[95%] max-w-[300px] md:max-w-none md:w-[110%] h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-10"
                  draggable={false}
                />
              </div>
            </div>

            {/* Why VaahanSafe sidebar panel */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mb-6 font-serif">Why VaahanSafe?</h3>
                <div className="space-y-5">
                  {features.map((f) => (
                    <div key={f.title} className="flex items-start gap-3.5">
                      <div className="h-9 w-9 rounded-full bg-[#ff6b00]/5 border border-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                        <HugeiconsIcon icon={f.icon} className="size-4 text-brand" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-tight">{f.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety priority footer */}
              <div className="flex items-start gap-3.5 mt-6 pt-5 border-t border-zinc-200 dark:border-[#1a1c24]">
                <div className="h-9 w-9 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-tight">Your safety, our priority</h4>
                  <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">24/7 protection for you and your loved ones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works row */}
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map((step, i) => (
                <div key={step.num} className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-5 flex items-start gap-4 relative">
                  <div className="h-12 w-12 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={step.icon} className="size-[22px] text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-brand font-bold text-sm">{step.num}</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{step.title}</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                  {/* Dotted connector */}
                  {i < steps.length - 1 && <StepConnector />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─── 4. ACTIVE DASHBOARD (with vehicles registered) ─── */
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Vehicles Registered"
              value={Math.max(stats?.totalVehicles ?? 0, realVehicles.length)}
              previousValue={stats?.vehiclesPrev ?? 0}
              trend={stats?.vehiclesTrend ?? 0}
              icon={<HugeiconsIcon icon={Car01Icon} className="size-5 text-primary" />}
              sparklineData={stats?.dailyScans?.map(d => d.scans) ?? [0, 0, 0, 0, 0, 0, 0]}
              loading={isLoading}
            />
            <StatCard
              title="QR Stickers Linked"
              value={stats?.linkedStickers ?? realVehicles.filter(v => v.qr_code_id).length}
              previousValue={stats?.stickersPrev ?? 0}
              trend={stats?.stickersTrend ?? 0}
              icon={<HugeiconsIcon icon={QrCodeIcon} className="size-5 text-primary" />}
              sparklineData={stats?.dailyScans?.map(d => d.scans) ?? [0, 0, 0, 0, 0, 0, 0]}
              loading={isLoading}
            />
            <StatCard
              title="Active Alerts"
              value={stats?.totalScans ?? 0}
              previousValue={stats?.alertsPrev ?? 0}
              trend={stats?.alertsTrend ?? 0}
              icon={<HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-primary" />}
              sparklineData={stats?.dailyScans?.map(d => d.emergency) ?? [0, 0, 0, 0, 0, 0, 0]}
              loading={isLoading}
            />
            <StatCard
              title="Protection Status"
              value={stats?.protectionStatusPercentage ?? 0}
              previousValue={stats?.protectionStatusPercentage ?? 0}
              trend={stats?.protectionTrend ?? 0}
              icon={<HugeiconsIcon icon={Shield01Icon} className="size-5 text-primary" />}
              sparklineData={stats?.dailyScans?.map(d => d.scans) ?? [0, 0, 0, 0, 0, 0, 0]}
              suffix="%"
              loading={isLoading}
            />
          </div>

          {/* Hero Get Started Section (same layout as onboarding, shown as a helpful CTA) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Main hero panel */}
            <div className="lg:col-span-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 rounded-lg overflow-hidden min-h-[380px] md:min-h-[340px] grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
              {/* Left Column: Text Content */}
              <div className="md:col-span-7 flex flex-col justify-between z-10 text-left">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold uppercase tracking-widest mb-5">
                    <span>✨</span> Get Started
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight max-w-md font-serif">
                    Link Your QR Sticker<br />and Stay <span className="text-[#ff7a00]">Protected</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed max-w-sm">
                    Register your vehicle and link your QR sticker to enable masked calling, SOS routing, and instant medical alerts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <Button 
                    onClick={onRegisterNew}
                    className="h-10 bg-[#ff7a00] hover:bg-[#e06b00] font-extrabold text-white text-xs shadow-lg cursor-pointer px-6 rounded-lg uppercase tracking-widest flex items-center gap-2"
                  >
                    Link Sticker Now
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                  </Button>
                  <button
                    onClick={() => navigate('/how-it-works')}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    Learn how it works
                    <span className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-zinc-500 dark:text-zinc-400" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column: Car Illustration & Concentric rings */}
              <div className="md:col-span-5 relative flex items-center justify-center min-h-[220px] md:min-h-0 pointer-events-none select-none">
                {/* Concentric animated SVG rings */}
                <ConcentricRings />

                {/* Floating VAAHANSAFE text badge */}
                <div className="absolute top-[5%] md:top-[12%] left-[10%] bg-zinc-100 dark:bg-[#1a1c24]/90 border border-zinc-200 dark:border-zinc-700/35 backdrop-blur-sm rounded-full px-3 py-1 text-[8px] font-bold text-zinc-800 dark:text-white uppercase tracking-widest shadow-lg z-20">
                  VAAHANSAFE
                </div>

                {/* QR Badge Circle */}
                <div className="absolute right-[12%] top-[38%] w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#ff8c00] to-[#ff5100] p-0.5 shadow-[0_0_35px_rgba(255,107,0,0.25)] flex items-center justify-center text-white z-25">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#0d0e14] flex items-center justify-center">
                    <HugeiconsIcon icon={QrCodeIcon} className="size-6 text-[#ff7a00]" />
                  </div>
                </div>

                {/* SUV Car Image */}
                <img 
                  src="/images/car-hero.png" 
                  alt="Protected vehicle" 
                  className="absolute bottom-[-10px] md:bottom-[-16px] w-[95%] max-w-[300px] md:max-w-none md:w-[110%] h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-10"
                  draggable={false}
                />
              </div>
            </div>

            {/* Why VaahanSafe sidebar */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mb-6 font-serif">Why VaahanSafe?</h3>
                <div className="space-y-5">
                  {features.map((f) => (
                    <div key={f.title} className="flex items-start gap-3.5">
                      <div className="h-9 w-9 rounded-full bg-[#ff6b00]/5 border border-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                        <HugeiconsIcon icon={f.icon} className="size-4 text-brand" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-tight">{f.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3.5 mt-6 pt-5 border-t border-zinc-200 dark:border-[#1a1c24]">
                <div className="h-9 w-9 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-tight">Your safety, our priority</h4>
                  <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">24/7 protection for you and your loved ones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics & Charts Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScansLineChart data={scansLineData} loading={isLoading} />
              <DeliveryRateBarChart data={deliveryBarData} loading={isLoading} />
            </div>
            <HeatmapCalendar data={heatmapDays} loading={isLoading} />
          </div>

          {/* How It Works row */}
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
              {steps.map((step, i) => (
                <div key={step.num} className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-5 flex items-start gap-4 relative">
                  <div className="h-12 w-12 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={step.icon} className="size-[22px] text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-brand font-bold text-sm">{step.num}</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{step.title}</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                  {/* Dotted connector */}
                  {i < steps.length - 1 && <StepConnector />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT PROFILE MODAL ─── */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 backdrop-blur-xl max-w-md w-full p-6 space-y-4 shadow-2xl rounded-lg">
            <CardHeader className="p-0 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="font-bold text-zinc-900 dark:text-white text-base">Edit Vehicle Profile</CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">{selectedVehicle.licensePlate}</CardDescription>
              </div>
              <Button 
                onClick={() => setShowEditModal(false)} 
                variant="ghost" 
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-7 w-7 p-0 cursor-pointer flex items-center justify-center rounded-lg"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Blood Group</label>
                    <Select value={editBlood} onValueChange={v => setEditBlood(v || '')}>
                      <SelectTrigger className="h-9 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Drug Allergies</label>
                    <Input 
                      type="text" 
                      value={editAllergies}
                      onChange={e => setEditAllergies(e.target.value)}
                      className="h-9 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-[#5c5d66] tracking-wider font-mono">Medical Notes</label>
                  <Textarea 
                    rows={2}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-[#5c5d66] tracking-wider font-mono">Emergency Contacts (one per line)</label>
                  <Textarea 
                    rows={3}
                    value={editContacts}
                    onChange={e => setEditContacts(e.target.value)}
                    placeholder="e.g. +919876543211 (Spouse)"
                    className="font-mono text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 bg-[#ff7a00] hover:bg-[#e06b00] font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer rounded-lg font-mono"
                >
                  Save Profile Updates
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

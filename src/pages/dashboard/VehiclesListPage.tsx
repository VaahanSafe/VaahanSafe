import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vehicle } from '@/services/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonBlock } from '@/components/shared/SkeletonBlock';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { 
  Car01Icon, 
  PlusSignIcon, 
  Search01Icon, 
  QrCodeIcon, 
  Download02Icon, 
  Calendar03Icon, 
  UserGroupIcon, 
  AlertCircleIcon,
  FilterIcon
} from '@hugeicons/core-free-icons';
import { useOwnerVehicles } from '@/features/owners/owners.hooks';
import { downloadVehicleSticker } from '@/features/vehicles/vehicles.api';

type FilterStatus = 'all' | 'active' | 'pending' | 'expired';
type TierFilter = 'all' | 'Basic' | 'Shield' | 'Family Pro';
type StickerFilter = 'all' | 'Processing' | 'Shipped' | 'Delivered';

export default function VehiclesListPage() {
  const navigate = useNavigate();
  const { data: vehicleList, isLoading: loading } = useOwnerVehicles();
  
  // Map API vehicle model to page representation
  const vehicles: Vehicle[] = (vehicleList || []).map((v: any) => ({
    id: v.id,
    licensePlate: v.vehicle_number,
    ownerName: 'Vehicle Owner',
    ownerPhone: '',
    bloodGroup: '',
    allergies: '',
    emergencyContacts: (v.emergency_contacts || []).map((c: any) => `${c.phone} (${c.relationship})`),
    medicalNotes: '',
    status: v.subscription_status,
    stickerStatus: (v.subscription_status === 'pending' ? 'Processing' : v.sticker_dispatched_at ? 'Shipped' : 'Delivered') as any,
    subscriptionStatus: v.subscription_status || 'active',
    tier: (v.tier || 'Shield') as any,
    activeAlertsPaused: false,
    expiryDate: v.renewal_date || '2026-12-31',
  }));

  const [searchQuery, setSearchQuery] = useState('');
  
  // Active Filter states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [stickerFilter, setStickerFilter] = useState<StickerFilter>('all');
  
  // Pending filter states (drafts within sheet/drawer before hitting "Apply")
  const [tempStatus, setTempStatus] = useState<FilterStatus>('all');
  const [tempTier, setTempTier] = useState<TierFilter>('all');
  const [tempSticker, setTempSticker] = useState<StickerFilter>('all');
  
  // Sheet/Drawer open state
  const [openFilter, setOpenFilter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Download confirmation states
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Monitor screen size for mobile responsive drawer switch
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync temp filters when opening sheet/drawer
  useEffect(() => {
    if (openFilter) {
      setTempStatus(statusFilter);
      setTempTier(tierFilter);
      setTempSticker(stickerFilter);
    }
  }, [openFilter, statusFilter, tierFilter, stickerFilter]);

  // Determine vehicle status categories helper
  const getVehicleStatus = (vehicle: Vehicle): 'active' | 'pending' | 'expired' => {
    const isExpired = new Date(vehicle.expiryDate) < new Date();
    if (isExpired) return 'expired';
    
    if ((vehicle as any).subscriptionStatus === 'pending') return 'pending';
    
    return 'active';
  };

  // Helper to calculate days remaining
  const getDaysRemaining = (expiryDateStr: string): number => {
    const diffTime = new Date(expiryDateStr).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and search computation
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tier.toLowerCase().includes(searchQuery.toLowerCase());
      
    const status = getVehicleStatus(v);
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesTier = tierFilter === 'all' || v.tier === tierFilter;
    const matchesSticker = stickerFilter === 'all' || v.stickerStatus === stickerFilter;
    
    return matchesSearch && matchesStatus && matchesTier && matchesSticker;
  });

  // Pagination logic
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApplyFilters = () => {
    setStatusFilter(tempStatus);
    setTierFilter(tempTier);
    setStickerFilter(tempSticker);
    setCurrentPage(1);
    setOpenFilter(false);
  };

  const handleResetFilters = () => {
    setTempStatus('all');
    setTempTier('all');
    setTempSticker('all');
    setStatusFilter('all');
    setTierFilter('all');
    setStickerFilter('all');
    setCurrentPage(1);
    setOpenFilter(false);
  };

  const handleDownloadSticker = (v: Vehicle) => {
    setSelectedVehicle(v);
    setShowDownloadAlert(true);
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || tierFilter !== 'all' || stickerFilter !== 'all';

  // Render the filter options body
  const renderFilterOptions = () => (
    <div className="space-y-5 py-2 text-left">
      {/* 1. Status Filter */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Activation Status</h4>
        <div className="space-y-1">
          {(['all', 'active', 'pending', 'expired'] as FilterStatus[]).map((status) => {
            const isSel = tempStatus === status;
            const statusLabels = { all: 'Show All Statuses', active: 'Active Coverage', pending: 'Pending Sticker', expired: 'Expired Coverage' };
            const statusColors = {
              all: 'bg-zinc-500',
              active: 'bg-emerald-500',
              pending: 'bg-amber-500',
              expired: 'bg-red-500'
            };
            return (
              <button
                key={status}
                onClick={() => setTempStatus(status)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer group ${
                  isSel 
                    ? 'bg-zinc-900/60 border-zinc-800/80 text-white'
                    : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusColors[status]}`} />
                  <span className="text-xs font-semibold">{statusLabels[status]}</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                  isSel ? 'border-[#ff6b00] bg-[#ff6b00]' : 'border-zinc-800 group-hover:border-zinc-700'
                }`}>
                  {isSel && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-zinc-800/60 my-4" />

      {/* 2. Protection Tier Filter */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Protection Level</h4>
        <div className="space-y-1">
          {(['all', 'Basic', 'Shield', 'Family Pro'] as TierFilter[]).map((tier) => {
            const isSel = tempTier === tier;
            const tierLabels = { all: 'Show All Tiers', Basic: 'Basic Commuter', Shield: 'Shield Retroreflective', 'Family Pro': 'Family Pro Bundle' };
            return (
              <button
                key={tier}
                onClick={() => setTempTier(tier)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer group ${
                  isSel 
                    ? 'bg-zinc-900/60 border-zinc-800/80 text-white'
                    : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <span className="text-xs font-semibold">{tierLabels[tier]}</span>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                  isSel ? 'border-[#ff6b00] bg-[#ff6b00]' : 'border-zinc-800 group-hover:border-zinc-700'
                }`}>
                  {isSel && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-zinc-800/60 my-4" />

      {/* 3. Decal Delivery Filter */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sticker Decal Status</h4>
        <div className="space-y-1">
          {(['all', 'Processing', 'Shipped', 'Delivered'] as StickerFilter[]).map((sticker) => {
            const isSel = tempSticker === sticker;
            const decalLabels = { all: 'Show All Sticker States', Processing: 'Decal Processing', Shipped: 'Decal Dispatched/Shipped', Delivered: 'Decal Delivered/Active' };
            return (
              <button
                key={sticker}
                onClick={() => setTempSticker(sticker)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer group ${
                  isSel 
                    ? 'bg-zinc-900/60 border-zinc-800/80 text-white'
                    : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <span className="text-xs font-semibold">{decalLabels[sticker]}</span>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                  isSel ? 'border-[#ff6b00] bg-[#ff6b00]' : 'border-zinc-800 group-hover:border-zinc-700'
                }`}>
                  {isSel && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ─── 1. HEADER BAR ─── */}
      <PageHeader
        title="My Registered Fleet"
        description="Track sticker protection coverage, manage rate-limiting details, download QR codes, and customize first-responder medical telemetry."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vehicles' }]}
        actions={
          <Button 
            onClick={() => navigate('/dashboard/vehicles/register')}
            className="w-full sm:w-auto h-9.5 bg-[#ff7a00] hover:bg-[#e06b00] font-extrabold text-white text-xs shadow-sm transition-all cursor-pointer px-5 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            Register Vehicle
          </Button>
        }
      />

      {/* ─── 2. FILTERS & SEARCH ROW ─── */}
      <div className="flex gap-2 justify-between items-center w-full">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          </span>
          <Input
            type="text"
            placeholder="Search by plate, owner or protection tier..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-white focus-visible:ring-[#ff7a00]/30"
          />
        </div>

        {/* Filter Trigger Button */}
        <Button
          onClick={() => setOpenFilter(true)}
          variant="outline"
          className={`h-9.5 px-4 rounded-lg border flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-extrabold transition-all shrink-0 ${
            hasActiveFilters 
              ? 'bg-[#ff6b00]/10 border-[#ff6b00]/30 text-[#ff6b00]'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <HugeiconsIcon icon={FilterIcon} className="size-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-[#ff6b00] animate-pulse" />
          )}
        </Button>
      </div>

      {/* ─── 3. VEHICLE LIST GRID ─── */}
      {loading ? (
        /* Loader state — Skeletons */
        <SkeletonBlock variant="card" count={3} />
      ) : totalItems === 0 ? (
        /* Empty State */
        <EmptyState
          title="No registered fleet vehicles found"
          description={
            hasActiveFilters 
              ? 'No fleet vehicles match the active search and filter combinations.' 
              : 'Register your vehicle security details and pair a windshield sticker decal to get started.'
          }
          action={
            hasActiveFilters ? (
              <Button
                onClick={handleResetFilters}
                className="h-9 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold px-5 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Reset Active Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/dashboard/vehicles/register')}
                className="h-9 bg-[#ff7a00] hover:bg-[#e06b00] text-white text-xs font-bold px-5 rounded-lg uppercase tracking-wider cursor-pointer border-none"
              >
                Register Now
              </Button>
            )
          }
        />
      ) : (
        /* Paginated Vehicles Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedVehicles.map((v) => {
              const status = getVehicleStatus(v);
              const daysRemaining = getDaysRemaining(v.expiryDate);

              return (
                <Card 
                  key={v.id} 
                  className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-350 dark:hover:border-zinc-750 transition-all rounded-lg p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-brand/5 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                          <HugeiconsIcon icon={Car01Icon} className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold font-mono text-zinc-900 dark:text-white tracking-tight leading-tight uppercase">
                            {v.licensePlate}
                          </span>
                          <span className="block text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">
                            {v.tier} protection
                          </span>
                        </div>
                      </div>

                      {/* Custom VehicleStatusBadge */}
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border leading-none shrink-0 ${
                        status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          status === 'active' ? 'bg-emerald-400 animate-pulse' :
                          status === 'pending' ? 'bg-amber-400 animate-pulse' :
                          'bg-red-500 animate-pulse'
                        }`} />
                        {status}
                      </span>
                    </div>

                    {/* Card details */}
                    <div className="space-y-2.5 text-xs text-left">
                      {/* RenewalCountdown */}
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-800/40">
                        <HugeiconsIcon 
                          icon={status === 'expired' ? AlertCircleIcon : Calendar03Icon} 
                          className={`size-3.5 shrink-0 ${
                            status === 'expired' ? 'text-red-500 dark:text-red-400' : 
                            daysRemaining <= 30 ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-500'
                          }`} 
                        />
                        <span className="text-[11px] leading-tight">
                          {status === 'expired' ? (
                            <span className="text-red-500 dark:text-red-400 font-semibold font-mono">Expired on {v.expiryDate}</span>
                          ) : daysRemaining <= 30 ? (
                            <span className="text-amber-500 dark:text-amber-400 font-semibold font-mono">Expiring in {daysRemaining} days!</span>
                          ) : (
                            <span className="text-zinc-500 dark:text-zinc-400 font-mono">{daysRemaining} days remaining</span>
                          )}
                        </span>
                      </div>

                      {/* Contacts & Metadata info */}
                      <div className="space-y-1.5 pl-0.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500 flex items-center gap-1 font-mono uppercase">
                            <HugeiconsIcon icon={UserGroupIcon} className="size-3" /> Contacts:
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-300 font-mono font-bold">
                            {v.emergencyContacts.length} emergency contacts
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500 flex items-center gap-1 font-mono uppercase">
                            <HugeiconsIcon icon={QrCodeIcon} className="size-3" /> Status:
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-300 font-mono font-bold">
                            {v.stickerStatus === 'Delivered' ? 'Decal Activated' : `Sticker ${v.stickerStatus}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-200 dark:border-[#1a1c24] items-center">
                    <Button 
                      onClick={() => navigate(`/dashboard/vehicles/${v.id}`)}
                      className="flex-1 h-8.5 font-bold text-[10px] tracking-wide cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-805 dark:text-white rounded-lg uppercase"
                    >
                      View Details
                    </Button>
                    
                    {status === 'expired' ? (
                      <Button
                        onClick={() => navigate('/dashboard/billing')}
                        className="h-8.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 rounded-lg uppercase cursor-pointer flex items-center justify-center"
                      >
                        Renew
                      </Button>
                    ) : status === 'pending' ? (
                      <Button
                        onClick={() => navigate('/dashboard/checkout', { 
                          state: { 
                            vehicleId: v.id, 
                            tier: String(v.tier).toLowerCase() === 'premium' ? 'family pro' : String(v.tier).toLowerCase(),
                            price: String(v.tier).toLowerCase() === 'basic' ? 299 : 499
                          } 
                        })}
                        className="h-8.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 rounded-lg uppercase cursor-pointer flex items-center justify-center shrink-0"
                      >
                        Pay & Activate
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDownloadSticker(v)}
                        variant="outline"
                        title="Download Decal Sticker Pack"
                        className="h-8.5 w-8.5 p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/35 hover:bg-zinc-200 dark:hover:bg-zinc-850 rounded-lg flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <HugeiconsIcon icon={Download02Icon} className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-[#1a1c24] text-[11px] text-zinc-500 font-mono">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} vehicles
              </span>
              <div className="flex gap-1">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-[10px] rounded-lg uppercase tracking-wider bg-zinc-150 dark:bg-zinc-900 hover:bg-zinc-250 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-800 dark:text-white cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 text-[10px] rounded-lg uppercase tracking-wider bg-zinc-150 dark:bg-zinc-900 hover:bg-zinc-250 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-800 dark:text-white cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 4. RESPONSIVE FILTER SHEET (DESKTOP) / DRAWER (MOBILE) ─── */}
      {isMobile ? (
        /* Mobile Drawer Component */
        <Drawer open={openFilter} onOpenChange={setOpenFilter}>
          <DrawerContent className="bg-white dark:bg-[#0c0c0e] border-t border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-white p-6 max-h-[85vh] flex flex-col">
            <DrawerHeader className="p-0 pb-4 text-left shrink-0">
              <DrawerTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-serif">Filter Fleet Vehicles</DrawerTitle>
              <DrawerDescription className="text-xs text-zinc-550 dark:text-zinc-500">Refine fleet list by subscription state, decal delivery, and tier levels.</DrawerDescription>
            </DrawerHeader>
            
            <div className="flex-grow overflow-y-auto my-2 pr-1">
              {renderFilterOptions()}
            </div>
            
            <DrawerFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-row gap-2 mt-4 shrink-0">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
              >
                Reset All
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-grow flex-1 h-10 bg-[#ff7a00] hover:bg-[#e06b00] text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
              >
                Apply Filters
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop Sheet Component */
        <Sheet open={openFilter} onOpenChange={setOpenFilter}>
          <SheetContent className="bg-white dark:bg-[#0c0c0e] border-l border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-white p-6 max-w-sm flex flex-col h-full">
            <SheetHeader className="p-0 pb-4 text-left shrink-0">
              <SheetTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-serif">Filter Fleet Vehicles</SheetTitle>
              <SheetDescription className="text-xs text-zinc-550 dark:text-zinc-500">Refine fleet list by subscription state, decal delivery, and tier levels.</SheetDescription>
            </SheetHeader>
            
            <div className="flex-grow overflow-y-auto my-2 pr-1">
              {renderFilterOptions()}
            </div>
            
            <SheetFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-row gap-2 shrink-0">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
              >
                Reset All
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-grow flex-1 h-10 bg-[#ff7a00] hover:bg-[#e06b00] text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
              >
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* Decal Download Confirmation Dialog */}
      <ConfirmDialog
        open={showDownloadAlert}
        title="Download Decal Sticker Pack"
        description={`Preparing printable high-resolution windshield decal PDF package for vehicle ${selectedVehicle?.licensePlate || ''}.`}
        confirmLabel="Download PDF"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!selectedVehicle) return;
          setShowDownloadAlert(false);
          const vehStatus = (selectedVehicle as any).subscriptionStatus || (selectedVehicle as any).subscription_status || 'active';
          if (vehStatus !== 'active') {
            toast.error('Active paid subscription required to download decal sticker pack. Please activate your plan.');
            return;
          }
          const toastId = toast.loading('Downloading decal sticker PDF...');
          try {
            await downloadVehicleSticker(selectedVehicle.id, selectedVehicle.licensePlate);
            toast.success('Decal sticker PDF downloaded successfully!', { id: toastId });
          } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || 'Failed to download decal sticker PDF.';
            toast.error(msg, { id: toastId });
          }
        }}
        onCancel={() => setShowDownloadAlert(false)}
      />
    </div>
  );
}

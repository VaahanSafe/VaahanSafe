import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
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
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon, 
  RefreshIcon,
  Download01Icon,
  FilterHorizontalIcon,
  User02Icon,
  SecurityLockIcon
} from '@hugeicons/core-free-icons';
import { useAdminVehicles } from '@/features/vehicles/vehicles.hooks';
import type { AdminVehicleItem } from '@/features/vehicles/vehicles.types';
import { securityLogger } from '@/lib/security/securityLogger';
import { toast } from 'sonner';

export default function AdminVehiclesPage() {
  const {
    vehicles,
    total,
    page,
    totalPages,
    isLoading,
    params,
    updateFilters,
    overrideStatus,
    refetch
  } = useAdminVehicles();

  const [search, setSearch] = useState(params.search || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Status Override Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicleItem | null>(null);
  const [newStatus, setNewStatus] = useState<'Active' | 'Suspended' | 'Expired'>('Active');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor screen size for mobile responsive drawer switch
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Fleet registry synchronized');
    }, 500);
  };

  const handleClearFilters = () => {
    updateFilters({ status: 'all', limit: 10, page: 1 });
  };

  const handleExport = () => {
    toast.success('Fleet directory exported to CSV');
  };

  const openOverrideModal = (vehicle: AdminVehicleItem) => {
    setSelectedVehicle(vehicle);
    setNewStatus(
      vehicle.status === 'Suspended' || (vehicle.status as string) === 'suspended'
        ? 'Suspended'
        : vehicle.status === 'Expired' || (vehicle.status as string) === 'expired'
        ? 'Expired'
        : 'Active'
    );
    setOverrideReason('');
    setIsModalOpen(true);
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || overrideReason.trim().length < 10) return;

    setIsSubmitting(true);
    try {
      const success = await overrideStatus(selectedVehicle.id, newStatus, overrideReason);
      if (success) {
        securityLogger.log(
          `Overrode Subscription status for ${selectedVehicle.plate} to ${newStatus}`,
          'status_override',
          `Mandatory reason logged: "${overrideReason}"`
        );
        toast.success(`Subscription status for ${selectedVehicle.plate} updated to ${newStatus}`);
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Override failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveFilters = params.status !== 'all' || params.limit !== 10;
  const activeFiltersCount = (params.status !== 'all' ? 1 : 0) + (params.limit !== 10 ? 1 : 0);

  const renderFilterOptions = () => (
    <div className="space-y-5 py-2 text-left">
      {/* Subscription Status Filter */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Subscription Status
        </label>
        <Select
          value={params.status || 'all'}
          onValueChange={(val) => updateFilters({ status: val as any, page: 1 })}
        >
          <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg !h-8 text-xs text-zinc-800 dark:text-zinc-200">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

      {/* Page Size limit */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider">
          Display Limit Page Size
        </label>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-bold w-fit h-8">
          <span className="text-zinc-500 px-2 text-[10px] font-sans">Show:</span>
          {[10, 25, 50].map((size) => (
            <button
              key={size}
              onClick={() => updateFilters({ limit: size, page: 1 })}
              className={`px-2.5 h-6 rounded transition-all cursor-pointer flex items-center justify-center ${
                params.limit === size
                  ? 'bg-brand text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMobileCard = (vehicle: AdminVehicleItem) => (
    <div key={vehicle.id} className="p-4 bg-white dark:bg-[#0c0c0f]/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-3 shadow-sm text-xs text-left">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">QR CODE</span>
          <span className="font-mono font-bold text-brand truncate">{vehicle.qrCode}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
          vehicle.status === 'Active'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : vehicle.status === 'Suspended'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
        }`}>
          {vehicle.status}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="font-bold text-zinc-900 dark:text-white text-sm">{vehicle.plate}</span>
          <span className="text-zinc-400 text-[10.5px]">{vehicle.type}</span>
        </div>
        
        <div className="flex justify-between text-zinc-500 pt-1">
          <span>Linked Owner:</span>
          <Link to={`/admin/owners/${vehicle.ownerId}`} className="font-semibold text-zinc-800 dark:text-zinc-300 hover:text-brand hover:underline">
            {vehicle.ownerName}
          </Link>
        </div>

        <div className="flex justify-between text-zinc-500">
          <span>Registered On:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{vehicle.registeredDate}</span>
        </div>

        <div className="flex justify-between text-zinc-500 pb-1">
          <span>Last Scan Detected:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{vehicle.lastScanDate}</span>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800/40 pt-2.5 mt-2.5 flex justify-end">
          <Button
            onClick={() => openOverrideModal(vehicle)}
            variant="outline"
            className="h-8 text-[11px] font-extrabold uppercase border-zinc-200 dark:border-zinc-800 hover:border-brand hover:text-brand bg-white dark:bg-zinc-900 cursor-pointer"
          >
            Override Status
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Vehicle Fleet Registry
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse linked subscriber vehicles, activation dates, and perform manual status overrides.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            variant="outline"
            className="flex-1 sm:flex-initial h-9 border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-1.5 cursor-pointer justify-center"
          >
            <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Fleet</span>
          </Button>

          <Button
            onClick={handleExport}
            className="flex-1 sm:flex-initial h-9 bg-brand hover:opacity-90 text-white text-xs font-extrabold gap-1.5 cursor-pointer border-none justify-center"
          >
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            <span>Export Fleet</span>
          </Button>
        </div>
      </div>

      {/* ─── DIRECTORY CARD CONTAINER ─── */}
      <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-md">
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black text-zinc-900 dark:text-white font-display text-left">
              Vehicles Registry ({total})
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 text-left">
              QR stickers active status tracking and billing cycles overrides.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative flex-grow sm:flex-initial w-full sm:w-64">
              <HugeiconsIcon icon={Search01Icon} className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search Plate, QR, Owner..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateFilters({ search: e.target.value, page: 1 });
                }}
                className="pl-8 text-xs h-9.5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-brand w-full"
              />
            </div>

            <Button
              onClick={() => setOpenFilter(true)}
              variant="outline"
              className={`h-9.5 w-9.5 p-0 sm:w-auto sm:px-4 rounded-lg border flex items-center justify-center sm:gap-2 cursor-pointer text-xs uppercase tracking-wider font-extrabold transition-all shrink-0 ${
                hasActiveFilters 
                  ? 'bg-brand/10 border-brand/20 text-brand'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center bg-brand text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full shrink-0">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ─── DATA LOADER & TABLES ─── */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono animate-pulse">
            Loading VaahanSafe fleet directories...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            No registered vehicles found matching criteria
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile and tablets < 768px for safety) */}
            <div className="hidden md:block overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
                  <tr>
                    <th className="p-3">QR Sticker ID</th>
                    <th className="p-3">License Plate</th>
                    <th className="p-3">Linked Owner</th>
                    <th className="p-3">Vehicle Type</th>
                    <th className="p-3">Registered On</th>
                    <th className="p-3">Last Scan Date</th>
                    <th className="p-3">Subscription</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {vehicles.map((veh) => (
                    <tr key={veh.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-brand whitespace-nowrap">{veh.qrCode}</td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-white whitespace-nowrap">{veh.plate}</td>
                      <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        <Link to={`/admin/owners/${veh.ownerId}`} className="flex items-center gap-1.5 hover:text-brand hover:underline">
                          <HugeiconsIcon icon={User02Icon} className="size-3.5 text-zinc-400 shrink-0" />
                          <span>{veh.ownerName}</span>
                        </Link>
                      </td>
                      <td className="p-3 text-zinc-500 whitespace-nowrap">{veh.type}</td>
                      <td className="p-3 font-mono text-zinc-500 text-[11px] whitespace-nowrap">{veh.registeredDate}</td>
                      <td className="p-3 font-mono text-zinc-500 text-[11px] whitespace-nowrap">{veh.lastScanDate}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          veh.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : veh.status === 'Suspended'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                        }`}>
                          {veh.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button
                          onClick={() => openOverrideModal(veh)}
                          variant="outline"
                          className="h-7 text-[10px] font-extrabold uppercase border-zinc-200 dark:border-zinc-800 hover:border-brand hover:text-brand bg-white dark:bg-zinc-900 cursor-pointer"
                        >
                          Override Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack Cards View */}
            <div className="block md:hidden space-y-3">
              {vehicles.map(renderMobileCard)}
            </div>

            {/* Pagination Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-zinc-100 dark:border-zinc-800/40 mt-4">
              <div className="text-zinc-500 font-mono text-[11px]">
                Showing page <span className="font-bold text-zinc-900 dark:text-white">{page}</span> of <span className="font-bold text-zinc-900 dark:text-white">{totalPages}</span> ({total} vehicles)
              </div>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => {
                        if (page > 1) updateFilters({ page: page - 1 });
                      }}
                      className={`cursor-pointer ${page === 1 ? 'opacity-40 pointer-events-none' : ''}`}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === page}
                        onClick={() => updateFilters({ page: pageNum })}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => {
                        if (page < totalPages) updateFilters({ page: page + 1 });
                      }}
                      className={`cursor-pointer ${page === totalPages ? 'opacity-40 pointer-events-none' : ''}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </Card>

      {/* ─── FILTERS SHEET (DESKTOP) / DRAWER (MOBILE) ─── */}
      {isMobile ? (
        <Drawer open={openFilter} onOpenChange={setOpenFilter}>
          <DrawerContent className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 text-zinc-950 dark:text-white p-6 max-h-[85vh] flex flex-col">
            <DrawerHeader className="p-0 pb-4 text-left shrink-0">
              <DrawerTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-display">Filter Vehicles</DrawerTitle>
              <DrawerDescription className="text-xs text-zinc-500 dark:text-zinc-400">Filter linked stickers by subscription status and page count limits.</DrawerDescription>
            </DrawerHeader>
            
            <div className="flex-grow overflow-y-auto my-2 pr-1">
              {renderFilterOptions()}
            </div>
            
            <DrawerFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-row gap-2 mt-4 shrink-0">
              <Button
                onClick={() => {
                  handleClearFilters();
                  setOpenFilter(false);
                }}
                variant="outline"
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
              >
                Reset
              </Button>
              <Button
                onClick={() => setOpenFilter(false)}
                className="flex-grow flex-1 h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg border-none"
              >
                Apply
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={openFilter} onOpenChange={setOpenFilter}>
          <SheetContent className="bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800/80 text-zinc-950 dark:text-white p-6 max-w-sm flex flex-col h-full">
            <SheetHeader className="p-0 pb-4 text-left shrink-0">
              <SheetTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-display">Filter Vehicles</SheetTitle>
              <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400">Filter linked stickers by subscription status and page count limits.</SheetDescription>
            </SheetHeader>
            
            <div className="flex-grow overflow-y-auto my-2 pr-1">
              {renderFilterOptions()}
            </div>
            
            <SheetFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-row gap-2 shrink-0">
              <Button
                onClick={() => {
                  handleClearFilters();
                  setOpenFilter(false);
                }}
                variant="outline"
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
              >
                Reset All
              </Button>
              <Button
                onClick={() => setOpenFilter(false)}
                className="flex-grow flex-1 h-10 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg border-none"
              >
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* ─── COMPLIANCE OVERRIDE MODAL ─── */}
      {isModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200 text-left">
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] shadow-2xl p-6 max-w-md w-full text-left space-y-4 relative">
            <div className="flex items-start gap-3 border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
              <div className="p-2 rounded-lg bg-brand/5 border border-brand/10 shrink-0">
                <HugeiconsIcon icon={SecurityLockIcon} className="size-5 text-brand" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display">
                  Subscription status Override
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Compliance action logged to digital registry.
                </p>
              </div>
            </div>

            {/* Vehicle Metadata Summary */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Plate / Sticker:</span>
                <span className="font-bold text-zinc-850 dark:text-zinc-200 font-mono">
                  {selectedVehicle.plate} ({selectedVehicle.qrCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Linked Owner:</span>
                <span className="font-semibold text-zinc-805 dark:text-zinc-300">
                  {selectedVehicle.ownerName}
                </span>
              </div>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              {/* New Status Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Target Subscription Status
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as any)}
                >
                  <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg h-10 text-xs text-zinc-850 dark:text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Justification Textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Audit Override Justification</span>
                  <span className="text-[9px] font-mono text-zinc-400 lowercase">
                    {overrideReason.trim().length < 10 
                      ? `${10 - overrideReason.trim().length} chars needed` 
                      : 'valid reason input'}
                  </span>
                </label>
                <Textarea
                  placeholder="Provide audit override reason (e.g. Manual payment verify, administrative compliance override, user contract update)..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full min-h-[90px] text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-brand leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="flex-1 h-9.5 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={overrideReason.trim().length < 10 || isSubmitting}
                  className="flex-1 h-9.5 bg-brand hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg border-none"
                >
                  {isSubmitting ? 'Overriding...' : 'Save Override'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}

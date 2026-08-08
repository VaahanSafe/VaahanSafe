import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  User02Icon,
  SmartPhone01Icon,
  CheckmarkCircle02Icon,
  Car01Icon,
  Download01Icon,
  RefreshIcon,
  Calendar03Icon,
  FilterHorizontalIcon
} from '@hugeicons/core-free-icons';
import { useAdminOwners } from '@/features/owners/owners.hooks';
import type { AdminOwnerItem } from '@/features/owners/owners.types';
import { toast } from 'sonner';

export default function AdminOwnersPage() {
  const {
    owners,
    total,
    page,
    totalPages,
    isLoading,
    params,
    updateFilters,
    refetch
  } = useAdminOwners();

  const [search, setSearch] = useState(params.search || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      toast.success('Subscriber registries synchronized');
    }, 500);
  };

  const handleClearFilters = () => {
    updateFilters({ status: 'all', limit: 10, page: 1 });
  };

  const handleExport = () => {
    toast.success('Vehicle owners CSV directory generated successfully');
  };

  const hasActiveFilters = params.status !== 'all' || params.limit !== 10;
  const activeFiltersCount = (params.status !== 'all' ? 1 : 0) + (params.limit !== 10 ? 1 : 0);

  const renderFilterOptions = () => (
    <div className="space-y-5 py-2 text-left">
      {/* Verification Status */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Verification Status
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
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Pending Medical">Pending Medical</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

      {/* Page Size Limit */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
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

  const renderMobileCard = (owner: AdminOwnerItem) => (
    <div key={owner.id} className="p-4 bg-white dark:bg-[#0c0c0f]/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-3 shadow-sm text-xs text-left">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">ID</span>
          <Link to={`/admin/owners/${owner.id}`} className="font-mono font-bold text-brand hover:underline truncate">
            {owner.id}
          </Link>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
          owner.status === 'Verified'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : owner.status === 'Pending Medical'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {owner.status}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="font-bold text-zinc-900 dark:text-white text-sm">{owner.name}</div>
        <div className="flex justify-between text-zinc-500">
          <span>Mobile Phone:</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{owner.phone}</span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Sticker Count:</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1">
            <HugeiconsIcon icon={Car01Icon} className="size-3 text-brand" />
            {owner.vehiclesCount} Stickers
          </span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Registry City:</span>
          <span>{owner.city}</span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>DPDP Consent:</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            {owner.dpdpConsent}
          </span>
        </div>
        <div className="flex justify-between text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/40 pt-2 mt-2">
          <span>Last Scan Detected:</span>
          <span className="font-mono text-zinc-400 flex items-center gap-1">
            <HugeiconsIcon icon={Calendar03Icon} className="size-3 text-zinc-500" />
            {owner.lastScanDate}
          </span>
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
            Vehicle Owner Records
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Registered vehicle owners directory and DPDP 2023 compliance consent logs.
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
            <span>Sync Registries</span>
          </Button>

          <Button
            onClick={handleExport}
            className="flex-1 sm:flex-initial h-9 bg-brand hover:opacity-90 text-white text-xs font-extrabold gap-1.5 cursor-pointer border-none justify-center"
          >
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            <span>Export Directory</span>
          </Button>
        </div>
      </div>

      {/* ─── DIRECTORY CONTAINER ─── */}
      <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-md">
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black text-zinc-900 dark:text-white font-display text-left">
              Owner Registry ({total})
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 text-left">
              Verified accounts, fleet scale, and DPDP validation stamps.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative flex-grow sm:flex-initial w-full sm:w-64">
              <HugeiconsIcon icon={Search01Icon} className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search Owner, Phone, City..."
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

        {/* ─── LOADER / DATA VIEWS ─── */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono animate-pulse">
            Syncing VaahanSafe subscriber datasets...
          </div>
        ) : owners.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            No registered subscribers match search query
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile and tablets < 768px to prevent squishing) */}
            <div className="hidden md:block overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
                  <tr>
                    <th className="p-3">Owner ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Mobile Contact</th>
                    <th className="p-3">Fleet Count</th>
                    <th className="p-3">Registry City</th>
                    <th className="p-3">Last Scan Detected</th>
                    <th className="p-3">DPDP Consent</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {owners.map((owner: AdminOwnerItem) => (
                    <tr key={owner.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-mono">
                        <Link to={`/admin/owners/${owner.id}`} className="font-bold text-brand hover:underline">
                          {owner.id}
                        </Link>
                      </td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <HugeiconsIcon icon={User02Icon} className="size-3.5 text-brand shrink-0" />
                        <span>{owner.name}</span>
                      </td>
                      <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={SmartPhone01Icon} className="size-3 text-zinc-400" />
                          {owner.phone}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Car01Icon} className="size-3 text-brand" />
                          {owner.vehiclesCount} Stickers
                        </span>
                      </td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-400">{owner.city}</td>
                      <td className="p-3 font-mono text-zinc-500 text-[11px]">{owner.lastScanDate}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                          {owner.dpdpConsent}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                          owner.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : owner.status === 'Pending Medical'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3 shrink-0" />
                          {owner.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack View (Shown on screens < 768px for readable visual space) */}
            <div className="block md:hidden space-y-3">
              {owners.map(renderMobileCard)}
            </div>

            {/* Pagination Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-zinc-100 dark:border-zinc-800/40 mt-4">
              <div className="text-zinc-500 font-mono text-[11px]">
                Showing page <span className="font-bold text-zinc-900 dark:text-white">{page}</span> of <span className="font-bold text-zinc-900 dark:text-white">{totalPages}</span> ({total} owners)
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

      {/* ─── RESPONSIVE FILTER SHEET (DESKTOP) / DRAWER (MOBILE) ─── */}
      {isMobile ? (
        /* Mobile Drawer Component */
        <Drawer open={openFilter} onOpenChange={setOpenFilter}>
          <DrawerContent className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 text-zinc-950 dark:text-white p-6 max-h-[85vh] flex flex-col">
            <DrawerHeader className="p-0 pb-4 text-left shrink-0">
              <DrawerTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-display">Filter Owners</DrawerTitle>
              <DrawerDescription className="text-xs text-zinc-500 dark:text-zinc-400">Refine the registry by verification status and page limits.</DrawerDescription>
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
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
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
        /* Desktop/Tablet Sheet Component */
        <Sheet open={openFilter} onOpenChange={setOpenFilter}>
          <SheetContent className="bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800/80 text-zinc-950 dark:text-white p-6 max-w-sm flex flex-col h-full">
            <SheetHeader className="p-0 pb-4 text-left shrink-0">
              <SheetTitle className="text-base font-extrabold text-zinc-900 dark:text-white font-display">Filter Owners</SheetTitle>
              <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400">Refine the registry by verification status and page limits.</SheetDescription>
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
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg"
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
    </div>
  );
}

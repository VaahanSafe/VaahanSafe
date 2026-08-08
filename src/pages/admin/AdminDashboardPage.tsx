import { useState } from 'react';
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
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserGroupIcon, 
  Search01Icon,
  RefreshIcon,
  Download01Icon,
  Location01Icon,
  ActivityIcon,
  Layers01Icon,
  FlashIcon
} from '@hugeicons/core-free-icons';
import { useAdminMetrics } from '@/features/admin/admin.hooks';
import { toast } from 'sonner';
import { MetricTile } from '@/components/admin/MetricTile';
import { cn } from '@/lib/utils';

// Generate 50 realistic emergency scan records
const allIncidents = Array.from({ length: 50 }, (_, i) => {
  const cities = [
    { city: "Bandra West, Mumbai", code: "MUM" },
    { city: "Indiranagar, Bengaluru", code: "BLR" },
    { city: "Connaught Place, New Delhi", code: "DEL" },
    { city: "Hitec City, Hyderabad", code: "HYD" },
    { city: "Kothrud, Pune", code: "PUN" },
    { city: "Anna Nagar, Chennai", code: "CHE" },
    { city: "Salt Lake, Kolkata", code: "KOL" },
    { city: "Navrangpura, Ahmedabad", code: "AMD" }
  ];
  const types = [
    { type: "Accident Emergency", severity: "high", status: "Dispatched" },
    { type: "Wrong Parking Alert", severity: "medium", status: "Notified Owner" },
    { type: "Paramedic Access", severity: "low", status: "PIN Verified" }
  ];
  const vehicles = [
    "MH-02-AB-1234 (Hyundai Creta)",
    "KA-01-MJ-8821 (Tata Nexon)",
    "DL-3C-AZ-9901 (Maruti Swift)",
    "TS-09-EV-4412 (Mahindra XUV700)",
    "MH-12-QX-9081 (Honda City)",
    "TN-07-CB-3310 (Toyota Fortuner)",
    "WB-02-AK-5522 (Kia Seltos)",
    "GJ-01-RS-1109 (Hyundai i20)"
  ];

  const cityObj = cities[i % cities.length];
  const typeObj = types[i % types.length];
  const vehicle = vehicles[i % vehicles.length];
  const idNum = 8921 - i;

  return {
    id: `SCAN-${idNum}`,
    qrCode: `VS-${cityObj.code}-${1000 + ((i + 1) * 173) % 8999}`,
    vehicle: vehicle,
    type: typeObj.type,
    time: i === 0 ? '2 mins ago' : `${i * 3 + 2} mins ago`,
    location: cityObj.city,
    status: typeObj.status,
    severity: typeObj.severity
  };
});

export default function AdminDashboardPage() {
  const { data: rawMetrics, isLoading, refetch } = useAdminMetrics();
  const metrics: any = rawMetrics;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Options: 10, 25, 50 (Maximum 50)

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Operator telemetry feed synchronized successfully');
    }, 500);
  };

  const operationalStats = [
    {
      title: "Active Vehicles",
      value: metrics ? metrics.activeVehicles.toLocaleString('en-IN') : "15,420",
      subtext: "99.8% fleet online",
      icon: UserGroupIcon,
      color: "text-emerald-400"
    },
    {
      title: "Scans / Hour",
      value: metrics ? `${metrics.scansPerHour}/hr` : "142/hr",
      subtext: "Peak load optimal",
      icon: FlashIcon,
      color: "text-amber-400"
    },
    {
      title: "Dispatch Success Rate",
      value: metrics ? `${metrics.dispatchSuccessRate}%` : "99.8%",
      subtext: "WhatsApp & Exotel Voice",
      icon: ActivityIcon,
      color: "text-blue-400"
    },
    {
      title: "Queue Depths",
      value: metrics ? `${metrics.queueDepths.whatsappDLQ} DLQ / ${metrics.queueDepths.voiceRetryQueue} Retry` : "0 DLQ / 2 Retry",
      subtext: "Dead-Letter Queue clear",
      icon: Layers01Icon,
      color: "text-purple-400"
    }
  ];

  const filteredIncidents = allIncidents.filter(inc => 
    inc.qrCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage) || 1;
  const paginatedIncidents = filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Operator Command Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time fleet telemetry, emergency dispatch logging, and infrastructure diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing || isLoading}
            className="h-9 border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-1.5 cursor-pointer flex-1 sm:flex-initial"
          >
            <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </Button>

          <Button
            onClick={() => toast.success('Audit log report exported (CSV)')}
            className="h-9 bg-brand hover:opacity-90 text-white text-xs font-extrabold gap-1.5 cursor-pointer border-none flex-1 sm:flex-initial"
          >
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-zinc-100 dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-xs font-mono">
        <div className="flex items-center justify-between sm:justify-start gap-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-zinc-400">WhatsApp Gateway:</span>
          </div>
          <span className="font-bold text-emerald-400">Connected</span>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-zinc-400">Exotel Voice:</span>
          </div>
          <span className="font-bold text-emerald-400">Operational</span>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-zinc-400">Reverse Geocoder:</span>
          </div>
          <span className="font-bold text-emerald-400">Active (12ms)</span>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-zinc-400">DPDP Enforcement:</span>
          </div>
          <span className="font-bold text-emerald-400">Strict</span>
        </div>
      </div>

      {/* Operational Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {operationalStats.map((item, idx) => {
          const rawVal = item.value;
          let parsedVal: number | string = rawVal;
          let trend: number | undefined = undefined;
          
          if (rawVal.includes('%')) {
            const numeric = parseFloat(rawVal.replace('%', ''));
            if (!isNaN(numeric)) {
              parsedVal = numeric;
            }
          } else if (!isNaN(Number(rawVal.replace(/,/g, '')))) {
            parsedVal = Number(rawVal.replace(/,/g, ''));
          } else if (rawVal.includes('/hr')) {
            const numeric = parseFloat(rawVal.replace('/hr', ''));
            if (!isNaN(numeric)) {
              parsedVal = numeric;
            }
          }

          // Mock some realistic telemetry growth trends for visuals
          if (idx === 0) trend = 14;
          if (idx === 1) trend = -3;
          if (idx === 2) trend = 0.5;

          return (
            <MetricTile
              key={idx}
              title={item.title}
              value={parsedVal}
              trend={trend}
              subtitle={item.subtext}
              icon={<HugeiconsIcon icon={item.icon} className={cn("size-4", item.color)} />}
              loading={isLoading}
            />
          );
        })}
      </div>

      {/* Real-time Incident Feed Table with Shadcn UI Pagination */}
      <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-4 sm:p-5 space-y-4 shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black text-zinc-900 dark:text-white font-display">
              Live QR Incident Feed
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing {paginatedIncidents.length} of {filteredIncidents.length} active emergency scan events (Total: {allIncidents.length}).
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Page Size Selector (10, 25, Max 50) */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-bold">
              <span className="text-zinc-500 px-1">Show:</span>
              {[10, 25, 50].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    itemsPerPage === size
                      ? 'bg-brand text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {size === 50 ? '50 (Max)' : size}
                </button>
              ))}
            </div>

            <div className="relative flex-1">
              <HugeiconsIcon icon={Search01Icon} className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search QR ID or city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 text-xs h-9 w-full sm:w-48 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg"
              />
            </div>

            <Link to="/admin/scans" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-9 text-xs font-bold border-zinc-200 dark:border-zinc-800">
                View All Scans
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="block sm:hidden space-y-3 pt-2">
          {paginatedIncidents.map((inc) => (
            <div key={inc.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand">{inc.qrCode}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  inc.severity === 'high'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : inc.severity === 'medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {inc.type}
                </span>
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-200">{inc.vehicle}</div>
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Location01Icon} className="size-3 text-zinc-400" />
                  {inc.location}
                </span>
                <span className="font-mono">{inc.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table View */}
        <div className="hidden sm:block overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
              <tr>
                <th className="p-3 whitespace-nowrap">QR Code ID</th>
                <th className="p-3 whitespace-nowrap">Vehicle Details</th>
                <th className="p-3 whitespace-nowrap">Incident Category</th>
                <th className="p-3 whitespace-nowrap">Location</th>
                <th className="p-3 whitespace-nowrap">Timestamp</th>
                <th className="p-3 whitespace-nowrap">Outcome Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {paginatedIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-brand whitespace-nowrap">{inc.qrCode}</td>
                  <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{inc.vehicle}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      inc.severity === 'high'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : inc.severity === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {inc.type}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Location01Icon} className="size-3 text-zinc-400 shrink-0" />
                      <span>{inc.location}</span>
                    </span>
                  </td>
                  <td className="p-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">{inc.time}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Shadcn UI Pagination Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-zinc-500 font-mono text-[11px]">
            Showing page <span className="font-bold text-zinc-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-zinc-900 dark:text-white">{totalPages}</span> ({filteredIncidents.length} items)
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`cursor-pointer ${currentPage === 1 ? 'opacity-40 pointer-events-none' : ''}`}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={`cursor-pointer ${currentPage === totalPages ? 'opacity-40 pointer-events-none' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

      </Card>
    </div>
  );
}

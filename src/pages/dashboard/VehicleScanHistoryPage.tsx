import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ScanLog, Vehicle } from '@/services/db';
import { useVehicleScanHistory } from '@/features/vehicles/vehicles.hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
  Search01Icon, 
  Location01Icon,
  FilterIcon,
  Calendar03Icon
} from '@hugeicons/core-free-icons';

interface VehicleOutletContext {
  vehicle: Vehicle;
}

export default function VehicleScanHistoryPage() {
  const { vehicle } = useOutletContext<VehicleOutletContext>();
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ScanLog[]>([]);

  // Filter States
  const [scanType, setScanType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Sheet/Drawer open state
  const [openFilter, setOpenFilter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check window width for responsive Sheet/Drawer toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: scanHistoryData, isLoading: loading } = useVehicleScanHistory(vehicle.id);

  useEffect(() => {
    if (scanHistoryData) {
      const mappedLogs: ScanLog[] = scanHistoryData.map((l: any) => ({
        id: l.id,
        vehicleId: l.vehicle_id || vehicle.id,
        time: l.created_at?.replace('T', ' ').substring(0, 19) || l.timestamp || new Date().toISOString().substring(0, 19),
        type: l.scan_type || 'emergency',
        details: l.scanner_note || l.details || 'Decal QR code scanned.',
        coordinates: l.latitude && l.longitude ? { lat: l.latitude, lng: l.longitude } : undefined
      }));
      setLogs(mappedLogs);
    }
  }, [scanHistoryData, vehicle.id]);

  // Apply filters client-side
  useEffect(() => {
    let result = [...logs];
    
    if (scanType !== 'all') {
      result = result.filter(log => log.type === scanType);
    }
    
    if (startDate) {
      result = result.filter(log => {
        const logDate = log.time.split(' ')[0];
        return logDate >= startDate;
      });
    }
    
    if (endDate) {
      result = result.filter(log => {
        const logDate = log.time.split(' ')[0];
        return logDate <= endDate;
      });
    }
    
    setFilteredLogs(result);
  }, [logs, scanType, startDate, endDate]);

  const activeFilterCount = 
    (scanType !== 'all' ? 1 : 0) + 
    (startDate ? 1 : 0) + 
    (endDate ? 1 : 0);

  const resetFilters = () => {
    setScanType('all');
    setStartDate('');
    setEndDate('');
    setOpenFilter(false);
  };

  const applyFilters = () => {
    setOpenFilter(false);
  };

  // Shared Filter UI Content
  const renderFilterForm = () => (
    <div className="space-y-5 py-4 text-left">
      <div className="space-y-1.5 flex flex-col">
        <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Scan Event Type</label>
        <Select value={scanType} onValueChange={v => setScanType(v || 'all')}>
          <SelectTrigger className="w-full !h-9.5 data-[size=default]:!h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-3">
            <SelectValue placeholder="All Scan Types" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
            <SelectItem value="all">All Scan Types</SelectItem>
            <SelectItem value="emergency">Emergency SOS</SelectItem>
            <SelectItem value="wrong_parking">Wrong Parking Alert</SelectItem>
            <SelectItem value="issue">Safety Issue / Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 flex flex-col">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Start Date</label>
          <Popover>
            <PopoverTrigger className={cn(
              "w-full !h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-3 flex justify-between items-center font-normal hover:bg-zinc-100 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white cursor-pointer outline-none focus:border-brand",
              !startDate && "text-zinc-500"
            )}>
              <span>{startDate ? format(new Date(startDate), "PPP") : "Select start date"}</span>
              <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-zinc-500" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-lg" align="start">
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : '')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 flex flex-col">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">End Date</label>
          <Popover>
            <PopoverTrigger className={cn(
              "w-full !h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-3 flex justify-between items-center font-normal hover:bg-zinc-100 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white cursor-pointer outline-none focus:border-brand",
              !endDate && "text-zinc-500"
            )}>
              <span>{endDate ? format(new Date(endDate), "PPP") : "Select end date"}</span>
              <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-zinc-500" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-lg" align="start">
              <Calendar
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => setEndDate(date ? format(date, "yyyy-MM-dd") : '')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 select-none animate-pulse text-left">
        <div className="h-40 bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
        <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Windshield Decal Scan Timeline</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Chronological history nodes of emergency scans and roadside responder logs.</CardDescription>
          </div>
          
          <Button
            onClick={() => setOpenFilter(true)}
            className="h-9.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={FilterIcon} className="size-4 text-brand" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="size-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-black shrink-0 relative">
                {activeFilterCount}
                <span className="absolute inset-0 rounded-full bg-brand/35 animate-ping" />
              </span>
            )}
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
              <HugeiconsIcon icon={Search01Icon} className="size-8 text-zinc-550 dark:text-zinc-600 mx-auto mb-2" />
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block">No Decal Scans Match Criteria</span>
              <p className="text-[10px] text-zinc-500 leading-normal max-w-xs mx-auto mt-1">
                We did not find any scans matching your active filters. Try modifying your date range or event type selections.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-900">
              {filteredLogs.map((log) => {
                const isEmergency = log.type === 'emergency';
                const isWrongParking = log.type === 'wrong_parking';
                return (
                  <div key={log.id} className="relative pb-8 last:pb-1">
                    {/* Circle Node Indicator */}
                    <span className={`absolute -left-6 top-1.5 size-4 rounded-full border-4 border-zinc-50 dark:border-[#08080a] flex items-center justify-center shrink-0 ${
                      isEmergency 
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                        : isWrongParking 
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-blue-500'
                    }`} />
                    
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900/60 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-lg border ${
                            isEmergency 
                              ? 'bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/25'
                              : isWrongParking
                              ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/25'
                              : 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/25'
                          }`}>
                            {log.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                          <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                          {log.time}
                        </span>
                      </div>
                      
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{log.details}</p>
                      
                      {log.coordinates && (
                        <div className="pt-2 flex justify-end">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${log.coordinates.lat},${log.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand hover:underline"
                          >
                            <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
                            <span>View Scanned Coordinates GPS Map</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet / Drawer Filter Panels */}
      {!isMobile ? (
        <Sheet open={openFilter} onOpenChange={setOpenFilter}>
          <SheetContent className="bg-white dark:bg-[#0c0c0e] border-l border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white p-6 w-80 sm:w-96 flex flex-col h-full justify-between select-none">
            <div>
              <SheetHeader className="text-left p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900">
                <SheetTitle className="text-sm font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={FilterIcon} className="size-4 text-brand" /> Scan Filters
                </SheetTitle>
                <SheetDescription className="text-xs text-zinc-550 dark:text-zinc-500 mt-1 leading-normal">
                  Narrow down scan logs by selecting specific dates or scan types.
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-grow overflow-y-auto">
                {renderFilterForm()}
              </div>
            </div>

            <SheetFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-end gap-2 shrink-0">
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="h-9.5 px-4 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Reset All
              </Button>
              <Button 
                onClick={applyFilters} 
                className="h-9.5 px-5 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
              >
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={openFilter} onOpenChange={setOpenFilter}>
          <DrawerContent className="bg-white dark:bg-[#0c0c0e] border-t border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white p-6 max-h-[85vh] flex flex-col justify-between select-none">
            <div className="flex-grow overflow-y-auto">
              <DrawerHeader className="text-left p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900">
                <DrawerTitle className="text-sm font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={FilterIcon} className="size-4 text-brand" /> Scan Filters
                </DrawerTitle>
                <DrawerDescription className="text-xs text-zinc-550 dark:text-zinc-500 mt-1 leading-normal">
                  Narrow down scan logs by selecting specific dates or scan types.
                </DrawerDescription>
              </DrawerHeader>
              
              {renderFilterForm()}
            </div>

            <DrawerFooter className="p-0 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex flex-row gap-2 mt-4 shrink-0">
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="flex-grow flex-1 h-9.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center"
              >
                Reset All
              </Button>
              <Button 
                onClick={applyFilters} 
                className="flex-grow flex-1 h-9.5 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center"
              >
                Apply Filters
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

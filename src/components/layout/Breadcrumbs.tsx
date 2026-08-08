import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOwnerVehicles } from '@/features/owners/owners.hooks';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { data: vehicleList } = useOwnerVehicles();

  // Create lookup map of vehicle UUIDs to license plates
  const vehicleMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (vehicleList) {
      vehicleList.forEach((v: any) => {
        map.set(v.id, v.vehicle_number);
      });
    }
    return map;
  }, [vehicleList]);

  const getDisplayName = (value: string) => {
    if (vehicleMap.has(value)) {
      return vehicleMap.get(value) || value;
    }
    // Check if it looks like a UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return `Vehicle (${value.slice(0, 8)})`;
    }
    return value.replace(/-/g, ' ');
  };

  const filteredPathnames = pathnames.filter(value => value !== 'dashboard');

  return (
    <Breadcrumb className="px-8 pt-5 select-none font-sans uppercase tracking-wider font-bold">
      <BreadcrumbList className="flex-wrap items-center">
        <BreadcrumbItem>
          <BreadcrumbLink 
            render={<Link to="/dashboard" />}
            className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-brand dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Workspace
          </BreadcrumbLink>
        </BreadcrumbItem>
        {filteredPathnames.length > 0 && <BreadcrumbSeparator className="text-zinc-350 dark:text-zinc-800 size-2.5 sm:size-3" />}

        {filteredPathnames.map((value, index) => {
          // Find original index in pathnames to construct URL correctly
          const originalIndex = pathnames.indexOf(value);
          const to = `/${pathnames.slice(0, originalIndex + 1).join('/')}`;
          const isLast = index === filteredPathnames.length - 1;
          const displayName = getDisplayName(value);

          return (
            <React.Fragment key={to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-zinc-800 dark:text-zinc-300 font-extrabold tracking-normal normal-case font-mono bg-zinc-100 dark:bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/40">
                    {displayName}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    render={<Link to={to} />}
                    className="text-zinc-400 dark:text-zinc-500 hover:text-brand dark:hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {displayName}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="text-zinc-350 dark:text-zinc-800 size-2.5 sm:size-3" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

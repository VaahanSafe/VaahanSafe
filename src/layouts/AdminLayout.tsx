import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import Navbar from '@/components/layout/Navbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import CommandPalette from '@/components/layout/CommandPalette';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export default function AdminLayout() {
  const [showBanner, setShowBanner] = useState(() => {
    return sessionStorage.getItem('vs_dismiss_admin_banner') !== 'true';
  });

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('vs_dismiss_admin_banner', 'true');
  };

  return (
    <SidebarProvider className="!min-h-0 h-screen">
      <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white font-sans overflow-hidden">
        
        {/* Visual Safety Barrier Banner - Dismissible Operator warning banner */}
        {showBanner && (
          <div className="bg-amber-500 text-zinc-950 font-mono text-[10px] font-extrabold tracking-widest px-4 py-1 uppercase select-none flex items-center justify-between shrink-0 z-50 transition-all">
            <div className="flex-1 text-center flex items-center justify-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} className="size-3.5 shrink-0 text-zinc-950" />
              <span>⚠ INTERNAL OPERATOR SYSTEM — HIGH ACCESS PRIVILEGES ENABLED — AUDITED SESSION</span>
            </div>
            <button
              onClick={handleDismissBanner}
              className="p-1 hover:bg-zinc-950/15 rounded text-zinc-950 transition-colors cursor-pointer flex items-center justify-center"
              title="Dismiss warning banner"
              aria-label="Dismiss banner"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 flex w-full overflow-hidden relative">
          {/* Dedicated Admin Sidebar */}
          <AdminSidebar />

          {/* Main page content panel */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top bar header */}
            <Navbar variant="app" />

            {/* Dynamic route path indicator */}
            <Breadcrumbs />

            {/* Scrollable layout panel */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              <ErrorBoundary scope="admin">
                <Outlet />
              </ErrorBoundary>
            </main>
          </div>

          {/* Global Shortcut Command Palette */}
          <CommandPalette />
        </div>
      </div>
    </SidebarProvider>
  );
}

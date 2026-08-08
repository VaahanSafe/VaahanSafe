import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Navbar from '@/components/layout/Navbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import CommandPalette from '@/components/layout/CommandPalette';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function DashboardLayout() {
  return (
    <SidebarProvider className="!min-h-0 h-screen">
      <div className="flex h-full w-full bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white font-sans overflow-hidden">
        {/* App Sidebar added from Shadcn block 07 */}
        <AppSidebar />

        {/* Main page content panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top bar header — shrink-0 keeps it pinned */}
          <Navbar variant="app" />

          {/* Dynamic route path indicator */}
          <Breadcrumbs />

          {/* Scrollable layout panel */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <ErrorBoundary scope="dashboard">
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>

        {/* Global Shortcut Command Palette */}
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}

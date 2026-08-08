import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import IdleTimeoutModal from '@/components/layout/IdleTimeoutModal';
import { authStore, useAuthStore } from '@/store/authStore';
import { useUITheme, applyThemeToDocument } from '@/store/uiStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { WifiOff01Icon } from '@hugeicons/core-free-icons';

export default function App() {
  const isOnline = useOnlineStatus();
  const { phone: loggedInPhone } = useAuthStore();
  const { theme } = useUITheme();

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const handleLogout = () => {
    authStore.logout();
  };

  return (
    <>
      {/* Persistent Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-600 dark:bg-amber-700 text-white text-[11px] font-extrabold text-center py-2.5 tracking-wider uppercase shadow-md select-none relative z-[9999] font-sans flex items-center justify-center gap-2">
          <HugeiconsIcon icon={WifiOff01Icon} className="size-4 animate-pulse shrink-0" />
          <span>You are currently offline. Re-establishing network link...</span>
        </div>
      )}

      {/* Idle Timeout Modal */}
      <IdleTimeoutModal 
        loggedInPhone={loggedInPhone} 
        onLogout={handleLogout} 
      />

      <Outlet />
    </>
  );
}

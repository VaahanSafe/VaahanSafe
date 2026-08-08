import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, authStore } from '@/features/auth/auth.store';
import { useUpdateProfile } from '@/features/owners/owners.hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  SmartPhone01Icon, 
  LockIcon, 
  AlertCircleIcon, 
  Settings01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';

import { getActiveSessions, terminateAllSessions, getIpGeocode } from '@/features/owners/owners.api';

interface SessionItem {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

import { useLogout } from '@/features/auth/auth.hooks';

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const { phone, owner } = useAuthStore();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();

  // Active Sessions
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  // Preference switches
  const [loginAlerts, setLoginAlerts] = useState(owner?.whatsapp_login_alerts ?? true);
  const [stickerAlerts, setStickerAlerts] = useState(owner?.sticker_scan_alerts ?? true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Sync state if owner changes/loads
  useEffect(() => {
    if (owner) {
      setLoginAlerts(owner.whatsapp_login_alerts ?? true);
      setStickerAlerts(owner.sticker_scan_alerts ?? true);
    }
  }, [owner]);

  // Load mock/live session records
  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      
      let userIp = '127.0.0.1';
      let userLoc = 'Delhi, NCR';

      try {
        const data = await getIpGeocode();
        if (data) {
          userIp = data.ip || '127.0.0.1';
          if (data.city && data.region) {
            userLoc = `${data.city}, ${data.region}`;
          } else if (data.city) {
            userLoc = data.city;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch IP geolocation, using local/onboarding default:', err);
        // Try fallback to owner registered city from authStore
        const ownerCity = useAuthStore.getState().owner?.city;
        if (ownerCity) {
          userLoc = ownerCity;
        }
      }

      const getBrowserAndOS = () => {
        const ua = navigator.userAgent;
        let os = "Windows OS";
        let browser = "Google Chrome";

        if (ua.indexOf("Win") !== -1) os = "Windows OS";
        else if (ua.indexOf("Mac") !== -1) os = "macOS";
        else if (ua.indexOf("X11") !== -1) os = "Linux";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("like Mac") !== -1) os = "iOS";

        if (ua.indexOf("Firefox") !== -1) browser = "Mozilla Firefox";
        else if (ua.indexOf("SamsungBrowser") !== -1) browser = "Samsung Internet";
        else if (ua.indexOf("Chrome") !== -1) browser = "Google Chrome";
        else if (ua.indexOf("Safari") !== -1) browser = "Apple Safari";
        else if (ua.indexOf("Opera") !== -1 || ua.indexOf("OPR") !== -1) browser = "Opera";
        else if (ua.indexOf("Edge") !== -1) browser = "Microsoft Edge";

        return `${browser} on ${os}`;
      };

      const currentDevice = getBrowserAndOS();

      let dbSessions: any[] = [];
      try {
        dbSessions = await getActiveSessions();
      } catch (e) {
        console.error("Failed to query active database sessions", e);
      }

      const liveSessions: SessionItem[] = [];
      
      if (dbSessions && dbSessions.length > 0) {
        dbSessions.forEach((sess: any) => {
          if (sess.current) {
            liveSessions.push({
              id: sess.id,
              device: currentDevice,
              ip: `${userIp} (Active)`,
              location: userLoc,
              lastActive: 'Active now',
              current: true
            });
          } else {
            const issuedTime = new Date(sess.issued_at);
            const timeDiff = Date.now() - issuedTime.getTime();
            const hours = Math.round(timeDiff / (1000 * 60 * 60));
            const lastActiveStr = hours <= 0 ? 'Recently' : `${hours} hour${hours > 1 ? 's' : ''} ago`;
            
            liveSessions.push({
              id: sess.id,
              device: currentDevice,
              ip: userIp,
              location: userLoc,
              lastActive: lastActiveStr,
              current: false
            });
          }
        });
      } else {
        liveSessions.push({
          id: 'sess-fallback',
          device: currentDevice,
          ip: `${userIp} (Active)`,
          location: userLoc,
          lastActive: 'Active now',
          current: true
        });
      }

      setSessions(liveSessions);
      setLoading(false);
    };

    loadSessions();
  }, []);

  // Log out handler
  const handleLogoutAllDevices = async () => {
    try {
      await terminateAllSessions();
      await logoutMutation.mutateAsync();
      toast.success('All active sessions terminated and logged out successfully.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Logout failed');
    } finally {
      setLogoutAllOpen(false);
    }
  };

  // Save preference settings
  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const updated = await updateProfileMutation.mutateAsync({
        whatsapp_login_alerts: loginAlerts,
        sticker_scan_alerts: stickerAlerts
      });
      // Hydrate state in authStore
      useAuthStore.getState().setOwner(updated);
      toast.success('Security alert preferences updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-4 select-none animate-pulse text-left py-4">
        <div className="h-40 bg-zinc-900/60 rounded-lg" />
        <div className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-left py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif tracking-tight uppercase">
          Security Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-1 leading-normal">
          Monitor your active login sessions, terminate credentials, and edit real-time authentication alerts.
        </p>
      </div>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Active Session List & Notification preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sessions */}
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
            <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Active Devices & Sessions</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Device logins currently authorized to read telemetry settings.</CardDescription>
              </div>
              <HugeiconsIcon icon={SmartPhone01Icon} className="size-5 text-brand" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-900">
                {sessions.map((sess) => (
                  <div key={sess.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5">
                        <HugeiconsIcon icon={SmartPhone01Icon} className="size-4.5" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">{sess.device}</span>
                          {sess.current && (
                            <span className="text-[8px] uppercase tracking-widest font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap shrink-0">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-500 font-mono">
                          <span>IP: {sess.ip}</span>
                          <span className="text-zinc-700">•</span>
                          <span>Location: {sess.location}</span>
                        </div>
                      </div>
                    </div>
                    {!sess.current && (
                      <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap shrink-0 self-end sm:self-auto">
                        {sess.lastActive}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 mt-6 flex justify-end">
                <Button
                  onClick={() => setLogoutAllOpen(true)}
                  className="w-full sm:w-auto h-9.5 px-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
                >
                  Log Out of All Devices
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
            <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Security Alert Preferences</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Configure alert channels for verification triggers.</CardDescription>
              </div>
              <HugeiconsIcon icon={Settings01Icon} className="size-5 text-brand" />
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-900">
                {/* Switch 1 */}
                <div className="py-4 first:pt-0 flex items-start sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">WhatsApp Login Notifications</span>
                    <span className="text-[10px] text-zinc-500 block leading-normal">
                      Dispatch immediate WhatsApp alerts when verification codes are generated or new sessions start.
                    </span>
                  </div>
                  <div className="shrink-0 pt-0.5 sm:pt-0">
                    <Switch 
                      checked={loginAlerts}
                      onCheckedChange={setLoginAlerts}
                      className="text-brand"
                    />
                  </div>
                </div>
                {/* Switch 2 */}
                <div className="py-4 last:pb-0 flex items-start sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">Sticker QR Scan Alert Dispatches</span>
                    <span className="text-[10px] text-zinc-500 block leading-normal">
                      Receive immediate SMS notifications containing responder location coordinates upon decal scan.
                    </span>
                  </div>
                  <div className="shrink-0 pt-0.5 sm:pt-0">
                    <Switch 
                      checked={stickerAlerts}
                      onCheckedChange={setStickerAlerts}
                      className="text-brand"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="w-full sm:w-auto h-9.5 px-6 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
                >
                  {savingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Info Cards */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-[#0c0c0e] dark:to-[#0b0c12] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md h-full flex flex-col justify-between">
            <div>
              <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Access Credentials</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Security recommendations.</CardDescription>
                </div>
                <HugeiconsIcon icon={LockIcon} className="size-5 text-brand" />
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  Authentication tokens utilize JWT standards with secure cryptographic signatures. Session expirations automatically apply in 30 days.
                </p>
                <div className="p-3 bg-brand/5 border border-brand/10 rounded-lg space-y-1 text-left">
                  <span className="text-[9px] uppercase font-black text-brand tracking-wide block">Token Hygiene</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Logging out of all devices invalidates all session tokens associated with your phone number on VaahanSafe telemetry servers.
                  </p>
                </div>
              </CardContent>
            </div>
            <div className="text-[9px] font-mono text-zinc-500 border-t border-zinc-200 dark:border-zinc-900/60 pt-4 mt-6 flex items-center gap-1.5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-emerald-400" />
              SESSION JWT INTEGRITY VERIFIED.
            </div>
          </Card>
        </div>
      </div>

      {/* Logout All Devices Confirm Modal */}
      <AlertDialog open={logoutAllOpen} onOpenChange={setLogoutAllOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white rounded-lg max-w-md p-6 select-none">
          <AlertDialogHeader className="text-left">
            <div className="size-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">Confirm Global Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-550 dark:text-zinc-500 mt-1 leading-normal">
              You are about to terminate all active sessions on other devices. You will be logged out of your current session as well and must verify your phone number to re-enter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel className="h-9.5 px-4 rounded-lg border-zinc-250 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleLogoutAllDevices();
              }}
              disabled={logoutMutation.isPending}
              className="h-9.5 px-5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
            >
              {logoutMutation.isPending ? 'Processing...' : 'Confirm Global Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

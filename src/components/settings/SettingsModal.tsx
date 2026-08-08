import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '@/lib/http/apiClient';
import { db } from '@/services/db';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Settings01Icon, 
  CheckmarkBadgeIcon, 
  CreditCardIcon, 
  NotificationIcon, 
  Cancel01Icon,
  SmartPhone01Icon,
  LockIcon,
  HelpCircleIcon,
  Shield01Icon,
  LogoutIcon,
  Sun01Icon,
  MoonIcon,
  ComputerIcon,
  CheckmarkCircle02Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { useUITheme } from '@/store/uiStore';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useAuthStore as usePersistedStore } from '@/features/auth/auth.store';
import { loadRazorpayScript } from '@/lib/payments';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  updateProfile, 
  getActiveSessions, 
  terminateAllSessions, 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification, 
  clearAllNotifications,
  requestDeletion
} from '@/features/owners/owners.api';
import { useOwnerVehicles, useUpdateProfile } from '@/features/owners/owners.hooks';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import { renewSubscription } from '@/features/vehicles/vehicles.api';
import { env } from '@/config/env';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'general' | 'security' | 'billing' | 'notifications' | 'privacy';
}

const maskPhoneNumberVal = (phoneNum: string) => {
  if (!phoneNum) return '';
  const cleaned = phoneNum.trim();
  
  if (cleaned.includes('*')) {
    return cleaned.replace(/\*/g, '•');
  }
  
  if (cleaned.length < 5) return cleaned;
  
  let prefix = '';
  let core = cleaned;
  
  if (cleaned.startsWith('+')) {
    const parts = cleaned.split(' ');
    if (parts.length > 1) {
      prefix = parts[0] + ' ';
      core = parts.slice(1).join(' ');
    } else {
      prefix = cleaned.slice(0, 3) + ' ';
      core = cleaned.slice(3);
    }
  }
  
  if (core.length < 4) return cleaned;
  
  const firstTwo = core.slice(0, 2);
  const lastTwo = core.slice(-2);
  const maskedLength = core.length - 4;
  const masks = '•'.repeat(maskedLength > 0 ? maskedLength : 4);
  
  return `${prefix}${firstTwo}${masks}${lastTwo}`;
};

export default function SettingsModal({ isOpen, onClose, defaultTab = 'general' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'billing' | 'notifications' | 'privacy'>(defaultTab);
  const { owner } = useAuthStore();
  const phone = owner?.phone_number || '';
  const queryClient = useQueryClient();
  const { theme, setTheme } = useUITheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const [fullName, setFullName] = useState(owner?.full_name || owner?.name || '');
  const [email, setEmail] = useState(owner?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Tab 2: Security & Alert preferences
  const [loginAlerts, setLoginAlerts] = useState(owner?.whatsapp_login_alerts ?? true);
  const [stickerAlerts, setStickerAlerts] = useState(owner?.sticker_scan_alerts ?? true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Tab 3: Billing & Vehicles list
  const { data: vehicles, isLoading: vehiclesLoading } = useOwnerVehicles();

  // Tab 4: Notifications queue
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Tab sync effect
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setIsUpgrading(false);
    }
  }, [isOpen, defaultTab]);

  // Billing upgrade states
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium'>('premium');
  const [showMockCheckout, setShowMockCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [mockOrderId, setMockOrderId] = useState('');
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Privacy toggles state
  const [maskPhoneNumber, setMaskPhoneNumber] = useState(owner?.mask_phone_number ?? true);
  const [emergencyOnlyContacts, setEmergencyOnlyContacts] = useState(owner?.restrict_emergency_contacts ?? false);
  const [analyticsConsent, setAnalyticsConsent] = useState(owner?.analytics_consent ?? true);
  const [marketingConsent, setMarketingConsent] = useState(owner?.marketing_consent ?? false);

  // Sync state when owner prop updates
  useEffect(() => {
    if (owner) {
      setFullName(owner.full_name || owner.name || '');
      setEmail(owner.email || '');
      setLoginAlerts(owner.whatsapp_login_alerts ?? true);
      setStickerAlerts(owner.sticker_scan_alerts ?? true);
      setMaskPhoneNumber(owner.mask_phone_number ?? true);
      setEmergencyOnlyContacts(owner.restrict_emergency_contacts ?? false);
      setAnalyticsConsent(owner.analytics_consent ?? true);
      setMarketingConsent(owner.marketing_consent ?? false);
    }
  }, [owner]);

  // Load tab-specific data
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'security') {
      loadSessions();
    } else if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [activeTab, isOpen]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await getActiveSessions();
      // Map sessions to user agent details
      const parsed = data.map((sess: any) => {
        const ua = sess.user_agent || "";
        let os = "Linux";
        let browser = "Chrome";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Macintosh")) os = "macOS";
        else if (ua.includes("iPhone")) os = "iOS";
        else if (ua.includes("Android")) os = "Android";

        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";

        return {
          id: sess.id,
          device: `${browser} on ${os}`,
          ip: sess.ip_address || "127.0.0.1",
          location: sess.location_city ? `${sess.location_city}, ${sess.location_country || 'IN'}` : "Local Development Session",
          current: sess.current,
          lastActive: "Active now"
        };
      });
      setSessions(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await getNotifications();
      const formatted = data.map((n: any) => {
        const created = new Date(n.created_at);
        const diff = Date.now() - created.getTime();
        const hrs = Math.round(diff / (1000 * 60 * 60));
        let relativeTime = 'Just now';
        if (hrs > 0) {
          if (hrs >= 24) {
            const days = Math.round(hrs / 24);
            relativeTime = `${days} day${days > 1 ? 's' : ''} ago`;
          } else {
            relativeTime = `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
          }
        }
        return {
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: relativeTime,
          unread: n.unread
        };
      });
      setNotifications(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        full_name: fullName,
        email: email
      });
      // Synchronize both stores
      useAuthStore.getState().setOwner({
        ...useAuthStore.getState().owner!,
        full_name: updated.full_name,
        email: updated.email
      });
      usePersistedStore.getState().setOwner(updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.profile() });
      toast.success('Profile details updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAlerts = async (newLoginAlerts: boolean, newStickerAlerts: boolean) => {
    setSavingPrefs(true);
    try {
      const updated = await updateProfile({
        whatsapp_login_alerts: newLoginAlerts,
        sticker_scan_alerts: newStickerAlerts
      });
      // Synchronize both stores
      useAuthStore.getState().setOwner({
        ...useAuthStore.getState().owner!,
        whatsapp_login_alerts: updated.whatsapp_login_alerts,
        sticker_scan_alerts: updated.sticker_scan_alerts
      });
      usePersistedStore.getState().setOwner(updated);
      toast.success('Security alerts updated successfully.');
    } catch (err: any) {
      toast.error('Failed to save security preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSavePrivacy = async (
    newMaskPhone: boolean,
    newRestrictContacts: boolean,
    newAnalyticsConsent: boolean,
    newMarketingConsent: boolean
  ) => {
    try {
      const updated = await updateProfile({
        mask_phone_number: newMaskPhone,
        restrict_emergency_contacts: newRestrictContacts,
        analytics_consent: newAnalyticsConsent,
        marketing_consent: newMarketingConsent
      });
      // Synchronize both stores
      useAuthStore.getState().setOwner({
        ...useAuthStore.getState().owner!,
        mask_phone_number: updated.mask_phone_number,
        restrict_emergency_contacts: updated.restrict_emergency_contacts,
        analytics_consent: updated.analytics_consent,
        marketing_consent: updated.marketing_consent
      });
      usePersistedStore.getState().setOwner(updated);
      toast.success('Privacy preferences updated successfully.');
    } catch (err: any) {
      toast.error('Failed to save privacy preferences.');
    }
  };

  const handleTerminateSessions = () => {
    setShowTerminateConfirm(true);
  };

  const executeTerminateSessions = async () => {
    try {
      await terminateAllSessions();
      toast.success('All other sessions terminated successfully.');
      loadSessions();
    } catch (err: any) {
      toast.error('Failed to terminate sessions.');
    }
  };

  const handleRenewSubscription = async (vehicleId: string) => {
    try {
      const order = await renewSubscription(vehicleId);
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "VaahanSafe",
        description: "Windshield Protection Renewal",
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            await apiClient.post('/payments/verify', {
              razorpay_order_id: order.order_id,
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_signature: response?.razorpay_signature
            });
            
            toast.success("Subscription renewed successfully!");
            
            // Sync status to local storage as well
            const match = db.getVehicles().find(v => v.id === vehicleId);
            if (match) {
              db.updateVehicle(vehicleId, {
                status: 'active',
                expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
              });
            }
          } catch (verifyErr: any) {
            console.error('Failed to verify renewal signature:', verifyErr);
            toast.error(verifyErr?.response?.data?.message || 'Verification failed. Subscription remains pending.');
          }
          queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list() });
        },
        prefill: {
          contact: phone || '',
          email: email || '',
        },
        theme: {
          color: "#ff7a00",
        }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Renewal order generation failed.");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
      toast.success('All notifications marked as read.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.success('Cleared all notifications.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessUpgrade = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay Payment Gateway script');
      }

      const options = {
        key: 'rzp_test_SvtW8YTEDKQlBp',
        amount: selectedTier === 'premium' ? 99900 : 49900,
        currency: 'INR',
        name: 'VaahanSafe',
        description: `Upgrade Plan: ${selectedTier.toUpperCase()}`,
        handler: function () {
          completeUpgrade();
        },
        prefill: {
          contact: phone || '',
          email: email || '',
        },
        theme: {
          color: '#ff7a00'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error('Failed to open Razorpay checkout widget.');
    }
  };

  const completeUpgrade = () => {
    if (!owner) return;
    const updatedOwner = {
      ...owner,
      tier: selectedTier,
    };
    useAuthStore.getState().setOwner(updatedOwner);
    usePersistedStore.getState().setOwner(updatedOwner as any);
    toast.success(`Account successfully upgraded to ${selectedTier.toUpperCase()} Protection!`);
    setIsUpgrading(false);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      profile: {
        id: owner?.id,
        name: fullName,
        email: email,
        phone: phone,
        tier: owner?.tier,
        role: owner?.role,
      },
      vehicles: vehicles || [],
      privacySettings: {
        maskPhoneNumber,
        emergencyOnlyContacts,
        analyticsConsent,
        marketingConsent
      },
      exportedAt: new Date().toISOString()
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `vaahansafe_data_export_${owner?.id || 'profile'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Data archive generated and download started.');
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  const executeDeleteRequest = async () => {
    try {
      await requestDeletion();
      toast.success("Data deletion request registered. Logging you out...");
      onClose();
      setTimeout(() => {
        useAuthStore.getState().logout();
        usePersistedStore.getState().logoutStore();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to register deletion request.");
    }
  };

  if (!isOpen || !mounted || !document.body) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0e0e11] border-0 md:border md:border-zinc-200 dark:border-zinc-800 rounded-none md:rounded-lg w-full max-w-full md:max-w-4xl h-full md:h-[80vh] flex flex-col md:flex-row overflow-hidden text-zinc-800 dark:text-zinc-200 font-sans shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button (Desktop) */}
        <button 
          onClick={onClose} 
          className="hidden md:block absolute top-4 right-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer z-10"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
        </button>

        {/* Mobile Header & Horizontal Scroll Tab Bar */}
        <div className="block md:hidden bg-zinc-50 dark:bg-[#070709] border-b border-zinc-200 dark:border-zinc-800 select-none shrink-0">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Settings</span>
            <button 
              onClick={onClose} 
              className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
            </button>
          </div>
          
          <div className="flex overflow-x-auto scrollbar-none gap-2 px-5 pb-4 scroll-smooth">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'general' 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'security' 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850'
              }`}
            >
              Security & Alerts
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'billing' 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850'
              }`}
            >
              Billing & Plans
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'notifications' 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'privacy' 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850'
              }`}
            >
              Privacy & Data
            </button>
          </div>
        </div>

        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex w-60 bg-zinc-50 dark:bg-[#070709] border-r border-zinc-200 dark:border-zinc-800 p-6 flex-col justify-between shrink-0 select-none">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2 px-3">Settings</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'general' 
                      ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-white' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <HugeiconsIcon icon={Settings01Icon} className="size-4 shrink-0" />
                  General Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'security' 
                      ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-white' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <HugeiconsIcon icon={LockIcon} className="size-4 shrink-0" />
                  Security & Alerts
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'billing' 
                      ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-white' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <HugeiconsIcon icon={CreditCardIcon} className="size-4 shrink-0" />
                  Billing & Plans
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2 px-3">Customize</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'notifications' 
                      ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-white' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <HugeiconsIcon icon={NotificationIcon} className="size-4 shrink-0" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'privacy' 
                      ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-white' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <HugeiconsIcon icon={Shield01Icon} className="size-4 shrink-0" />
                  Privacy & Data
                </button>
              </div>
            </div>
          </div>



          {/* User badge & Logout */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="size-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {fullName.slice(0, 2) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-tight">{fullName || 'Owner'}</p>
                <p className="text-[10px] text-zinc-550 dark:text-zinc-500 truncate mt-0.5">{maskPhoneNumberVal(owner?.phone || phone || '')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  useAuthStore.getState().logout();
                  usePersistedStore.getState().logoutStore();
                }, 300);
              }}
              className="text-zinc-500 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer shrink-0"
              title="Logout"
            >
              <HugeiconsIcon icon={LogoutIcon} className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-50/50 dark:bg-[#0b0b0d] p-5 md:p-8 overflow-y-auto flex flex-col text-zinc-800 dark:text-zinc-200">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-xl text-left">
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight font-serif">General Profile</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-550 mt-1">Manage user contact details and profile preferences.</p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
                <div className="size-12 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-base uppercase">
                  {fullName.slice(0, 1) || 'U'}
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">Profile Avatar</span>
                  <span className="text-[10px] text-zinc-550 dark:text-zinc-500 block mt-0.5">Custom avatars can be provisioned using linked emails.</span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-brand transition-colors"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-brand transition-colors"
                      placeholder="secure@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Phone Number (Locked)</label>
                    <input
                      type="text"
                      value={maskPhoneNumberVal(owner?.phone || phone || '')}
                      disabled
                      className="w-full bg-zinc-100 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="h-9 px-6 bg-brand hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    {savingProfile ? 'Saving Details...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-6" />

              {/* Preferences Section */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500">Preferences</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Appearance</span>
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        theme === 'system' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="System Theme"
                    >
                      <HugeiconsIcon icon={ComputerIcon} className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        theme === 'light' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Light Theme"
                    >
                      <HugeiconsIcon icon={Sun01Icon} className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        theme === 'dark' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Dark Theme"
                    >
                      <HugeiconsIcon icon={MoonIcon} className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight font-serif">Security & Alerts</h2>
                <p className="text-xs text-zinc-550 mt-1">Configure real-time alerts and manage active browser session channels.</p>
              </div>

              {/* Switches */}
              <div className="p-5 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500 block mb-1">Alert Channels</span>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                  <div className="py-3 first:pt-0 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">WhatsApp Login Notifications</span>
                      <span className="text-[10px] text-zinc-550 dark:text-zinc-500 mt-0.5 block leading-relaxed">
                        Dispatch instantaneous WhatsApp alerts when security codes are generated or sessions begin.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={loginAlerts}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setLoginAlerts(val);
                        handleSaveAlerts(val, stickerAlerts);
                      }}
                      className="accent-brand size-4.5 cursor-pointer rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div className="py-3 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">Sticker QR Scan Alerts</span>
                      <span className="text-[10px] text-zinc-550 dark:text-zinc-500 mt-0.5 block leading-relaxed">
                        Receive instant SMS dispatches with coordinates whenever your decal sticker is scanned.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={stickerAlerts}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setStickerAlerts(val);
                        handleSaveAlerts(loginAlerts, val);
                      }}
                      className="accent-brand size-4.5 cursor-pointer rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500">Active Authorized Sessions</span>
                  <button
                    onClick={handleTerminateSessions}
                    className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 cursor-pointer tracking-wider transition-colors"
                  >
                    Log Out of All Other Devices
                  </button>
                </div>

                {sessionsLoading ? (
                  <div className="h-20 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100/30 dark:bg-zinc-900/10 overflow-hidden">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="p-4 flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                            <HugeiconsIcon icon={SmartPhone01Icon} className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">{sess.device}</span>
                              {sess.current && (
                                <span className="text-[8px] uppercase tracking-widest font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mt-1 block">IP: {sess.ip} • {sess.location}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-650 font-mono">{sess.lastActive}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
              {isUpgrading ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight font-serif">Upgrade Protection Membership</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-550 mt-1">Select a pricing plan tier to upgrade your VaahanSafe account.</p>
                    </div>
                    <button
                      onClick={() => setIsUpgrading(false)}
                      className="text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/30"
                    >
                      ← Back to Billing
                    </button>
                  </div>

                  {/* Plan comparison cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Card */}
                    <div 
                      onClick={() => setSelectedTier('basic')}
                      className={`p-5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedTier === 'basic' 
                          ? 'border-brand bg-brand/5 shadow-md shadow-brand/5' 
                          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0e0e11] hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-zinc-450 dark:text-zinc-400">Basic Protect</span>
                          {selectedTier === 'basic' && <HugeiconsIcon icon={CheckmarkBadgeIcon} className="size-4 text-brand" />}
                        </div>
                        <div>
                          <span className="text-2xl font-black text-zinc-900 dark:text-white font-serif">₹499</span>
                          <span className="text-[10px] text-zinc-500 ml-1">/ year per vehicle</span>
                        </div>
                        <ul className="text-[11px] text-zinc-600 dark:text-zinc-450 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Emergency scan redirection
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Unlimited standard scan alerts
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> SMS & WhatsApp notifications
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Premium Card */}
                    <div 
                      onClick={() => setSelectedTier('premium')}
                      className={`p-5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                        selectedTier === 'premium' 
                          ? 'border-brand bg-brand/5 shadow-md shadow-brand/5' 
                          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0e0e11] hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-brand text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                        Recommended
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-brand">Premium Shield</span>
                          {selectedTier === 'premium' && <HugeiconsIcon icon={CheckmarkBadgeIcon} className="size-4 text-brand" />}
                        </div>
                        <div>
                          <span className="text-2xl font-black text-zinc-900 dark:text-white font-serif">₹999</span>
                          <span className="text-[10px] text-zinc-500 ml-1">/ year per vehicle</span>
                        </div>
                        <ul className="text-[11px] text-zinc-600 dark:text-zinc-450 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Everything in Basic
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Masked mobile call redirection
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> QR Code verification & diagnostics
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Medical Profile Emergency Gate
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleProcessUpgrade}
                      className="h-10 px-6 bg-brand hover:bg-brand/90 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand/10"
                    >
                      Upgrade to {selectedTier === 'premium' ? 'Premium Shield' : 'Basic Protect'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-start">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight font-serif">Billing & Subscription</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-550 mt-1">Manage active plans and renew protection subscriptions for your decals.</p>
                  </div>

                  {/* Current Membership Plan Card */}
                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0e0e11] rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-widest text-brand">Current Membership Plan</span>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white capitalize">{owner?.tier || 'Free'} Plan</h3>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {owner?.tier === 'premium' 
                          ? 'You have complete coverage, including medical emergencies and wrong parking alerts.'
                          : owner?.tier === 'basic'
                          ? 'You have basic vehicle owner lookup capabilities.'
                          : 'Upgrade to VaahanSafe Premium for full protection, including priority scans and premium support.'}
                      </p>
                    </div>
                    {owner?.tier !== 'premium' && (
                      <button 
                        onClick={() => {
                          setSelectedTier(owner?.tier === 'basic' ? 'premium' : 'basic');
                          setIsUpgrading(true);
                        }}
                        className="shrink-0 h-10 px-5 bg-brand hover:bg-brand/90 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand/10"
                      >
                        Upgrade Plan
                      </button>
                    )}
                  </div>

                  {/* Vehicle overview list */}
                  <div className="space-y-4 pt-2">
                    {vehiclesLoading ? (
                      <div className="space-y-3">
                        <div className="h-16 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                        <div className="h-16 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                      </div>
                    ) : !vehicles || vehicles.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100/10 dark:bg-zinc-900/5">
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">No Active Vehicles Registered</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-650 mt-1">Register a new windshield decal sticker to view subscription billing logs.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 text-left">
                        <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500">Subscription Fleet Overview</span>
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100/30 dark:bg-zinc-900/10 overflow-hidden">
                          {vehicles.map((v) => (
                            <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                              <div>
                                <div className="flex items-center gap-2 text-left">
                                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{v.licensePlate || (v as any).license_plate}</span>
                                  <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                                    v.subscription_status === 'active'
                                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                      : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                  }`}>
                                    {v.subscription_status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">Renewal Date: {v.renewal_date || 'N/A'} • Coverage Tier: {v.tier.toUpperCase()}</p>
                              </div>
                              
                              <button
                                onClick={() => handleRenewSubscription(v.id)}
                                className="h-8.5 px-4 bg-brand hover:opacity-90 text-white text-[10px] font-black uppercase rounded-lg tracking-wider cursor-pointer"
                              >
                                Renew Protection
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight font-serif">Notifications Centre</h2>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleMarkAllRead}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center"
                        title="Mark All Read"
                      >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4.5" />
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="p-1 rounded-lg text-red-500 hover:text-red-400 hover:bg-zinc-150 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center"
                        title="Clear All Notifications"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-4.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-555">Review enqueued alerts, system updates, and dispatch history details.</p>
              </div>

              <div className="flex-1 mt-6 overflow-y-auto min-h-[30vh]">
                {notifLoading ? (
                  <div className="space-y-3">
                    <div className="h-14 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                    <div className="h-14 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100/10 dark:bg-zinc-900/5 h-full flex flex-col items-center justify-center">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">No Active Notifications</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-650 mt-1">Alert logs triggered by sticker scans will appear here reactively.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 rounded-lg border relative transition-all flex items-start justify-between gap-4 ${
                          n.unread
                            ? 'bg-brand/[0.02] border-brand/20'
                            : 'bg-zinc-100/30 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900'
                        }`}
                      >
                        {n.unread && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand rounded-l-lg" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">{n.title}</span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {n.unread && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="p-1 rounded-lg text-brand hover:bg-brand/10 transition-all cursor-pointer flex items-center justify-center"
                              title="Mark as Read"
                            >
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(n.id)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-150 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center"
                            title="Dismiss Notification"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight font-serif">Privacy & Data Controls</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-550 mt-1">Manage what information is displayed during emergency windshield scans and handle your data portability rights.</p>
              </div>

              <div className="flex-1 mt-6 overflow-y-auto space-y-6 pr-2">
                {/* Profile Display Toggles */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500">Scan & Redirection Privacy</span>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100/30 dark:bg-zinc-900/10 overflow-hidden">
                    {/* Toggle 1: Mask Mobile number */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-zinc-900 dark:text-white block">Mask Mobile Number</label>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-455 block leading-normal">
                          Enable masked voice redirection to prevent vehicle scanners from viewing your personal mobile number.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const nextVal = !maskPhoneNumber;
                          setMaskPhoneNumber(nextVal);
                          handleSavePrivacy(nextVal, emergencyOnlyContacts, analyticsConsent, marketingConsent);
                        }}
                        className={`w-10 h-6 flex items-center rounded-lg p-0.5 transition-colors cursor-pointer shrink-0 ${
                          maskPhoneNumber ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-lg shadow-md transform transition-transform duration-200 ${
                            maskPhoneNumber ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 2: Show emergency contacts only during medical scan */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-zinc-900 dark:text-white block">Restrict Emergency Contacts</label>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-455 block leading-normal">
                          Only display your alternate emergency phone contacts when scanning a decal in active medical mode.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const nextVal = !emergencyOnlyContacts;
                          setEmergencyOnlyContacts(nextVal);
                          handleSavePrivacy(maskPhoneNumber, nextVal, analyticsConsent, marketingConsent);
                        }}
                        className={`w-10 h-6 flex items-center rounded-lg p-0.5 transition-colors cursor-pointer shrink-0 ${
                          emergencyOnlyContacts ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-lg shadow-md transform transition-transform duration-200 ${
                            emergencyOnlyContacts ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Consent and Sharing */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500">Data Consent & Sharing</span>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100/30 dark:bg-zinc-900/10 overflow-hidden">
                    {/* Toggle 3: Analytics Sharing */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-zinc-900 dark:text-white block">Share Diagnostic Logs</label>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-455 block leading-normal">
                          Allow sharing anonymous scan statistics to help us optimize server response times and alert delivery speeds.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const nextVal = !analyticsConsent;
                          setAnalyticsConsent(nextVal);
                          handleSavePrivacy(maskPhoneNumber, emergencyOnlyContacts, nextVal, marketingConsent);
                        }}
                        className={`w-10 h-6 flex items-center rounded-lg p-0.5 transition-colors cursor-pointer shrink-0 ${
                          analyticsConsent ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-lg shadow-md transform transition-transform duration-200 ${
                            analyticsConsent ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 4: Marketing WhatsApp */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-zinc-900 dark:text-white block">Marketing & Newsletter Alerts</label>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-455 block leading-normal">
                          Opt in to receive occasional road safety tips, product updates, and membership discount codes via WhatsApp.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const nextVal = !marketingConsent;
                          setMarketingConsent(nextVal);
                          handleSavePrivacy(maskPhoneNumber, emergencyOnlyContacts, analyticsConsent, nextVal);
                        }}
                        className={`w-10 h-6 flex items-center rounded-lg p-0.5 transition-colors cursor-pointer shrink-0 ${
                          marketingConsent ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-lg shadow-md transform transition-transform duration-200 ${
                            marketingConsent ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Portability (SaaS standard under DPDP) */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 dark:text-zinc-500">Account Portability & Erasure</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Export Card */}
                    <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-950/20 rounded-lg space-y-3 flex flex-col justify-between text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Export Profile Data Archive</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal">
                          Download a portable copy of your account profile metadata, registered fleet vehicles, and settings configurations in standard JSON format.
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="h-8.5 w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-white text-zinc-700 dark:text-zinc-300 text-[10px] font-black uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                      >
                        Request Data Archive
                      </button>
                    </div>

                    {/* Delete Card */}
                    <div className="p-5 border border-red-200 dark:border-red-950/30 bg-red-50/10 dark:bg-red-950/[0.02] rounded-lg space-y-3 flex flex-col justify-between text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-red-550 dark:text-red-500">Request Permanent Deletion</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal">
                          Queue your owner account and registered QR decals for permanent purging. Under the DPDP Act, data is completely anonymised within 30 days.
                        </p>
                      </div>
                      <button
                        onClick={handleDeleteRequest}
                        className="h-8.5 w-full bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-900/20 hover:border-red-300 dark:hover:border-red-800 text-red-650 dark:text-red-500 text-[10px] font-black uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                      >
                        Delete My Profile Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Razorpay Simulator Overlay */}
        {showMockCheckout && (
          <div className="absolute inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200 text-left">
            <div className="bg-[#0f0f12] border border-zinc-800 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Razorpay Header */}
              <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-brand flex items-center justify-center text-white text-[10px] font-black">VS</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">VaahanSafe Sandbox</h4>
                    <p className="text-[9px] text-zinc-500">Secured via Razorpay</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-[#ff7a00] font-black bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                  Demo Sandbox
                </span>
              </div>

              {/* Sandbox details */}
              <div className="p-6 space-y-6 text-left">
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
                    <span>Order reference</span>
                    <span>Amount due</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-zinc-300">{mockOrderId}</span>
                    <span className="text-base font-mono font-black text-white">
                      ₹{selectedTier === 'premium' ? '999.00' : '499.00'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Mock Payment Gateway Handoff</label>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    In production, this launches the Razorpay web overlay checkout. For local sandbox mode, select below to complete transaction:
                  </p>
                </div>

                {/* Action options */}
                <div className="space-y-2.5 pt-2">
                  <button 
                    onClick={async () => {
                      setCheckoutLoading(true);
                      setTimeout(() => {
                        setCheckoutLoading(false);
                        setShowMockCheckout(false);
                        completeUpgrade();
                      }, 1200);
                    }}
                    disabled={checkoutLoading}
                    className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-white text-xs shadow-lg uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {checkoutLoading ? (
                      <>
                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-lg animate-spin" />
                        <span>AUTHORIZING FUNDS...</span>
                      </>
                    ) : (
                      <span>SIMULATE SUCCESSFUL PAYMENT</span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowMockCheckout(false);
                      setCheckoutLoading(false);
                    }}
                    disabled={checkoutLoading}
                    className="w-full h-10 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 bg-transparent text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center"
                  >
                    Cancel and Fail Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <AlertDialog open={showTerminateConfirm} onOpenChange={setShowTerminateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Active Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out all other active devices? You will remain logged in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeTerminateSessions}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              WARNING: This will permanently delete your VaahanSafe account and all associated vehicles. In compliance with DPDP, your data will be anonymised or permanently erased within 30 days. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteRequest} className="bg-red-600 hover:bg-red-700 text-white border-transparent">Delete Profile</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>,
    document.body
  );
}

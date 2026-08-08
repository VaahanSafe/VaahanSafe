import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { 
  Notification03Icon, 
  AlertCircleIcon, 
  Car01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '@/features/owners/owners.api';

interface NotificationItem {
  id: string;
  type: 'system' | 'broadcast' | 'sticker';
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'system' | 'broadcast' | 'sticker'>('all');

  const fetchNotifications = async () => {
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
      console.error("Failed to fetch notifications from database", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark single item as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: false } : n
      ));
      toast.success('Alert marked as read.');
    } catch (e) {
      toast.error('Failed to mark notification as read.');
    }
  };

  // Dismiss single item
  const handleDismiss = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification dismissed.');
    } catch (e) {
      toast.error('Failed to dismiss notification.');
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
      toast.success('All notifications marked as read.');
    } catch (e) {
      toast.error('Failed to mark all notifications as read.');
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.success('Clearance queue executed.');
    } catch (e) {
      toast.error('Failed to clear notifications.');
    }
  };

  const filteredNotifications = notifications.filter(n => 
    activeFilter === 'all' ? true : n.type === activeFilter
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'system': return AlertCircleIcon;
      case 'sticker': return Car01Icon;
      default: return Notification03Icon;
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-4 select-none animate-pulse text-left py-4">
        <div className="h-40 bg-zinc-950/20 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-left py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif tracking-tight uppercase">
            Notification Centre
          </h1>
          <p className="text-xs text-zinc-500 mt-1 leading-normal">
            Review delivery status updates, expiry indicators, and system broadcasts.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMarkAllRead}
              className="h-8 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-[10px] font-black uppercase rounded-lg tracking-wider cursor-pointer"
            >
              Mark all read
            </Button>
            <Button
              onClick={handleClearAll}
              className="h-8 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-lg tracking-wider cursor-pointer"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {(['all', 'system', 'sticker', 'broadcast'] as const).map((filter) => {
          const count = filter === 'all' 
            ? notifications.length 
            : notifications.filter(n => n.type === filter).length;
          
          return (
            <Button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`h-8 px-4 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-colors cursor-pointer ${
                activeFilter === filter
                  ? 'bg-brand text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {filter} ({count})
            </Button>
          );
        })}
      </div>

      {/* Notification Lists */}
      <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
        <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Active Broadcast Queue</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Live operational alerts enqueued for your account.</CardDescription>
          </div>
          <HugeiconsIcon icon={Notification03Icon} className="size-5 text-brand" />
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
              <HugeiconsIcon icon={Notification03Icon} className="size-8 text-zinc-650 dark:text-zinc-600 mx-auto mb-2 animate-pulse" />
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">No Active Notifications</span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2 max-w-xs mx-auto">
                All logs cleared. System advisories or package tracking logs will populate here dynamically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-lg border relative transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    n.unread
                      ? 'bg-brand/[0.03] dark:bg-zinc-900/10 border-[#ff7a00]/25 shadow-[0_0_12px_rgba(255,122,0,0.02)]'
                      : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900'
                  }`}
                >
                  {/* Amber unread strip */}
                  {n.unread && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand rounded-l-lg" />
                  )}

                  <div className="flex gap-3 text-left">
                    <div className={`size-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      n.unread 
                        ? 'bg-brand/10 border-brand/20 text-brand' 
                        : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-500'
                    }`}>
                      <HugeiconsIcon icon={getIcon(n.type)} className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">{n.title}</span>
                        <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1.5">{n.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end sm:justify-start">
                    {n.unread && (
                      <Button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="h-7 w-7 p-0 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg flex items-center justify-center cursor-pointer"
                        title="Mark as Read"
                      >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDismiss(n.id)}
                      className="h-7 w-7 p-0 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-550 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded-lg flex items-center justify-center cursor-pointer"
                      title="Dismiss Alert"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

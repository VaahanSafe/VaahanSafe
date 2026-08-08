import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  toastQueue: ToastItem[];

  // Actions
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  enqueueToast: (toast: Omit<ToastItem, 'id'>) => void;
  dequeueToast: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  toastQueue: [],

  addNotification: (item) =>
    set((state) => {
      const newNotification: NotificationItem = {
        ...item,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        read: false,
        timestamp: new Date().toISOString(),
      };
      const notifications = [newNotification, ...state.notifications];
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  enqueueToast: (toast) =>
    set((state) => ({
      toastQueue: [
        ...state.toastQueue,
        {
          ...toast,
          id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        },
      ],
    })),

  dequeueToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),

  clearNotifications: () =>
    set(() => ({
      notifications: [],
      unreadCount: 0,
    })),
}));

export const notificationStore = {
  getNotifications: () => useNotificationStore.getState().notifications,
  getUnreadCount: () => useNotificationStore.getState().unreadCount,
  getToastQueue: () => useNotificationStore.getState().toastQueue,
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) =>
    useNotificationStore.getState().addNotification(item),
  markRead: (id: string) => useNotificationStore.getState().markRead(id),
  markAllRead: () => useNotificationStore.getState().markAllRead(),
  removeNotification: (id: string) => useNotificationStore.getState().removeNotification(id),
  enqueueToast: (toast: Omit<ToastItem, 'id'>) => useNotificationStore.getState().enqueueToast(toast),
  dequeueToast: (id: string) => useNotificationStore.getState().dequeueToast(id),
  clearNotifications: () => useNotificationStore.getState().clearNotifications(),
};


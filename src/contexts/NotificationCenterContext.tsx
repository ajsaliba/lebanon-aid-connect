import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type NotificationType = 'conflict' | 'news' | 'shelter' | 'housing' | 'humanitarian' | 'infrastructure';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  source?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationCenterContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAllAsRead: () => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllAsRead: () => {},
});

export function NotificationCenterProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification: NotificationCenterContextValue['addNotification'] = (input) => {
    setNotifications((prev) => {
      const next: AppNotification = {
        id: crypto.randomUUID(),
        type: input.type,
        title: input.title,
        source: input.source,
        createdAt: new Date().toISOString(),
        read: false,
      };
      return [next, ...prev].slice(0, 100);
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationCenterContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter() {
  return useContext(NotificationCenterContext);
}

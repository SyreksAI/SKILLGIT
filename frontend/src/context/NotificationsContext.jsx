import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { NOTIFICATIONS as NOTIFICATIONS_MOCK } from '../data/mockData';

const STORAGE_KEY = 'skillgit-notifications';

function loadStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState(
        () => loadStored() ?? NOTIFICATIONS_MOCK,
    );

    const persist = useCallback((next) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, []);

    const markRead = useCallback((id) => {
        setNotifications(prev => {
            const next = prev.map(n => (n.id === id ? { ...n, read: true } : n));
            persist(next);
            return next;
        });
    }, [persist]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const next = prev.map(n => ({ ...n, read: true }));
            persist(next);
            return next;
        });
    }, [persist]);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.read).length,
        [notifications],
    );

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        setNotifications,
    }), [notifications, unreadCount, markRead, markAllRead]);

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
}

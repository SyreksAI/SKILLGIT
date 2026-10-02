import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { CONVERSATIONS } from '../data/mockData';
import { useNotifications } from './NotificationsContext';
import { NotificationsModal } from '../components/ui/NotificationsModal';
import { MessagesModal } from '../components/ui/MessagesModal';
import { ThemeModal } from '../components/ui/ThemeModal';
import { BalanceModal } from '../components/ui/BalanceModal';

const ModalsContext = createContext(null);

export function ModalsProvider({ children }) {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [balanceOpen, setBalanceOpen] = useState(false);
    const { notifications, markAllRead, unreadCount } = useNotifications();

    const unreadMessages = CONVERSATIONS.reduce((sum, chat) => sum + (chat.unread ?? 0), 0);

    const closeAll = useCallback(() => {
        setNotificationsOpen(false);
        setMessagesOpen(false);
        setThemeOpen(false);
        setBalanceOpen(false);
    }, []);

    const openNotifications = useCallback(() => {
        closeAll();
        setNotificationsOpen(true);
    }, [closeAll]);

    const openMessages = useCallback(() => {
        closeAll();
        setMessagesOpen(true);
    }, [closeAll]);

    const openTheme = useCallback(() => {
        closeAll();
        setThemeOpen(true);
    }, [closeAll]);

    const openBalance = useCallback(() => {
        closeAll();
        setBalanceOpen(true);
    }, [closeAll]);

    const value = useMemo(() => ({
        openNotifications,
        openMessages,
        openTheme,
        openBalance,
        unreadNotifications: unreadCount,
        unreadMessages,
    }), [openNotifications, openMessages, openTheme, openBalance, unreadCount, unreadMessages]);

    return (
        <ModalsContext.Provider value={value}>
            {children}
            <NotificationsModal
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                items={notifications}
                onMarkAllRead={markAllRead}
            />
            <MessagesModal
                isOpen={messagesOpen}
                onClose={() => setMessagesOpen(false)}
                conversations={CONVERSATIONS.slice(0, 6)}
            />
            <ThemeModal
                isOpen={themeOpen}
                onClose={() => setThemeOpen(false)}
            />
            <BalanceModal
                isOpen={balanceOpen}
                onClose={() => setBalanceOpen(false)}
            />
        </ModalsContext.Provider>
    );
}

export function useModals() {
    const context = useContext(ModalsContext);
    if (!context) {
        throw new Error('useModals must be used within ModalsProvider');
    }
    return context;
}

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    PLATFORM_ACTIVITIES,
    PLATFORM_ANALYTICS,
    PLATFORM_COMPANIES,
    PLATFORM_REPORTS,
    PLATFORM_SETTINGS_DEFAULT,
    PLATFORM_STATS,
    PLATFORM_TASKS,
    PLATFORM_TRANSACTIONS,
    PLATFORM_USERS,
} from '../data/platformAdminData';

const STORAGE_KEY = 'skillgit-platform-admin';

function loadStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function formatNow() {
    return new Date().toLocaleString('ru-RU', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
}

const PlatformAdminContext = createContext(null);

export function PlatformAdminProvider({ children }) {
    const stored = loadStored();

    const [users, setUsers] = useState(stored?.users ?? PLATFORM_USERS);
    const [companies, setCompanies] = useState(stored?.companies ?? PLATFORM_COMPANIES);
    const [tasks, setTasks] = useState(stored?.tasks ?? PLATFORM_TASKS);
    const [transactions, setTransactions] = useState(stored?.transactions ?? PLATFORM_TRANSACTIONS);
    const [reports, setReports] = useState(stored?.reports ?? PLATFORM_REPORTS);
    const [activities, setActivities] = useState(stored?.activities ?? PLATFORM_ACTIVITIES);
    const [settings, setSettings] = useState(stored?.settings ?? PLATFORM_SETTINGS_DEFAULT);
    const [adminSearch, setAdminSearch] = useState('');

    const persist = useCallback((patch) => {
        const current = loadStored() ?? {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    }, []);

    const logActivity = useCallback((entry) => {
        const item = { id: Date.now(), time: 'только что', severity: 'info', ...entry };
        setActivities(prev => {
            const next = [item, ...prev].slice(0, 100);
            persist({ activities: next });
            return next;
        });
    }, [persist]);

    const stats = useMemo(() => ({
        ...PLATFORM_STATS,
        users: users.filter(u => u.status === 'active').length,
        usersTotal: users.length,
        blockedUsers: users.filter(u => u.status === 'blocked').length,
        companies: companies.length,
        pendingVerifications: companies.filter(c => c.status === 'pending').length,
        openReports: reports.filter(r => r.status === 'open').length,
        pendingTasks: tasks.filter(t => t.moderationStatus === 'pending').length,
        flaggedTasks: tasks.filter(t => t.moderationStatus === 'flagged').length,
        pendingPayouts: transactions.filter(t => t.status === 'pending').length,
        analytics: PLATFORM_ANALYTICS,
    }), [users, companies, reports, tasks, transactions]);

    const filteredUsers = useMemo(() => {
        const q = adminSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q),
        );
    }, [users, adminSearch]);

    const toggleUserBlock = useCallback((userId) => {
        setUsers(prev => {
            const target = prev.find(u => u.id === userId);
            const next = prev.map(u =>
                u.id === userId
                    ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' }
                    : u,
            );
            persist({ users: next });
            if (target) {
                logActivity({
                    type: 'user',
                    text: `${target.username} ${target.status === 'blocked' ? 'разблокирован' : 'заблокирован'}`,
                    severity: target.status === 'blocked' ? 'success' : 'danger',
                });
            }
            return next;
        });
    }, [persist, logActivity]);

    const updateUser = useCallback((userId, patch) => {
        setUsers(prev => {
            const next = prev.map(u => (u.id === userId ? { ...u, ...patch } : u));
            persist({ users: next });
            return next;
        });
    }, [persist]);

    const verifyCompany = useCallback((companyId) => {
        setCompanies(prev => {
            const next = prev.map(c =>
                c.id === companyId ? { ...c, status: 'verified', verified: true } : c,
            );
            persist({ companies: next });
            return next;
        });
        logActivity({ type: 'company', text: 'Компания верифицирована', severity: 'success' });
    }, [persist, logActivity]);

    const rejectCompany = useCallback((companyId) => {
        setCompanies(prev => {
            const next = prev.map(c =>
                c.id === companyId ? { ...c, status: 'rejected', verified: false } : c,
            );
            persist({ companies: next });
            return next;
        });
    }, [persist]);

    const moderateTask = useCallback((taskId, status) => {
        setTasks(prev => {
            const next = prev.map(t =>
                t.id === taskId ? { ...t, moderationStatus: status } : t,
            );
            persist({ tasks: next });
            return next;
        });
        logActivity({ type: 'moderation', text: `Задача T-${1000 + taskId} → ${status}`, severity: 'warning' });
    }, [persist, logActivity]);

    const resolveReport = useCallback((reportId, status = 'resolved') => {
        setReports(prev => {
            const next = prev.map(r => (r.id === reportId ? { ...r, status } : r));
            persist({ reports: next });
            return next;
        });
    }, [persist]);

    const approveTransaction = useCallback((txId) => {
        setTransactions(prev => {
            const next = prev.map(t => (t.id === txId ? { ...t, status: 'completed' } : t));
            persist({ transactions: next });
            return next;
        });
        logActivity({ type: 'payment', text: `Транзакция #${txId} одобрена`, severity: 'success' });
    }, [persist, logActivity]);

    const updateSettings = useCallback((patch) => {
        setSettings(prev => {
            const next = { ...prev, ...patch };
            persist({ settings: next });
            return next;
        });
    }, [persist]);

    const value = useMemo(() => ({
        users,
        filteredUsers,
        companies,
        tasks,
        transactions,
        reports,
        activities,
        settings,
        stats,
        adminSearch,
        setAdminSearch,
        toggleUserBlock,
        updateUser,
        verifyCompany,
        rejectCompany,
        moderateTask,
        resolveReport,
        approveTransaction,
        updateSettings,
        logActivity,
    }), [
        users, filteredUsers, companies, tasks, transactions, reports, activities,
        settings, stats, adminSearch,
        toggleUserBlock, updateUser, verifyCompany, rejectCompany,
        moderateTask, resolveReport, approveTransaction, updateSettings, logActivity,
    ]);

    return (
        <PlatformAdminContext.Provider value={value}>
            {children}
        </PlatformAdminContext.Provider>
    );
}

export function usePlatformAdmin() {
    const ctx = useContext(PlatformAdminContext);
    if (!ctx) throw new Error('usePlatformAdmin must be used within PlatformAdminProvider');
    return ctx;
}

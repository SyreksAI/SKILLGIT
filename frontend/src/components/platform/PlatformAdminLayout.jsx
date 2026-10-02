import { Outlet } from 'react-router-dom';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminShell } from '../admin/AdminShell';
import { CrmTopBar } from '../crm/CrmShared';
import {
    GridIcon,
    CheckCircleIcon,
    CoinIcon,
    SettingsIcon,
} from '../pages/icons';

const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
);

const IconBuilding = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
);

const IconFlag = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const IconChart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IconActivity = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export function PlatformAdminLayout() {
    const { stats, adminSearch, setAdminSearch } = usePlatformAdmin();

    const navItems = [
        { to: 'dashboard', label: 'Обзор', Icon: GridIcon },
        { to: 'analytics', label: 'Аналитика', Icon: IconChart },
        { to: 'users', label: 'Пользователи', Icon: IconUsers, badge: stats.blockedUsers },
        { to: 'companies', label: 'Компании', Icon: IconBuilding, badge: stats.pendingVerifications },
        { to: 'tasks', label: 'Модерация', Icon: CheckCircleIcon, badge: stats.pendingTasks + stats.flaggedTasks },
        { to: 'transactions', label: 'Транзакции', Icon: CoinIcon, badge: stats.pendingPayouts },
        { to: 'reports', label: 'Жалобы', Icon: IconFlag, badge: stats.openReports },
        { to: 'activity', label: 'События', Icon: IconActivity },
        { to: 'settings', label: 'Настройки', Icon: SettingsIcon },
    ];

    return (
        <AdminShell
            brandName="SKILLGIT"
            brandSubtitle="Админ-панель"
            brandColor="#0066e0"
            basePath="/admin"
            navItems={navItems}
        >
            <CrmTopBar
                search={adminSearch}
                onSearchChange={setAdminSearch}
                searchPlaceholder="Поиск пользователей по имени, email..."
            />
            <Outlet />
        </AdminShell>
    );
}

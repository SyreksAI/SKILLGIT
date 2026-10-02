import { Outlet } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminShell } from '../admin/AdminShell';
import { CrmTopBar } from '../crm/CrmShared';
import {
    GridIcon,
    CoinIcon,
    SettingsIcon,
    MailIcon,
} from '../pages/icons';

const IconPipeline = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="6" height="18" rx="1" /><rect x="9" y="3" width="6" height="12" rx="1" /><rect x="15" y="3" width="6" height="8" rx="1" />
    </svg>
);

const IconTasks = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
);

const IconDeals = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const IconActivity = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const IconChart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

export function CompanyAdminLayout() {
    const { company, stats, crmSearch, setCrmSearch } = useCompanyAdmin();

    const navItems = [
        { to: 'dashboard', label: 'Обзор', Icon: GridIcon },
        { to: 'pipeline', label: 'Воронка', Icon: IconPipeline, badge: stats.newApplicants },
        { to: 'tasks', label: 'Задания', Icon: IconTasks },
        { to: 'applicants', label: 'Кандидаты', Icon: IconUsers },
        { to: 'deals', label: 'Сделки', Icon: IconDeals, badge: stats.activeDeals },
        { to: 'messages', label: 'Сообщения', Icon: MailIcon, badge: stats.unreadMessages },
        { to: 'team', label: 'Команда HR', Icon: IconUsers },
        { to: 'analytics', label: 'Аналитика', Icon: IconChart },
        { to: 'activity', label: 'Активность', Icon: IconActivity },
        { to: 'billing', label: 'Финансы', Icon: CoinIcon },
        { to: 'settings', label: 'Настройки', Icon: SettingsIcon },
    ];

    return (
        <AdminShell
            brandName={company.name}
            brandSubtitle="CRM · SKILLGIT for Business"
            brandColor={company.color}
            basePath="/company"
            navItems={navItems}
        >
            <CrmTopBar
                search={crmSearch}
                onSearchChange={setCrmSearch}
                actions={(
                    <span className="crm-topbar-balance">
                        {stats.balance.toLocaleString('ru-RU')} ₽
                    </span>
                )}
            />
            <Outlet />
        </AdminShell>
    );
}

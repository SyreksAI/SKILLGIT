import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead } from '../admin/AdminShell';
import { CrmTimeline } from '../crm/CrmShared';

export function PlatformActivityPage() {
    const { activities } = usePlatformAdmin();

    return (
        <div className="admin-page">
            <AdminPanelHead title="Лента событий" subtitle="Регистрации, модерация, выплаты и системные события" />
            <div className="admin-card">
                <CrmTimeline items={activities} />
            </div>
        </div>
    );
}

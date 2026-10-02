import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead } from '../admin/AdminShell';
import { CrmTimeline } from '../crm/CrmShared';

export function CompanyActivityPage() {
    const { activities } = useCompanyAdmin();

    return (
        <div className="admin-page">
            <AdminPanelHead title="Лента активности" subtitle="Все события CRM в реальном времени" />
            <div className="admin-card">
                <CrmTimeline items={activities} />
            </div>
        </div>
    );
}

import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead, AdminStatCard } from '../admin/AdminShell';
import { CrmBarChart, CrmSparkline } from '../crm/CrmShared';

export function PlatformAnalyticsPage() {
    const { stats } = usePlatformAdmin();
    const { analytics } = stats;

    return (
        <div className="admin-page">
            <AdminPanelHead title="Аналитика платформы" subtitle="GMV, пользователи, задачи и конверсия" />

            <div className="admin-stats-grid">
                <AdminStatCard label="GMV" value={`${(stats.gmv / 1000000).toFixed(1)}M ₽`} accent="green">
                    <CrmSparkline data={analytics.revenue.map(v => Math.round(v / 100000))} color="#22c55e" />
                </AdminStatCard>
                <AdminStatCard label="Пользователей" value={stats.usersTotal.toLocaleString('ru-RU')} accent="blue">
                    <CrmSparkline data={analytics.users} color="#0066e0" />
                </AdminStatCard>
                <AdminStatCard label="Активных задач" value={stats.activeTasks}>
                    <CrmSparkline data={analytics.tasks} color="#8b5cf6" />
                </AdminStatCard>
                <AdminStatCard label="Конверсия" value={`${analytics.conversion.at(-1)}%`} hint="отклик → найм">
                    <CrmSparkline data={analytics.conversion} color="#f59e0b" />
                </AdminStatCard>
            </div>

            <div className="crm-dashboard-grid">
                <section className="admin-card">
                    <h2>Выручка платформы</h2>
                    <CrmBarChart data={analytics.revenue.map(v => Math.round(v / 100000))} labels={analytics.labels} color="#22c55e" height={180} />
                </section>
                <section className="admin-card">
                    <h2>Рост пользователей</h2>
                    <CrmBarChart data={analytics.users.map(v => Math.round(v / 1000))} labels={analytics.labels} color="#0066e0" height={180} />
                </section>
                <section className="admin-card">
                    <h2>Задачи на платформе</h2>
                    <CrmBarChart data={analytics.tasks} labels={analytics.labels} color="#8b5cf6" height={180} />
                </section>
                <section className="admin-card">
                    <h2>Конверсия %</h2>
                    <CrmBarChart data={analytics.conversion} labels={analytics.labels} color="#f59e0b" height={180} />
                </section>
            </div>
        </div>
    );
}

import { useMemo } from 'react';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { APPLICANT_STATUSES } from '../../data/companyAdminData';
import { AdminPanelHead, AdminStatCard } from '../admin/AdminShell';
import { CrmBarChart, CrmSparkline } from '../crm/CrmShared';

export function CompanyAnalyticsPage() {
    const { tasks, applicants, billing, stats, deals } = useCompanyAdmin();
    const { trends } = stats;

    const funnel = useMemo(() =>
        APPLICANT_STATUSES.map(st => ({
            ...st,
            count: applicants.filter(a => a.status === st.id).length,
        })),
    [applicants]);

    const totalSpent = billing.filter(b => b.amount < 0).reduce((s, b) => s + Math.abs(b.amount), 0);
    const maxFunnel = Math.max(...funnel.map(f => f.count), 1);
    const avgDeal = deals.length ? Math.round(deals.reduce((s, d) => s + d.amount, 0) / deals.length) : 0;

    return (
        <div className="admin-page">
            <AdminPanelHead title="Аналитика" subtitle="Тренды, воронка и эффективность расходов" />

            <div className="admin-stats-grid">
                <AdminStatCard label="Опубликовано задач" value={tasks.filter(t => t.status !== 'closed').length}>
                    <CrmSparkline data={trends.applications.slice(-8)} />
                </AdminStatCard>
                <AdminStatCard label="Всего откликов" value={applicants.length} accent="blue">
                    <CrmSparkline data={trends.applications} color="#0066e0" />
                </AdminStatCard>
                <AdminStatCard label="Конверсия в найм" value={`${stats.conversion}%`} accent="green">
                    <CrmSparkline data={trends.conversion} color="#22c55e" />
                </AdminStatCard>
                <AdminStatCard label="Потрачено" value={`${totalSpent.toLocaleString('ru-RU')} ₽`} hint={`средняя сделка ${avgDeal.toLocaleString('ru-RU')} ₽`} />
            </div>

            <div className="crm-dashboard-grid">
                <section className="admin-card">
                    <h2>Отклики по месяцам</h2>
                    <CrmBarChart
                        data={trends.applications}
                        labels={['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'].slice(-trends.applications.length)}
                        height={160}
                    />
                </section>

                <section className="admin-card">
                    <h2>Конверсия %</h2>
                    <CrmBarChart data={trends.conversion} color="#22c55e" height={160} />
                </section>
            </div>

            <div className="admin-split">
                <section className="admin-card">
                    <h2>Воронка кандидатов</h2>
                    <ul className="admin-funnel">
                        {funnel.map(step => (
                            <li key={step.id}>
                                <span>{step.label}</span>
                                <div className="admin-funnel-bar">
                                    <div style={{ width: `${(step.count / maxFunnel) * 100}%`, background: step.color }} />
                                </div>
                                <strong>{step.count}</strong>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="admin-card">
                    <h2>Топ заданий по откликам</h2>
                    <ul className="admin-list">
                        {[...tasks].sort((a, b) => (b.applicants ?? 0) - (a.applicants ?? 0)).slice(0, 5).map(task => (
                            <li key={task.id} className="admin-list-item">
                                <div className="admin-list-body">
                                    <strong>{task.title}</strong>
                                    <span>{task.applicants ?? 0} откликов · {task.views ?? 0} просмотров</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}

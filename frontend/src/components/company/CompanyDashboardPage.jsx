import { Link } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead, AdminStatCard } from '../admin/AdminShell';
import { CrmBarChart, CrmSparkline, CrmTimeline } from '../crm/CrmShared';

export function CompanyDashboardPage() {
    const { stats, activities, deals, filteredApplicants, messages } = useCompanyAdmin();
    const { trends } = stats;

    return (
        <div className="admin-page">
            <AdminPanelHead
                title="CRM Dashboard"
                subtitle="Полная картина найма, сделок и коммуникаций"
                actions={(
                    <Link to="/company/tasks/new" className="admin-btn admin-btn--primary">+ Задание</Link>
                )}
            />

            <div className="admin-stats-grid">
                <AdminStatCard label="Отклики (30 дн.)" value={trends.applications.at(-1)} accent="blue">
                    <CrmSparkline data={trends.applications} />
                </AdminStatCard>
                <AdminStatCard label="Конверсия" value={`${stats.conversion}%`} accent="green">
                    <CrmSparkline data={trends.conversion} color="#22c55e" />
                </AdminStatCard>
                <AdminStatCard label="Новые" value={stats.newApplicants} accent="orange" hint="требуют реакции" />
                <AdminStatCard label="На интервью" value={stats.inInterview} accent="purple" />
            </div>

            <div className="crm-dashboard-grid">
                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Воронка</h2>
                        <Link to="/company/pipeline" className="admin-link">Kanban →</Link>
                    </div>
                    <div className="crm-pipeline-mini">
                        {stats.pipeline.map(step => (
                            <div key={step.id} className="crm-pipeline-mini-row">
                                <span style={{ color: step.color }}>{step.label}</span>
                                <div className="crm-pipeline-mini-bar">
                                    <div style={{ width: `${Math.max((step.count / Math.max(stats.totalApplicants, 1)) * 100, 4)}%`, background: step.color }} />
                                </div>
                                <strong>{step.count}</strong>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Отклики по неделям</h2>
                    </div>
                    <CrmBarChart data={trends.applications.slice(-8)} color="var(--brand)" height={140} />
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Расходы</h2>
                        <Link to="/company/billing" className="admin-link">Финансы →</Link>
                    </div>
                    <CrmBarChart data={trends.spend.slice(-6).map(v => Math.round(v / 1000))} labels={['Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен']} color="#ef4444" height={120} />
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Активность</h2>
                        <Link to="/company/activity" className="admin-link">Вся лента →</Link>
                    </div>
                    <CrmTimeline items={activities.slice(0, 6)} />
                </section>
            </div>

            <div className="admin-split">
                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Горячие кандидаты</h2>
                        <Link to="/company/applicants" className="admin-link">Все →</Link>
                    </div>
                    <ul className="admin-list">
                        {filteredApplicants.filter(a => ['new', 'interview', 'offer'].includes(a.status)).slice(0, 5).map(a => (
                            <li key={a.id} className="admin-list-item">
                                <span className="admin-list-avatar">{a.avatar}</span>
                                <div className="admin-list-body">
                                    <strong>{a.userName}</strong>
                                    <span>{a.taskTitle}</span>
                                </div>
                                <Link to="/company/pipeline" className="admin-link">Открыть</Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Сделки</h2>
                        <Link to="/company/deals" className="admin-link">Все →</Link>
                    </div>
                    <ul className="admin-list">
                        {deals.slice(0, 4).map(d => (
                            <li key={d.id} className="admin-list-item">
                                <div className="admin-list-body">
                                    <strong>{d.candidateName}</strong>
                                    <span>{d.amount.toLocaleString('ru-RU')} ₽ · {d.progress}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {messages.some(m => m.unread > 0) && (
                        <Link to="/company/messages" className="admin-btn admin-btn--ghost admin-btn--sm">
                            {stats.unreadMessages} непрочитанных сообщений
                        </Link>
                    )}
                </section>
            </div>
        </div>
    );
}

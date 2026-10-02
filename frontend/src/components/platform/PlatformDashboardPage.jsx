import { Link } from 'react-router-dom';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead, AdminStatCard } from '../admin/AdminShell';
import { CrmBarChart, CrmSparkline, CrmTimeline } from '../crm/CrmShared';
import { PLATFORM_ADMIN } from '../../data/platformAdminData';

export function PlatformDashboardPage() {
    const { stats, reports, companies, tasks, transactions, activities } = usePlatformAdmin();
    const { analytics } = stats;

    const pendingCompanies = companies.filter(c => c.status === 'pending');
    const openReports = reports.filter(r => r.status === 'open');
    const pendingTasks = tasks.filter(t => t.moderationStatus === 'pending' || t.moderationStatus === 'flagged');
    const pendingTx = transactions.filter(t => t.status === 'pending');

    return (
        <div className="admin-page">
            <AdminPanelHead
                title={`Панель управления · ${PLATFORM_ADMIN.name}`}
                subtitle="Мониторинг платформы, модерация и финансы"
            />

            <div className="admin-stats-grid">
                <AdminStatCard label="Пользователей" value={stats.usersTotal.toLocaleString('ru-RU')} accent="blue">
                    <CrmSparkline data={analytics.users.slice(-8).map(v => Math.round(v / 1000))} />
                </AdminStatCard>
                <AdminStatCard label="Компаний" value={stats.companies} />
                <AdminStatCard label="Активных задач" value={stats.activeTasks.toLocaleString('ru-RU')} />
                <AdminStatCard label="Выручка / мес" value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}M ₽`} accent="green">
                    <CrmSparkline data={analytics.revenue.slice(-8).map(v => Math.round(v / 100000))} color="#22c55e" />
                </AdminStatCard>
            </div>

            <div className="crm-dashboard-grid">
                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>На модерации</h2>
                        <Link to="/admin/tasks" className="admin-link">Все →</Link>
                    </div>
                    {pendingTasks.length === 0 ? (
                        <p className="admin-empty-text">Очередь пуста</p>
                    ) : (
                        <ul className="admin-list">
                            {pendingTasks.slice(0, 4).map(t => (
                                <li key={t.id} className="admin-list-item">
                                    <div className="admin-list-body">
                                        <strong>{t.title}</strong>
                                        <span>{t.company} · {t.moderationStatus}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Выручка</h2>
                        <Link to="/admin/analytics" className="admin-link">Аналитика →</Link>
                    </div>
                    <CrmBarChart data={analytics.revenue.slice(-6).map(v => Math.round(v / 100000))} labels={analytics.labels.slice(-6)} color="#22c55e" height={120} />
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Ожидают верификации</h2>
                        <Link to="/admin/companies" className="admin-link">Компании →</Link>
                    </div>
                    {pendingCompanies.length === 0 ? (
                        <p className="admin-empty-text">Нет компаний на проверке</p>
                    ) : (
                        <ul className="admin-list">
                            {pendingCompanies.slice(0, 4).map(c => (
                                <li key={c.id} className="admin-list-item">
                                    <span className="admin-list-avatar" style={{ background: c.color }}>{c.name.charAt(0)}</span>
                                    <div className="admin-list-body">
                                        <strong>{c.name}</strong>
                                        <span>{c.industry}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Последние события</h2>
                        <Link to="/admin/activity" className="admin-link">Лента →</Link>
                    </div>
                    <CrmTimeline items={activities.slice(0, 5)} />
                </section>
            </div>

            <div className="admin-split">
                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Открытые жалобы</h2>
                        <Link to="/admin/reports" className="admin-link">Модерация →</Link>
                    </div>
                    {openReports.length === 0 ? (
                        <p className="admin-empty-text">Жалоб нет</p>
                    ) : (
                        <ul className="admin-list">
                            {openReports.slice(0, 5).map(r => (
                                <li key={r.id} className="admin-list-item">
                                    <div className="admin-list-body">
                                        <strong>{r.type} · {r.target}</strong>
                                        <span>{r.text}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Выплаты в очереди</h2>
                        <Link to="/admin/transactions" className="admin-link">Транзакции →</Link>
                    </div>
                    {pendingTx.length === 0 ? (
                        <p className="admin-empty-text">Нет ожидающих выплат</p>
                    ) : (
                        <ul className="admin-list">
                            {pendingTx.map(tx => (
                                <li key={tx.id} className="admin-list-item">
                                    <div className="admin-list-body">
                                        <strong>{tx.user}</strong>
                                        <span>{tx.amount.toLocaleString('ru-RU')} ₽ · {tx.company}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

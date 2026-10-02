import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { getDirectionLabel } from '../../data/mockData';
import { AdminPanelHead, AdminBadge, AdminStatCard } from '../admin/AdminShell';
import { CrmTimeline } from '../crm/CrmShared';

export function PlatformUserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { users, transactions, reports, activities, toggleUserBlock, updateUser } = usePlatformAdmin();
    const user = users.find(u => String(u.id) === id);

    const userTx = useMemo(
        () => (user ? transactions.filter(tx => tx.user === user.name) : []),
        [user, transactions],
    );
    const userReports = useMemo(
        () => (user ? reports.filter(r => r.target === user.username) : []),
        [user, reports],
    );
    const userActivity = useMemo(
        () => (user ? activities.filter(a => a.text.includes(user.username)) : []),
        [user, activities],
    );

    if (!user) {
        return (
            <div className="admin-page">
                <AdminPanelHead title="Пользователь не найден" />
                <Link to="/admin/users" className="admin-link">← К списку</Link>
            </div>
        );
    }

    const totalEarned = userTx
        .filter(tx => tx.type === 'payout' && tx.status === 'completed')
        .reduce((s, tx) => s + tx.amount, 0);

    return (
        <div className="admin-page">
            <AdminPanelHead
                title={user.name}
                subtitle={`@${user.username} · ${user.email}`}
                actions={(
                    <>
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate('/admin/users')}>
                            ← К списку
                        </button>
                        <button
                            type="button"
                            className={`admin-btn${user.status === 'blocked' ? ' admin-btn--primary' : ' admin-btn--ghost admin-link--danger'}`}
                            onClick={() => toggleUserBlock(user.id)}
                        >
                            {user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                    </>
                )}
            />

            <div className="admin-stats-grid">
                <AdminStatCard label="Рейтинг" value={user.rating ? `★ ${user.rating}` : '—'} />
                <AdminStatCard label="Задач выполнено" value={user.tasksDone} accent="blue" />
                <AdminStatCard label="Баланс" value={`${user.balance.toLocaleString('ru-RU')} ₽`} accent="green" />
                <AdminStatCard label="Заработано" value={`${totalEarned.toLocaleString('ru-RU')} ₽`} hint="выплаты" />
            </div>

            <div className="admin-split">
                <section className="admin-card">
                    <h2>Профиль</h2>
                    <dl className="crm-detail-list">
                        <div><dt>Роль</dt><dd>{user.role === 'student' ? 'Студент' : 'Компания'}</dd></div>
                        <div><dt>Направление</dt><dd>{user.direction ? getDirectionLabel(user.direction) : '—'}</dd></div>
                        <div><dt>Регистрация</dt><dd>{user.joined}</dd></div>
                        <div><dt>Последняя активность</dt><dd>{user.lastActive}</dd></div>
                        <div><dt>Жалобы</dt><dd>{user.reports}</dd></div>
                        <div>
                            <dt>Статус</dt>
                            <dd>
                                <AdminBadge tone={user.status === 'blocked' ? 'red' : 'green'}>
                                    {user.status === 'blocked' ? 'Заблокирован' : 'Активен'}
                                </AdminBadge>
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="admin-card">
                    <h2>Редактирование</h2>
                    <div className="admin-form">
                        <label className="admin-field">
                            <span>Имя</span>
                            <input
                                value={user.name}
                                onChange={e => updateUser(user.id, { name: e.target.value })}
                            />
                        </label>
                        <label className="admin-field">
                            <span>Email</span>
                            <input
                                value={user.email}
                                onChange={e => updateUser(user.id, { email: e.target.value })}
                            />
                        </label>
                        {user.role === 'student' && (
                            <Link to={`/users/${user.username}`} className="admin-btn admin-btn--ghost">
                                Публичный профиль →
                            </Link>
                        )}
                    </div>
                </section>
            </div>

            <div className="admin-split">
                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Жалобы ({userReports.length})</h2>
                        {userReports.some(r => r.status === 'open') && (
                            <Link to="/admin/reports" className="admin-link">Модерация →</Link>
                        )}
                    </div>
                    {userReports.length === 0 ? (
                        <p className="admin-empty-text">Жалоб нет</p>
                    ) : (
                        <ul className="crm-drawer-list crm-drawer-list--page">
                            {userReports.map(r => (
                                <li key={r.id}>
                                    <div className="crm-drawer-list-head">
                                        <strong>{r.type}</strong>
                                        <AdminBadge tone={r.status === 'open' ? 'orange' : 'muted'}>{r.status}</AdminBadge>
                                    </div>
                                    <p>{r.text}</p>
                                    <span>{r.date} · от @{r.reporter}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>Транзакции</h2>
                        <Link to="/admin/transactions" className="admin-link">Все →</Link>
                    </div>
                    {userTx.length === 0 ? (
                        <p className="admin-empty-text">Транзакций нет</p>
                    ) : (
                        <ul className="crm-drawer-list crm-drawer-list--page">
                            {userTx.map(tx => (
                                <li key={tx.id}>
                                    <div className="crm-drawer-list-head">
                                        <strong>{tx.type === 'payout' ? 'Выплата' : tx.type === 'topup' ? 'Пополнение' : 'Комиссия'}</strong>
                                        <AdminBadge tone={tx.status === 'completed' ? 'green' : 'orange'}>{tx.status}</AdminBadge>
                                    </div>
                                    <span>{tx.amount.toLocaleString('ru-RU')} ₽ · {tx.company} · {tx.date}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {userActivity.length > 0 && (
                <section className="admin-card">
                    <h2>История на платформе</h2>
                    <CrmTimeline items={userActivity} />
                </section>
            )}
        </div>
    );
}

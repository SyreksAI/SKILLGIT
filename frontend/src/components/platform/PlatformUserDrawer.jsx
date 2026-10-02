import { Link, useNavigate } from 'react-router-dom';
import { getDirectionLabel } from '../../data/mockData';
import { AdminBadge } from '../admin/AdminShell';

export function PlatformUserDrawer({ user, transactions, reports, onClose, onBlock, onUpdate }) {
    const navigate = useNavigate();
    if (!user) return null;

    const userTx = transactions.filter(tx => tx.user === user.name);
    const userReports = reports.filter(r => r.target === user.username);

    return (
        <div className="crm-drawer-overlay" onClick={onClose}>
            <aside className="crm-drawer crm-drawer--user" onClick={e => e.stopPropagation()}>
                <header className="crm-drawer-head">
                    <div className="crm-drawer-user">
                        <span className={`admin-list-avatar${user.status === 'blocked' ? ' admin-list-avatar--blocked' : ''}`}>
                            {user.name.charAt(0)}
                        </span>
                        <div>
                            <h2>{user.name}</h2>
                            <span className="crm-drawer-sub">@{user.username}</span>
                        </div>
                    </div>
                    <button type="button" className="crm-drawer-close" onClick={onClose}>×</button>
                </header>

                <div className="crm-drawer-body">
                    <div className="crm-drawer-badges">
                        <AdminBadge tone={user.status === 'blocked' ? 'red' : 'green'}>
                            {user.status === 'blocked' ? 'Заблокирован' : 'Активен'}
                        </AdminBadge>
                        <AdminBadge tone={user.role === 'student' ? 'blue' : 'purple'}>
                            {user.role === 'student' ? 'Студент' : 'Компания'}
                        </AdminBadge>
                        {user.reports > 0 && (
                            <AdminBadge tone="orange">{user.reports} жалоб</AdminBadge>
                        )}
                    </div>

                    <div className="crm-drawer-meta crm-drawer-meta--full">
                        <div><span>Email</span><strong>{user.email}</strong></div>
                        <div><span>Направление</span><strong>{user.direction ? getDirectionLabel(user.direction) : '—'}</strong></div>
                        <div><span>Рейтинг</span><strong>{user.rating ? `★ ${user.rating}` : '—'}</strong></div>
                        <div><span>Задач выполнено</span><strong>{user.tasksDone}</strong></div>
                        <div><span>Баланс</span><strong>{user.balance.toLocaleString('ru-RU')} ₽</strong></div>
                        <div><span>Регистрация</span><strong>{user.joined}</strong></div>
                        <div><span>Активность</span><strong>{user.lastActive}</strong></div>
                    </div>

                    <label className="admin-field">
                        <span>Email (редактирование)</span>
                        <input
                            value={user.email}
                            onChange={e => onUpdate(user.id, { email: e.target.value })}
                        />
                    </label>

                    {userReports.length > 0 && (
                        <section className="crm-drawer-section">
                            <h3>Жалобы ({userReports.length})</h3>
                            <ul className="crm-drawer-list">
                                {userReports.map(r => (
                                    <li key={r.id}>
                                        <strong>{r.type}</strong>
                                        <p>{r.text}</p>
                                        <span>{r.date} · {r.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {userTx.length > 0 && (
                        <section className="crm-drawer-section">
                            <h3>Транзакции</h3>
                            <ul className="crm-drawer-list">
                                {userTx.map(tx => (
                                    <li key={tx.id}>
                                        <strong>{tx.type === 'payout' ? 'Выплата' : tx.type}</strong>
                                        <span>{tx.amount.toLocaleString('ru-RU')} ₽ · {tx.company} · {tx.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <footer className="crm-drawer-foot">
                    <button
                        type="button"
                        className={`admin-btn${user.status === 'blocked' ? ' admin-btn--primary' : ' admin-btn--ghost admin-link--danger'}`}
                        onClick={() => onBlock(user.id)}
                    >
                        {user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                    {user.role === 'student' && (
                        <Link to={`/users/${user.username}`} className="admin-btn admin-btn--ghost">
                            Публичный профиль
                        </Link>
                    )}
                    <button
                        type="button"
                        className="admin-btn admin-btn--primary"
                        onClick={() => {
                            navigate(`/admin/users/${user.id}`);
                            onClose();
                        }}
                    >
                        Полная карточка
                    </button>
                </footer>
            </aside>
        </div>
    );
}

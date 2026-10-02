import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { getDirectionLabel } from '../../data/mockData';
import { AdminPanelHead, AdminStatCard, AdminTable, AdminBadge } from '../admin/AdminShell';
import { PlatformUserDrawer } from './PlatformUserDrawer';

const SORT_OPTIONS = [
    { id: 'recent', label: 'По активности' },
    { id: 'name', label: 'По имени' },
    { id: 'rating', label: 'По рейтингу' },
    { id: 'balance', label: 'По балансу' },
    { id: 'reports', label: 'По жалобам' },
];

const USER_COLUMNS = ['Пользователь', 'Email', 'Роль', 'Рейтинг', 'Задачи', 'Баланс', 'Жалобы', 'Статус', 'Действия'];
const USER_COL_CLASSES = ['', '', 'is-center', 'is-num', 'is-num', 'is-num', 'is-center', 'is-center', 'is-actions'];
const USER_COL_WIDTHS = ['22%', '15%', '10%', '7%', '6%', '9%', '6%', '7%', '18%'];

function sortUsers(list, sortBy) {
    const copy = [...list];
    switch (sortBy) {
        case 'name':
            return copy.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        case 'rating':
            return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        case 'balance':
            return copy.sort((a, b) => b.balance - a.balance);
        case 'reports':
            return copy.sort((a, b) => b.reports - a.reports);
        default:
            return copy;
    }
}

export function PlatformUsersPage() {
    const {
        filteredUsers,
        transactions,
        reports,
        toggleUserBlock,
        updateUser,
        stats,
    } = usePlatformAdmin();
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        let list = filteredUsers.filter(u => {
            if (roleFilter !== 'all' && u.role !== roleFilter) return false;
            if (statusFilter === 'active' && u.status !== 'active') return false;
            if (statusFilter === 'blocked' && u.status !== 'blocked') return false;
            if (statusFilter === 'reported' && u.reports === 0) return false;
            return true;
        });
        return sortUsers(list, sortBy);
    }, [filteredUsers, roleFilter, statusFilter, sortBy]);

    const selectedUser = selected ? filteredUsers.find(u => u.id === selected) : null;
    const blockedCount = filteredUsers.filter(u => u.status === 'blocked').length;
    const reportedCount = filteredUsers.filter(u => u.reports > 0).length;

    return (
        <div className="admin-page">
            <AdminPanelHead
                title="Пользователи"
                subtitle={`${stats.usersTotal.toLocaleString('ru-RU')} на платформе · поиск в верхней панели`}
            />

            <div className="admin-stats-grid">
                <AdminStatCard label="Всего в базе" value={filteredUsers.length} accent="blue" />
                <AdminStatCard label="Активных" value={filteredUsers.filter(u => u.status === 'active').length} accent="green" />
                <AdminStatCard label="Заблокированных" value={blockedCount} accent="red" hint={blockedCount ? 'требуют проверки' : undefined} />
                <AdminStatCard label="С жалобами" value={reportedCount} accent="orange" />
            </div>

            <div className="admin-toolbar admin-toolbar--stacked">
                <div className="admin-filter-group">
                    <span className="admin-filter-group-label">Роль</span>
                    <div className="admin-filter-row">
                        {['all', 'student', 'company'].map(r => (
                            <button
                                key={r}
                                type="button"
                                className={`admin-filter${roleFilter === r ? ' active' : ''}`}
                                onClick={() => setRoleFilter(r)}
                            >
                                {r === 'all' ? 'Все' : r === 'student' ? 'Студенты' : 'Компании'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="admin-filter-group">
                    <span className="admin-filter-group-label">Статус</span>
                    <div className="admin-filter-row">
                        {[
                            ['all', 'Все'],
                            ['active', 'Активные'],
                            ['blocked', 'Заблокированные'],
                            ['reported', 'С жалобами'],
                        ].map(([id, label]) => (
                            <button
                                key={id}
                                type="button"
                                className={`admin-filter${statusFilter === id ? ' active' : ''}`}
                                onClick={() => setStatusFilter(id)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <label className="admin-field admin-field--compact">
                    <span>Сортировка</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        {SORT_OPTIONS.map(o => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="admin-card admin-card--flush">
                {filtered.length === 0 ? (
                    <p className="admin-empty-text">Пользователи не найдены. Измените фильтры или поиск.</p>
                ) : (
                    <AdminTable
                        columns={USER_COLUMNS}
                        columnClassNames={USER_COL_CLASSES}
                        colWidths={USER_COL_WIDTHS}
                        tableClassName="admin-table--users"
                    >
                        {filtered.map(u => (
                            <tr
                                key={u.id}
                                className={`crm-table-row-clickable${u.status === 'blocked' ? ' crm-table-row--blocked' : ''}${u.reports > 0 ? ' crm-table-row--warn' : ''}`}
                                onClick={() => setSelected(u.id)}
                            >
                                <td>
                                    <div className="admin-user-cell">
                                        <span className={`admin-list-avatar${u.status === 'blocked' ? ' admin-list-avatar--blocked' : ''}`}>
                                            {u.name.charAt(0)}
                                        </span>
                                        <div className="admin-user-cell-text">
                                            <strong>{u.name}</strong>
                                            <span>@{u.username} · {u.lastActive}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="admin-table-email">{u.email}</td>
                                <td className="is-center">
                                    <AdminBadge tone={u.role === 'student' ? 'blue' : 'purple'}>
                                        {u.role === 'student' ? getDirectionLabel(u.direction) : 'Компания'}
                                    </AdminBadge>
                                </td>
                                <td className="is-num">{u.rating ? `★ ${u.rating}` : '—'}</td>
                                <td className="is-num">{u.tasksDone}</td>
                                <td className="is-num">{u.balance.toLocaleString('ru-RU')} ₽</td>
                                <td className="is-center">
                                    {u.reports > 0 ? (
                                        <AdminBadge tone="orange">{u.reports}</AdminBadge>
                                    ) : (
                                        <span className="admin-table-dash">—</span>
                                    )}
                                </td>
                                <td className="is-center">
                                    <AdminBadge tone={u.status === 'blocked' ? 'red' : 'green'}>
                                        {u.status === 'blocked' ? 'Блок' : 'OK'}
                                    </AdminBadge>
                                </td>
                                <td className="admin-table-actions" onClick={e => e.stopPropagation()}>
                                    <div className="admin-table-actions-inner">
                                        <span className="admin-table-action-slot">
                                            <button type="button" className="admin-link" onClick={() => setSelected(u.id)}>
                                                Карточка
                                            </button>
                                        </span>
                                        <span className={`admin-table-action-slot${u.role !== 'student' ? ' admin-table-action-slot--ghost' : ''}`}>
                                            {u.role === 'student' ? (
                                                <Link to={`/users/${u.username}`} className="admin-link">Профиль</Link>
                                            ) : (
                                                <span className="admin-link admin-link--placeholder">Профиль</span>
                                            )}
                                        </span>
                                        <span className="admin-table-action-slot">
                                            <button
                                                type="button"
                                                className="admin-link admin-link--danger"
                                                onClick={() => toggleUserBlock(u.id)}
                                            >
                                                {u.status === 'blocked' ? 'Разблок.' : 'Блок'}
                                            </button>
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                )}
            </div>

            <p className="admin-table-hint">
                Найдено: <strong>{filtered.length}</strong> · клик по строке открывает быстрый просмотр
            </p>

            <PlatformUserDrawer
                user={selectedUser}
                transactions={transactions}
                reports={reports}
                onClose={() => setSelected(null)}
                onBlock={toggleUserBlock}
                onUpdate={updateUser}
            />
        </div>
    );
}

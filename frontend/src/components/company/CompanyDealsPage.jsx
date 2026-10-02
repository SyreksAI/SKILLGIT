import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead, AdminTable, AdminBadge } from '../admin/AdminShell';

export function CompanyDealsPage() {
    const { deals, payDeal, stats } = useCompanyAdmin();
    const [filter, setFilter] = useState('all');

    const filtered = deals.filter(d => filter === 'all' ? true : d.status === filter);
    const totalActive = deals.filter(d => d.status === 'active').reduce((s, d) => s + d.amount - d.paid, 0);

    return (
        <div className="admin-page">
            <AdminPanelHead
                title="Сделки и выплаты"
                subtitle={`${stats.activeDeals} активных · резерв ${totalActive.toLocaleString('ru-RU')} ₽`}
            />

            <div className="admin-filters">
                {['all', 'active', 'completed'].map(id => (
                    <button key={id} type="button" className={`admin-filter${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>
                        {id === 'all' ? 'Все' : id === 'active' ? 'Активные' : 'Завершённые'}
                    </button>
                ))}
            </div>

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Кандидат', 'Задача', 'Сумма', 'Прогресс', 'Статус', '']}>
                    {filtered.map(deal => (
                        <tr key={deal.id}>
                            <td>
                                <strong>{deal.candidateName}</strong>
                                <span className="admin-table-sub">@{deal.username}</span>
                            </td>
                            <td>{deal.taskTitle}</td>
                            <td>{deal.amount.toLocaleString('ru-RU')} ₽</td>
                            <td>
                                <div className="crm-progress">
                                    <div className="crm-progress-bar" style={{ width: `${deal.progress}%` }} />
                                    <span>{deal.paid.toLocaleString('ru-RU')} / {deal.amount.toLocaleString('ru-RU')} ₽</span>
                                </div>
                            </td>
                            <td>
                                <AdminBadge tone={deal.status === 'completed' ? 'green' : 'blue'}>
                                    {deal.status === 'completed' ? 'Завершена' : 'Активна'}
                                </AdminBadge>
                            </td>
                            <td className="admin-table-actions">
                                {deal.status === 'active' && deal.paid < deal.amount && (
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--sm admin-btn--primary"
                                        onClick={() => payDeal(deal.id, Math.min(deal.amount - deal.paid, Math.round(deal.amount * 0.5)))}
                                    >
                                        Выплатить 50%
                                    </button>
                                )}
                                <Link to={`/users/${deal.username}`} className="admin-link">Профиль</Link>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead, AdminTable, AdminBadge, AdminActionGroup } from '../admin/AdminShell';

export function PlatformTransactionsPage() {
    const { transactions, approveTransaction } = usePlatformAdmin();
    const [filter, setFilter] = useState('all');

    const filtered = transactions.filter(tx =>
        filter === 'all' ? true : tx.status === filter,
    );

    return (
        <div className="admin-page">
            <AdminPanelHead title="Транзакции" subtitle="Одобрение выплат и контроль комиссий" />

            <div className="admin-filters">
                {['all', 'pending', 'completed'].map(id => (
                    <button key={id} type="button" className={`admin-filter${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>
                        {id === 'all' ? 'Все' : id === 'pending' ? 'В обработке' : 'Завершённые'}
                    </button>
                ))}
            </div>

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Дата', 'Пользователь', 'Компания', 'Тип', 'Сумма', 'Комиссия', 'Статус', 'Действия']}>
                    {filtered.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.date}</td>
                            <td>{tx.user}</td>
                            <td>{tx.company}</td>
                            <td>{tx.type === 'payout' ? 'Выплата' : tx.type === 'topup' ? 'Пополнение' : 'Комиссия'}</td>
                            <td className={tx.type === 'topup' ? 'admin-amount--plus' : 'admin-amount--minus'}>
                                {tx.type === 'topup' ? '+' : '−'}{tx.amount.toLocaleString('ru-RU')} ₽
                            </td>
                            <td>{tx.fee ? `${tx.fee.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td>
                                <AdminBadge tone={tx.status === 'completed' ? 'green' : 'orange'}>
                                    {tx.status === 'completed' ? 'Завершено' : 'В обработке'}
                                </AdminBadge>
                            </td>
                            <td className="admin-table-actions">
                                {tx.status === 'pending' ? (
                                    <AdminActionGroup>
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn--sm admin-btn--success"
                                            onClick={() => approveTransaction(tx.id)}
                                        >
                                            Одобрить
                                        </button>
                                    </AdminActionGroup>
                                ) : (
                                    <span className="admin-table-dash">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

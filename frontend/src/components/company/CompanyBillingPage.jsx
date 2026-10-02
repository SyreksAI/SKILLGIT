import { useState } from 'react';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead, AdminTable, AdminStatCard } from '../admin/AdminShell';

export function CompanyBillingPage() {
    const { company, billing, topUpBalance } = useCompanyAdmin();
    const [amount, setAmount] = useState(50000);

    return (
        <div className="admin-page">
            <AdminPanelHead title="Финансы" subtitle="Баланс компании и история операций" />

            <div className="admin-stats-grid admin-stats-grid--2">
                <AdminStatCard label="Текущий баланс" value={`${company.balance.toLocaleString('ru-RU')} ₽`} accent="green" />
                <div className="admin-card admin-card--inline">
                    <label className="admin-field">
                        <span>Пополнить баланс</span>
                        <input type="number" min={1000} step={1000} value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </label>
                    <button type="button" className="admin-btn admin-btn--primary" onClick={() => topUpBalance(amount)}>
                        Пополнить
                    </button>
                </div>
            </div>

            <div className="admin-card admin-card--flush">
                <h2>История операций</h2>
                <AdminTable columns={['Дата', 'Операция', 'Сумма']}>
                    {billing.map(row => (
                        <tr key={row.id}>
                            <td>{row.date}</td>
                            <td>{row.title}</td>
                            <td className={row.amount >= 0 ? 'admin-amount--plus' : 'admin-amount--minus'}>
                                {row.amount >= 0 ? '+' : ''}{row.amount.toLocaleString('ru-RU')} ₽
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

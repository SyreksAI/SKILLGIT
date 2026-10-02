import { Link } from 'react-router-dom';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead, AdminTable, AdminBadge, AdminActionGroup } from '../admin/AdminShell';

export function PlatformCompaniesPage() {
    const { companies, verifyCompany, rejectCompany } = usePlatformAdmin();

    return (
        <div className="admin-page">
            <AdminPanelHead title="Компании" subtitle="Верификация и управление работодателями" />

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Компания', 'Отрасль', 'Задач', 'Потрачено', 'Статус', 'Действия']}>
                    {companies.map(c => (
                        <tr key={c.id}>
                            <td>
                                <div className="admin-user-cell">
                                    <span className="admin-list-avatar" style={{ background: c.color }}>{c.name.charAt(0)}</span>
                                    <div>
                                        <strong>{c.name}</strong>
                                        <span>{c.contact}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{c.industry}</td>
                            <td className="is-num">{c.tasksCount}</td>
                            <td className="is-num">{c.totalSpent.toLocaleString('ru-RU')} ₽</td>
                            <td>
                                <AdminBadge tone={c.status === 'verified' ? 'green' : c.status === 'pending' ? 'orange' : 'red'}>
                                    {c.status === 'verified' ? 'Верифицирована' : c.status === 'pending' ? 'На проверке' : 'Отклонена'}
                                </AdminBadge>
                            </td>
                            <td className="admin-table-actions">
                                <AdminActionGroup>
                                    <Link to={`/companies/${c.slug}`} className="admin-btn admin-btn--sm admin-btn--ghost">
                                        Страница
                                    </Link>
                                    <Link to="/company/dashboard" className="admin-btn admin-btn--sm admin-btn--ghost">
                                        CRM
                                    </Link>
                                    {c.status === 'pending' && (
                                        <>
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn--sm admin-btn--success"
                                                onClick={() => verifyCompany(c.id)}
                                            >
                                                Одобрить
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn--sm admin-btn--danger"
                                                onClick={() => rejectCompany(c.id)}
                                            >
                                                Отклонить
                                            </button>
                                        </>
                                    )}
                                </AdminActionGroup>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

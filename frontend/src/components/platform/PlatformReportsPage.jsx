import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead, AdminTable, AdminBadge, AdminActionGroup } from '../admin/AdminShell';

export function PlatformReportsPage() {
    const { reports, resolveReport } = usePlatformAdmin();

    return (
        <div className="admin-page">
            <AdminPanelHead title="Жалобы и модерация" subtitle="Обработка репортов от пользователей" />

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Тип', 'Объект', 'Жалоба', 'Дата', 'Статус', 'Действия']}>
                    {reports.map(r => (
                        <tr key={r.id}>
                            <td>{r.type}</td>
                            <td>{r.target}</td>
                            <td>{r.text}</td>
                            <td>{r.date}</td>
                            <td>
                                <AdminBadge tone={r.status === 'open' ? 'orange' : r.status === 'review' ? 'blue' : 'green'}>
                                    {r.status === 'open' ? 'Открыта' : r.status === 'review' ? 'На рассмотрении' : 'Закрыта'}
                                </AdminBadge>
                            </td>
                            <td className="admin-table-actions">
                                {r.status === 'open' ? (
                                    <AdminActionGroup>
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn--sm admin-btn--ghost"
                                            onClick={() => resolveReport(r.id, 'review')}
                                        >
                                            Взять
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn--sm admin-btn--success"
                                            onClick={() => resolveReport(r.id, 'resolved')}
                                        >
                                            Закрыть
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

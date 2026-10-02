import { Link } from 'react-router-dom';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead, AdminTable, AdminBadge, AdminActionGroup } from '../admin/AdminShell';
import { companySlugFromName } from '../../data/companyAdminData';

const MOD_LABELS = {
    approved: 'Одобрено',
    pending: 'На проверке',
    flagged: 'Помечено',
    rejected: 'Отклонено',
};

export function PlatformTasksPage() {
    const { tasks, moderateTask } = usePlatformAdmin();

    return (
        <div className="admin-page">
            <AdminPanelHead title="Модерация заданий" subtitle="Одобрение, отклонение и проверка жалоб" />

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['ID', 'Задание', 'Компания', 'Бюджет', 'Статус', 'Жалобы', 'Действия']}>
                    {tasks.map(task => (
                        <tr key={task.id}>
                            <td><code>{task.platformId}</code></td>
                            <td>
                                <strong>{task.title}</strong>
                                <span className="admin-table-sub">{task.postedAt}</span>
                            </td>
                            <td>
                                <Link to={`/companies/${companySlugFromName(task.company)}`} className="admin-link">
                                    {task.company}
                                </Link>
                            </td>
                            <td>{task.priceLabel}</td>
                            <td>
                                <AdminBadge tone={
                                    task.moderationStatus === 'approved' ? 'green'
                                        : task.moderationStatus === 'flagged' ? 'red'
                                            : task.moderationStatus === 'pending' ? 'orange'
                                                : 'muted'
                                }>
                                    {MOD_LABELS[task.moderationStatus] ?? task.moderationStatus}
                                </AdminBadge>
                            </td>
                            <td className="is-num">{task.reports > 0 ? task.reports : '—'}</td>
                            <td className="admin-table-actions">
                                <AdminActionGroup>
                                    <Link to={`/tasks/${task.id}`} className="admin-btn admin-btn--sm admin-btn--ghost">
                                        Открыть
                                    </Link>
                                    {task.moderationStatus !== 'approved' && (
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn--sm admin-btn--success"
                                            onClick={() => moderateTask(task.id, 'approved')}
                                        >
                                            Одобрить
                                        </button>
                                    )}
                                    {task.moderationStatus !== 'rejected' && (
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn--sm admin-btn--danger"
                                            onClick={() => moderateTask(task.id, 'rejected')}
                                        >
                                            Отклонить
                                        </button>
                                    )}
                                    {task.moderationStatus === 'approved' && task.reports > 0 && (
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn--sm admin-btn--warning"
                                            onClick={() => moderateTask(task.id, 'flagged')}
                                        >
                                            Пометить
                                        </button>
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

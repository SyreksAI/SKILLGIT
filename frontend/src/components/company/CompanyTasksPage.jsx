import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { APPLICANT_STATUSES, getDirectionOptions } from '../../data/companyAdminData';
import { AdminPanelHead, AdminTable, AdminBadge } from '../admin/AdminShell';
import { GhDropdown } from '../ui/GhDropdown';

export function CompanyTasksPage() {
    const { tasks, closeTask, pauseTask, publishTask } = useCompanyAdmin();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const filtered = tasks.filter(t => {
        if (filter === 'active') return t.status === 'published';
        if (filter === 'draft') return t.status === 'draft';
        if (filter === 'paused') return t.status === 'paused';
        if (filter === 'closed') return t.status === 'closed';
        return true;
    });

    return (
        <div className="admin-page">
            <AdminPanelHead
                title="Задания"
                subtitle="Черновики, публикация, пауза и закрытие"
                actions={(
                    <Link to="/company/tasks/new" className="admin-btn admin-btn--primary">
                        + Новое задание
                    </Link>
                )}
            />

            <div className="admin-filters">
                {[
                    ['all', 'Все'],
                    ['active', 'Опубликованные'],
                    ['draft', 'Черновики'],
                    ['paused', 'На паузе'],
                    ['closed', 'Закрытые'],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        className={`admin-filter${filter === id ? ' active' : ''}`}
                        onClick={() => setFilter(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Задание', 'Статус', 'Отклики', 'Бюджет', '']}>
                    {filtered.map(task => (
                        <tr key={task.id}>
                            <td>
                                <strong>{task.title}</strong>
                                <span className="admin-table-sub">{task.postedAt}</span>
                            </td>
                            <td>
                                <AdminBadge tone={
                                    task.status === 'closed' ? 'muted'
                                        : task.status === 'draft' ? 'orange'
                                            : task.status === 'paused' ? 'purple'
                                                : 'green'
                                }>
                                    {task.statusLabel ?? 'Опубликовано'}
                                </AdminBadge>
                            </td>
                            <td>{task.applicants ?? 0}</td>
                            <td>{task.priceLabel}</td>
                            <td className="admin-table-actions">
                                <button type="button" className="admin-link" onClick={() => navigate(`/company/tasks/${task.id}`)}>
                                    Открыть
                                </button>
                                {task.source === 'custom' && task.status === 'draft' && (
                                    <button type="button" className="admin-link" onClick={() => publishTask(task.id)}>Опубликовать</button>
                                )}
                                {task.source === 'custom' && task.status === 'published' && (
                                    <button type="button" className="admin-link" onClick={() => pauseTask(task.id)}>Пауза</button>
                                )}
                                {task.source === 'custom' && task.status === 'paused' && (
                                    <button type="button" className="admin-link" onClick={() => publishTask(task.id)}>Возобновить</button>
                                )}
                                {task.status !== 'closed' && task.source === 'custom' && (
                                    <button type="button" className="admin-link admin-link--danger" onClick={() => closeTask(task.id)}>
                                        Закрыть
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

export function CompanyTaskNewPage() {
    const { createTask } = useCompanyAdmin();
    const navigate = useNavigate();
    const directions = getDirectionOptions();
    const [form, setForm] = useState({
        title: '',
        desc: '',
        fullDesc: '',
        direction: 'dev',
        price: 10000,
        days: 5,
        level: 'junior',
        tags: '',
    });
    const [saved, setSaved] = useState(false);

    function handleSubmit(e, asDraft = false) {
        e.preventDefault();
        const task = createTask({
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            status: asDraft ? 'draft' : 'published',
        });
        setSaved(true);
        setTimeout(() => navigate(`/company/tasks/${task.id}`), 600);
    }

    return (
        <div className="admin-page">
            <AdminPanelHead title="Новое задание" subtitle="Опубликовать сразу или сохранить как черновик" />

            <form className="admin-card admin-form" onSubmit={e => handleSubmit(e, false)}>
                <label className="admin-field">
                    <span>Название</span>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Краткое описание</span>
                    <textarea required rows={2} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Полное ТЗ (Markdown)</span>
                    <textarea rows={6} value={form.fullDesc} onChange={e => setForm({ ...form, fullDesc: e.target.value })} placeholder="## Описание..." />
                </label>
                <div className="admin-form-row">
                    <label className="admin-field">
                        <span>Направление</span>
                        <GhDropdown
                            label={directions.find(d => d.id === form.direction)?.label}
                            value={form.direction}
                            options={directions}
                            onChange={direction => setForm({ ...form, direction })}
                        />
                    </label>
                    <label className="admin-field">
                        <span>Бюджет, ₽</span>
                        <input type="number" min={1000} required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </label>
                    <label className="admin-field">
                        <span>Срок, дней</span>
                        <input type="number" min={1} required value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} />
                    </label>
                </div>
                <label className="admin-field">
                    <span>Теги (через запятую)</span>
                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Python, React..." />
                </label>
                <div className="admin-form-actions">
                    <Link to="/company/tasks" className="admin-btn admin-btn--ghost">Отмена</Link>
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={e => handleSubmit(e, true)}>
                        Черновик
                    </button>
                    <button type="submit" className="admin-btn admin-btn--primary">
                        {saved ? 'Сохранено!' : 'Опубликовать'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function CompanyTaskDetailPage() {
    const { id } = useParams();
    const { tasks, applicants, updateApplicantStatus, createDealFromApplicant } = useCompanyAdmin();
    const task = tasks.find(t => String(t.id) === id);
    const taskApplicants = applicants.filter(a => String(a.taskId) === id);

    if (!task) {
        return (
            <div className="admin-page">
                <AdminPanelHead title="Задание не найдено" />
                <Link to="/company/tasks" className="admin-link">← К списку</Link>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <AdminPanelHead
                title={task.title}
                subtitle={`${task.priceLabel} · ${task.daysLabel} · ${task.applicants ?? 0} откликов`}
            />

            <div className="admin-split">
                <section className="admin-card">
                    <h2>Описание</h2>
                    <p className="admin-text">{task.desc}</p>
                    <div className="admin-tags">
                        {task.tags?.map(tag => <span key={tag}>{tag}</span>)}
                    </div>
                    <Link to={`/tasks/${task.id}`} className="admin-link" target="_blank" rel="noreferrer">
                        Посмотреть как студент →
                    </Link>
                </section>

                <section className="admin-card">
                    <h2>Отклики ({taskApplicants.length})</h2>
                    {taskApplicants.length === 0 ? (
                        <p className="admin-empty-text">Пока нет откликов на это задание</p>
                    ) : (
                        <ul className="admin-list">
                            {taskApplicants.map(a => (
                                <li key={a.id} className="admin-list-item admin-list-item--stack">
                                    <div className="admin-list-row">
                                        <span className="admin-list-avatar">{a.avatar}</span>
                                        <div className="admin-list-body">
                                            <strong>{a.userName}</strong>
                                            <span>★ {a.rating} · {a.appliedAt}</span>
                                        </div>
                                    </div>
                                    <p className="admin-text-sm">{a.cover}</p>
                                    <div className="admin-inline-actions">
                                        <select
                                            className="admin-select"
                                            value={a.status}
                                            onChange={e => updateApplicantStatus(a.id, e.target.value)}
                                        >
                                            {APPLICANT_STATUSES.map(s => (
                                                <option key={s.id} value={s.id}>{s.label}</option>
                                            ))}
                                        </select>
                                        {a.status === 'offer' && (
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn--sm admin-btn--primary"
                                                onClick={() => createDealFromApplicant(a.id, task.price ?? 15000)}
                                            >
                                                Сделка
                                            </button>
                                        )}
                                        <Link to={`/company/messages?thread=${a.id}`} className="admin-btn admin-btn--ghost admin-btn--sm">
                                            Написать
                                        </Link>
                                        <Link to={`/users/${a.username}`} className="admin-link">Профиль</Link>
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

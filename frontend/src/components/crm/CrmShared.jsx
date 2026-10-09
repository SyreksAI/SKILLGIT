import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStatusMeta } from '../../data/companyAdminData';

export function CrmBarChart({ data, labels, color = 'var(--brand)', height = 120 }) {
    const max = Math.max(...data, 1);
    return (
        <div className="crm-chart crm-chart--bar" style={{ height }}>
            {data.map((value, index) => (
                <div key={labels?.[index] ?? index} className="crm-chart-col">
                    <div
                        className="crm-chart-bar"
                        style={{ height: `${(value / max) * 100}%`, background: color }}
                        title={`${labels?.[index] ?? ''}: ${value}`}
                    />
                    {labels && <span className="crm-chart-label">{labels[index]}</span>}
                </div>
            ))}
        </div>
    );
}

export function CrmSparkline({ data, color = 'var(--brand)' }) {
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - (v / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg className="crm-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline fill="none" stroke={color} strokeWidth="3" points={points} vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

export function CrmTimeline({ items, empty = 'Нет событий' }) {
    if (!items?.length) return <p className="admin-empty-text">{empty}</p>;
    return (
        <ul className="crm-timeline">
            {items.map(item => (
                <li key={item.id} className={`crm-timeline-item crm-timeline-item--${item.type ?? item.severity ?? 'default'}`}>
                    <span className="crm-timeline-dot" />
                    <div>
                        <p>{item.text}</p>
                        <span>{item.actor ? `${item.actor} · ` : ''}{item.time}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function CrmSearchBar({ value, onChange, placeholder = 'Поиск кандидатов, задач, сделок...' }) {
    return (
        <div className="crm-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
                type="search"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

export function CrmTopBar({ search, onSearchChange, searchPlaceholder, actions }) {
    return (
        <header className="crm-topbar">
            <CrmSearchBar value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
            {actions && <div className="crm-topbar-actions">{actions}</div>}
        </header>
    );
}

export function ApplicantStatusBadge({ status }) {
    const meta = getStatusMeta(status);
    return (
        <span className="crm-status-badge" style={{ background: `${meta.color}18`, color: meta.color }}>
            {meta.label}
        </span>
    );
}

export function CrmKanbanCard({ applicant, onOpen, onMoveNext, onMovePrev, team }) {
    const assignee = team?.find(m => m.id === applicant.assigneeId);
    return (
        <article className="crm-kanban-card" onClick={() => onOpen?.(applicant)}>
            <div className="crm-kanban-card-head">
                <span className="admin-list-avatar">{applicant.avatar}</span>
                <div>
                    <strong>{applicant.userName}</strong>
                    {applicant.rating && <span>★ {applicant.rating}</span>}
                </div>
            </div>
            <p className="crm-kanban-card-task">{applicant.taskTitle}</p>
            {applicant.tags?.length > 0 && (
                <div className="crm-kanban-tags">
                    {applicant.tags.map(tag => <span key={tag}>{tag}</span>)}
                </div>
            )}
            <footer className="crm-kanban-card-foot">
                <span>{applicant.appliedAt}</span>
                {assignee && <span className="crm-assignee">{assignee.avatar}</span>}
            </footer>
            <div className="crm-kanban-card-actions" onClick={e => e.stopPropagation()}>
                {onMovePrev && (
                    <button type="button" className="crm-kanban-move" onClick={() => onMovePrev(applicant)} aria-label="Назад">←</button>
                )}
                {onMoveNext && (
                    <button type="button" className="crm-kanban-move" onClick={() => onMoveNext(applicant)} aria-label="Вперёд">→</button>
                )}
            </div>
        </article>
    );
}

function AddNoteForm({ onAdd }) {
    const [text, setText] = useState('');
    function submit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text.trim());
        setText('');
    }
    return (
        <form className="crm-note-form" onSubmit={submit}>
            <textarea rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="Добавить заметку..." />
            <button type="submit" className="admin-btn admin-btn--sm admin-btn--primary">Сохранить</button>
        </form>
    );
}

function localDateAfter(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function CrmCandidateDrawer({ applicant, notes, team, onClose, onStatusChange, onAddNote, onAssign, onCreateDeal, basePath = '/company' }) {
    const navigate = useNavigate();
    const [dealAmount, setDealAmount] = useState(15000);
    const [dealError, setDealError] = useState('');
    const [dealSaving, setDealSaving] = useState(false);
    const [milestones, setMilestones] = useState(() => [{ title: 'Передача готового результата', dueDate: localDateAfter(7) }]);
    useEffect(() => {
        setMilestones([{ title: 'Передача готового результата', dueDate: localDateAfter(7) }]);
        setDealAmount(15000);
        setDealError('');
    }, [applicant?.id]);

    if (!applicant) return null;

    const assignee = team?.find(m => m.id === applicant.assigneeId);
    const repoPath = applicant.labskillRepo?.includes('/')
        ? `/labskill/${applicant.labskillRepo}`
        : null;

    async function handleCreateDeal() {
        setDealError('');
        setDealSaving(true);
        try {
            await onCreateDeal(applicant.id, dealAmount, milestones);
            onClose();
        } catch (error) {
            setDealError(error.message || 'Не удалось создать сделку');
        } finally {
            setDealSaving(false);
        }
    }

    return (
        <div className="crm-drawer-overlay" onClick={onClose}>
            <aside className="crm-drawer" onClick={e => e.stopPropagation()}>
                <header className="crm-drawer-head">
                    <div className="crm-drawer-user">
                        <span className="admin-list-avatar">{applicant.avatar}</span>
                        <div>
                            <h2>{applicant.userName}</h2>
                            <Link to={`/users/${applicant.username}`}>@{applicant.username}</Link>
                        </div>
                    </div>
                    <button type="button" className="crm-drawer-close" onClick={onClose}>×</button>
                </header>

                <div className="crm-drawer-body">
                    <ApplicantStatusBadge status={applicant.status} />
                    <p className="admin-text">{applicant.cover}</p>

                    <div className="crm-drawer-meta">
                        <div><span>Задача</span><strong>{applicant.taskTitle}</strong></div>
                        {applicant.rating && <div><span>Рейтинг</span><strong>★ {applicant.rating}</strong></div>}
                        <div><span>Источник</span><strong>{applicant.source}</strong></div>
                        {applicant.interviewAt && <div><span>Интервью</span><strong>{applicant.interviewAt}</strong></div>}
                        {repoPath && (
                            <div><span>LabSkill</span><Link to={repoPath}>{applicant.labskillRepo}</Link></div>
                        )}
                    </div>

                    <div className="crm-drawer-skills">
                        {applicant.skills?.map(s => <span key={s}>{s}</span>)}
                    </div>

                    <label className="admin-field">
                        <span>Этап воронки</span>
                        <select value={applicant.status} onChange={e => onStatusChange(applicant.id, e.target.value)}>
                            {['new', 'review', 'interview', 'offer', 'hired', 'rejected'].map(id => (
                                <option key={id} value={id}>{getStatusMeta(id).label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="admin-field">
                        <span>Ответственный</span>
                        <select value={applicant.assigneeId ?? ''} onChange={e => onAssign(applicant.id, e.target.value ? Number(e.target.value) : null)}>
                            <option value="">Не назначен</option>
                            {team?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </label>

                    <section className="crm-drawer-notes">
                        <h3>Заметки {assignee && <small>· {assignee.name}</small>}</h3>
                        <ul>
                            {(notes ?? []).map(note => (
                                <li key={note.id}>
                                    <strong>{note.author}</strong>
                                    <p>{note.text}</p>
                                    <time>{note.date}</time>
                                </li>
                            ))}
                        </ul>
                        <AddNoteForm onAdd={text => onAddNote(applicant.id, text)} />
                    </section>
                </div>

                <footer className="crm-drawer-foot">
                    {['offer', 'hired'].includes(applicant.status) && onCreateDeal && (
                        <div className="crm-deal-create">
                            <label className="admin-field">
                                <span>Сумма сделки</span>
                                <input aria-label="Сумма сделки" type="number" min="1" value={dealAmount} onChange={event => setDealAmount(Number(event.target.value))} />
                            </label>
                            <div className="crm-deal-schedule-head">
                                <div>
                                    <strong>Этапы и сроки</strong>
                                    <span>Сумма разделится между этапами поровну</span>
                                </div>
                                <button type="button" className="admin-link" onClick={() => setMilestones(items => [...items, { title: '', dueDate: items.at(-1)?.dueDate || localDateAfter(14) }])}>
                                    + Этап
                                </button>
                            </div>
                            <div className="crm-deal-schedule-list">
                                {milestones.map((milestone, index) => (
                                    <div className="crm-deal-schedule-row" key={index}>
                                        <input
                                            aria-label={`Название этапа ${index + 1}`}
                                            type="text"
                                            required
                                            maxLength={120}
                                            placeholder={`Этап ${index + 1}`}
                                            value={milestone.title}
                                            onChange={event => setMilestones(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))}
                                        />
                                        <input
                                            aria-label={`Срок этапа ${index + 1}`}
                                            type="date"
                                            required
                                            min={localDateAfter(0)}
                                            value={milestone.dueDate}
                                            onChange={event => setMilestones(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, dueDate: event.target.value } : item))}
                                        />
                                        {milestones.length > 1 && (
                                            <button type="button" className="crm-deal-stage-remove" aria-label={`Удалить этап ${index + 1}`} onClick={() => setMilestones(items => items.filter((_, itemIndex) => itemIndex !== index))}>×</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="admin-btn admin-btn--primary" onClick={handleCreateDeal} disabled={dealSaving || dealAmount < 1 || milestones.some(item => !item.title.trim() || !item.dueDate)}>
                                {dealSaving ? 'Создаём…' : 'Создать сделку'}
                            </button>
                            {dealError && <p className="auth-error" role="alert">{dealError}</p>}
                        </div>
                    )}
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate(`${basePath}/messages?thread=${applicant.id}`)}>
                        Написать
                    </button>
                    <button type="button" className="admin-btn admin-btn--primary" onClick={() => navigate(`${basePath}/messages?thread=${applicant.id}`)}>
                        Открыть чат
                    </button>
                </footer>
            </aside>
        </div>
    );
}

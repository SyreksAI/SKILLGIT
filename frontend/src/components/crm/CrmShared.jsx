import { useState } from 'react';
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
                    <span>★ {applicant.rating}</span>
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

export function CrmCandidateDrawer({ applicant, notes, team, onClose, onStatusChange, onAddNote, onAssign, onCreateDeal, basePath = '/company' }) {
    const navigate = useNavigate();
    if (!applicant) return null;

    const assignee = team?.find(m => m.id === applicant.assigneeId);
    const repoPath = applicant.labskillRepo?.includes('/')
        ? `/labskill/${applicant.labskillRepo}`
        : null;

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
                        <div><span>Рейтинг</span><strong>★ {applicant.rating}</strong></div>
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
                    {applicant.status === 'offer' && onCreateDeal && (
                        <button
                            type="button"
                            className="admin-btn admin-btn--primary"
                            onClick={() => {
                                onCreateDeal(applicant.id, 15000);
                                onClose();
                            }}
                        >
                            Сделка · 15 000 ₽
                        </button>
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

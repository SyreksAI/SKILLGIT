import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTaskById, getDirectionLabel } from '../../data/mockData';
import { companySlugFromName } from '../../data/companyAdminData';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { HeaderActions } from '../ui/HeaderActions';
import { EmptyState } from '../ui/EmptyState';
import {
    SearchIcon,
    ClockIcon,
    CoinIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    UsersIcon,
    RepoIcon,
} from './icons';

function MarkdownBlock({ text }) {
    const lines = text.split('\n');
    return (
        <div className="markdown-block">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) {
                    return <h3 key={i}>{line.slice(3)}</h3>;
                }
                if (line.startsWith('- ')) {
                    return <li key={i}>{line.slice(2)}</li>;
                }
                if (line.trim() === '') {
                    return <br key={i} />;
                }
                return <p key={i}>{line}</p>;
            })}
        </div>
    );
}

export function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const staticTask = getTaskById(id);
    const { user, accessToken } = useAuth();
    const [companyTask, setCompanyTask] = useState(null);
    const [applied, setApplied] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applying, setApplying] = useState(false);
    const [loading, setLoading] = useState(!staticTask);

    useEffect(() => {
        setCompanyTask(null);
        setLoading(!staticTask);
        if (staticTask) return undefined;
        let cancelled = false;
        api.getTask(id)
            .then(task => { if (!cancelled) setCompanyTask(task); })
            .catch(() => { if (!cancelled) setCompanyTask(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, staticTask]);

    const task = staticTask ?? companyTask;
    const companySlug = task ? (task.companySlug || companySlugFromName(task.company)) : '';

    async function handleApply() {
        setApplyError('');
        if (!accessToken || !user) {
            navigate('/login?accountType=performer', { state: { from: { pathname: `/tasks/${id}` } } });
            return;
        }
        if (user.accountType !== 'performer') return;
        setApplying(true);
        try {
            await api.applyToTask(id, { cover: '' }, accessToken);
            setApplied(true);
        } catch (error) {
            if (error.message.includes('уже откликнулись')) setApplied(true);
            else setApplyError(error.message || 'Не удалось отправить отклик');
        } finally {
            setApplying(false);
        }
    }

    if (!task) {
        if (loading) return <div className="task-detail-page"><div className="home-empty">Загружаем задание…</div></div>;
        return (
            <div className="task-detail-page">
                <header className="home-header">
                    <div className="home-header-search">
                        <SearchIcon />
                        <input type="text" placeholder="Поиск заданий..." readOnly />
                    </div>
                    <HeaderActions />
                </header>
                <EmptyState
                    title="Задание не найдено"
                    description="Возможно, оно было удалено или ссылка неверна"
                    action={
                        <Link to="/" className="task-detail-btn task-detail-btn-primary">
                            На главную
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="task-detail-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск заданий, компаний, технологий..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <Link to="/" className="task-detail-back">← Все задания</Link>

            <div className="task-detail-layout">
                <div className="task-detail-main">
                    <header className="task-detail-head">
                        <div
                            className="task-detail-logo"
                            style={{ background: task.companyColor }}
                        >
                            {task.company.charAt(0)}
                        </div>
                        <div>
                            <Link to={`/companies/${companySlug}`} className="task-detail-company">
                                {task.company}
                            </Link>
                            <h1>{task.title}</h1>
                            <div className="task-detail-badges">
                                <span className={`badge badge--${task.badge.kind}`}>
                                    {task.badge.text}
                                </span>
                                <span className="task-detail-direction">
                                    {getDirectionLabel(task.direction)}
                                </span>
                                {task.verified && (
                                    <span className="verified-badge">
                                        <CheckCircleIcon />
                                        Проверенная компания
                                    </span>
                                )}
                                <span className="task-posted">{task.postedAt}</span>
                            </div>
                            <div className="task-tags task-tags-lg">
                                {task.tags.map(tag => (
                                    <span key={tag} className="task-tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </header>

                    <section className="task-detail-section">
                        <h2>Описание</h2>
                        <p className="task-desc task-desc-full">{task.desc}</p>
                    </section>

                    {task.fullDesc && (
                        <section className="task-detail-section">
                            <h2>Детали задания</h2>
                            <MarkdownBlock text={task.fullDesc} />
                        </section>
                    )}

                    <section className="task-detail-section task-detail-section-muted">
                        <h2>Что будет после выполнения</h2>
                        <ul className="task-detail-benefits">
                            <li><CheckCircleIcon /> Задача попадёт в LabSkill-портфолио</li>
                            <li><CoinIcon /> Оплата на баланс SKILLGIT</li>
                            <li><UsersIcon /> Отзыв от компании в профиле</li>
                        </ul>
                    </section>
                </div>

                <aside className="task-detail-sidebar">
                    <div className="task-detail-card">
                        <div className="task-detail-stat">
                            <CoinIcon />
                            <div>
                                <span>Оплата</span>
                                <strong>{task.priceLabel}</strong>
                            </div>
                        </div>
                        <div className="task-detail-stat">
                            <ClockIcon />
                            <div>
                                <span>Срок</span>
                                <strong>{task.daysLabel}</strong>
                            </div>
                        </div>
                        <hr className="sidebar-divider" />
                        <div className="sidebar-info-row">
                            <span>Откликов</span>
                            <strong>{task.applicants}</strong>
                        </div>
                        <div className="sidebar-info-row">
                            <span>Уровень</span>
                            <strong>{task.level === 'junior' ? 'Junior' : task.level}</strong>
                        </div>

                        {applied ? (
                            <div className="applied-notice">
                                <CheckCircleIcon />
                                Отклик отправлен! Компания свяжется с тобой в чате.
                            </div>
                        ) : user?.accountType === 'customer' ? (
                            <div className="applied-notice">Откликнуться на задание может аккаунт исполнителя.</div>
                        ) : (
                            <button
                                type="button"
                                className="task-detail-btn task-detail-btn-primary"
                                onClick={handleApply}
                                disabled={applying}
                            >
                                {applying ? 'Отправляем…' : 'Откликнуться'}
                                {!applying && <ArrowRightIcon />}
                            </button>
                        )}
                        {applyError && <p className="auth-error" role="alert">{applyError}</p>}

                        <Link to="/chat" className="task-detail-btn task-detail-btn-ghost">
                            Задать вопрос
                        </Link>
                    </div>

                    <div className="task-detail-card task-detail-card-muted">
                        <div className="task-detail-card-title"><RepoIcon /> LabSkill</div>
                        <p>
                            После выполнения задача автоматически попадёт в портфолио
                            как репозиторий.
                        </p>
                        <Link to="/labskill" className="task-detail-link">
                            Моё портфолио <ArrowRightIcon />
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}

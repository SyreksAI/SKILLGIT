import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon } from './icons';

const DEAL_STATUS_LABELS = {
    planning: 'Нужен план этапов',
    active: 'В работе',
    in_review: 'На проверке',
    revision: 'Нужна доработка',
    completed: 'Завершена',
};

const MILESTONE_STATUS_LABELS = {
    pending: 'Ожидает',
    active: 'Текущий этап',
    submitted: 'На проверке',
    revision: 'Нужна доработка',
    approved: 'Принят',
};

function formatAmount(value) {
    return `${Number(value ?? 0).toLocaleString('ru-RU')} ₽`;
}

export function PerformerDealsPage() {
    const { user, accessToken } = useAuth();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [drafts, setDrafts] = useState({});
    const [submittingKey, setSubmittingKey] = useState('');
    const [submitErrors, setSubmitErrors] = useState({});
    const dealsSnapshot = useRef('');

    useEffect(() => {
        if (!accessToken || user?.accountType !== 'performer') return undefined;
        let cancelled = false;
        const refresh = async () => {
            try {
                const result = await api.getMyDeals(accessToken);
                if (!cancelled) {
                    setDeals(result);
                    const snapshot = JSON.stringify(result);
                    if (snapshot !== dealsSnapshot.current) {
                        dealsSnapshot.current = snapshot;
                        window.dispatchEvent(new Event('skillgit:profile-refresh'));
                    }
                    setLoadError('');
                }
            } catch (error) {
                if (!cancelled) setLoadError(error.message || 'Не удалось загрузить сделки');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        refresh();
        const timer = window.setInterval(refresh, 15000);
        return () => { cancelled = true; window.clearInterval(timer); };
    }, [accessToken, user?.accountType]);

    if (!accessToken || !user) return <Navigate to="/login?accountType=performer" replace />;
    if (user.accountType !== 'performer') return <Navigate to="/company/dashboard" replace />;

    async function submitMilestone(deal, milestone) {
        const key = `${deal.companyId}-${deal.id}-${milestone.id}`;
        const draft = drafts[key] ?? { message: '', url: '' };
        if (draft.message.trim().length < 5) {
            setSubmitErrors(previous => ({ ...previous, [key]: 'Добавьте короткое описание переданного результата.' }));
            return;
        }
        setSubmittingKey(key);
        setSubmitErrors(previous => ({ ...previous, [key]: '' }));
        try {
            const updated = await api.submitDealMilestone(
                deal.companyId,
                deal.id,
                milestone.id,
                { message: draft.message.trim(), url: draft.url.trim() || null },
                accessToken,
            );
            setDeals(previous => previous.map(item => item.companyId === deal.companyId && item.id === deal.id ? { ...item, ...updated } : item));
            window.dispatchEvent(new Event('skillgit:profile-refresh'));
        } catch (error) {
            setSubmitErrors(previous => ({ ...previous, [key]: error.message || 'Не удалось отправить этап на проверку.' }));
        } finally {
            setSubmittingKey('');
        }
    }

    return (
        <div className="performer-deals-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Мои сделки" readOnly />
                </div>
                <HeaderActions />
            </header>

            <main className="performer-deals-content">
                <header className="performer-deals-heading">
                    <div>
                        <span className="performer-deals-eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</span>
                        <h1>Мои сделки</h1>
                        <p>Сроки этапов, сдача результата и обратная связь заказчика.</p>
                    </div>
                    <Link to="/tasks" className="admin-btn admin-btn--ghost">Найти задание</Link>
                </header>

                {loadError && <p className="auth-error" role="alert">{loadError}</p>}
                {loading ? (
                    <div className="performer-deals-empty">Загружаем сделки…</div>
                ) : deals.length === 0 ? (
                    <section className="performer-deals-empty">
                        <span className="performer-deals-empty-icon">↗</span>
                        <h2>Пока нет активных сделок</h2>
                        <p>После того как заказчик наймёт вас, здесь появятся план работы и этапы.</p>
                        <Link to="/tasks" className="admin-btn admin-btn--primary">Посмотреть задания</Link>
                    </section>
                ) : (
                    <div className="performer-deals-list">
                        {deals.map(deal => {
                            const current = deal.milestones?.find(item => item.id === deal.currentMilestoneId);
                            const paidPercent = deal.amount ? Math.min(100, Math.round((deal.paid / deal.amount) * 100)) : 0;
                            return (
                                <article className="performer-deal-card" key={`${deal.companyId}-${deal.id}`}>
                                    <header className="performer-deal-head">
                                        <div className="performer-deal-company-avatar">{deal.companyName?.charAt(0) ?? 'З'}</div>
                                        <div className="performer-deal-title">
                                            <span>{deal.companyName}</span>
                                            <h2>{deal.taskTitle}</h2>
                                        </div>
                                        <span className={`performer-deal-status performer-deal-status--${deal.status}`}>
                                            {DEAL_STATUS_LABELS[deal.status] ?? 'В работе'}
                                        </span>
                                    </header>

                                    <div className="performer-deal-summary">
                                        <div><span>Сумма договора</span><strong>{formatAmount(deal.amount)}</strong></div>
                                        <div><span>Выплачено</span><strong>{formatAmount(deal.paid)}</strong></div>
                                        <div><span>Оплата</span><strong>{paidPercent}%</strong></div>
                                    </div>
                                    <div className="performer-deal-progress"><span style={{ width: `${paidPercent}%` }} /></div>

                                    {!deal.milestones?.length ? (
                                        <p className="performer-deal-note">Заказчик пока настраивает этапы и сроки.</p>
                                    ) : (
                                        <ol className="performer-deal-milestones">
                                            {deal.milestones.map(milestone => {
                                                const key = `${deal.companyId}-${deal.id}-${milestone.id}`;
                                                const editable = current?.id === milestone.id && ['active', 'revision'].includes(milestone.status);
                                                return (
                                                    <li className={`performer-deal-milestone performer-deal-milestone--${milestone.status}`} key={milestone.id}>
                                                        <div className="performer-deal-milestone-top">
                                                            <div><strong>{milestone.title}</strong><span>Срок: {milestone.dueDate} · {formatAmount(milestone.amount)}</span></div>
                                                            <span className="performer-deal-milestone-status">{MILESTONE_STATUS_LABELS[milestone.status] ?? milestone.status}</span>
                                                        </div>
                                                        {milestone.feedback && <p className="performer-deal-feedback"><strong>Комментарий заказчика:</strong> {milestone.feedback}</p>}
                                                        {milestone.submission && !editable && (
                                                            <div className="performer-deal-submission">
                                                                <p>{milestone.submission.message}</p>
                                                                {milestone.submission.url && <a href={milestone.submission.url} target="_blank" rel="noreferrer">Открыть результат ↗</a>}
                                                                {milestone.status === 'submitted' && <span>Ожидает проверки заказчиком</span>}
                                                            </div>
                                                        )}
                                                        {editable && (
                                                            <div className="performer-deal-submit-form">
                                                                <label>
                                                                    <span>{milestone.status === 'revision' ? 'Что исправлено' : 'Описание результата'}</span>
                                                                    <textarea rows={3} value={drafts[key]?.message ?? ''} onChange={event => setDrafts(previous => ({ ...previous, [key]: { ...previous[key], message: event.target.value } }))} placeholder="Кратко опишите, что готово…" />
                                                                </label>
                                                                <label>
                                                                    <span>Ссылка на результат (необязательно)</span>
                                                                    <input type="url" value={drafts[key]?.url ?? ''} onChange={event => setDrafts(previous => ({ ...previous, [key]: { ...previous[key], url: event.target.value } }))} placeholder="https://…" />
                                                                </label>
                                                                {submitErrors[key] && <p className="auth-error" role="alert">{submitErrors[key]}</p>}
                                                                <button type="button" className="admin-btn admin-btn--primary" disabled={submittingKey === key} onClick={() => submitMilestone(deal, milestone)}>
                                                                    {submittingKey === key ? 'Отправляем…' : 'Сдать этап на проверку'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

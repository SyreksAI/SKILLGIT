import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead, AdminTable, AdminBadge } from '../admin/AdminShell';

const ACTIVE_STATUSES = ['planning', 'active', 'in_review', 'revision'];
const DEAL_FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'В работе' },
    { id: 'in_review', label: 'На проверке' },
    { id: 'completed', label: 'Завершённые' },
];
const DEAL_LABELS = {
    planning: 'Планирование',
    active: 'В работе',
    in_review: 'На проверке',
    revision: 'Нужна доработка',
    completed: 'Завершена',
};
const MILESTONE_LABELS = {
    pending: 'Ожидает',
    active: 'В работе',
    submitted: 'Сдан заказчику',
    revision: 'Нужна доработка',
    approved: 'Принят и оплачен',
};

function money(value) {
    return `${Number(value ?? 0).toLocaleString('ru-RU')} ₽`;
}

function milestoneFilterMatches(deal, filter) {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATUSES.includes(deal.status);
    if (filter === 'in_review') return deal.status === 'in_review';
    return deal.status === filter;
}

export function CompanyDealsPage() {
    const { deals, payDeal, reviewDealMilestone, reviewCompletedDeal, stats } = useCompanyAdmin();
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({});
    const [reviews, setReviews] = useState({});
    const [savingKey, setSavingKey] = useState('');

    const filtered = deals.filter(deal => milestoneFilterMatches(deal, filter));
    const totalActive = deals
        .filter(deal => ACTIVE_STATUSES.includes(deal.status))
        .reduce((sum, deal) => sum + Number(deal.amount ?? 0) - Number(deal.paid ?? 0), 0);

    async function handlePayment(deal) {
        const amount = Math.min(deal.amount - deal.paid, Math.round(deal.amount * 0.5));
        setError('');
        try {
            await payDeal(deal.id, amount);
        } catch (paymentError) {
            setError(paymentError.message || 'Не удалось провести выплату');
        }
    }

    async function handleMilestoneReview(deal, milestone, decision) {
        const key = `${deal.id}-${milestone.id}`;
        const note = (feedback[key] ?? '').trim();
        if (decision === 'revision' && note.length < 5) {
            setError('Добавьте комментарий с описанием необходимых доработок.');
            return;
        }
        setError('');
        setSavingKey(key);
        try {
            await reviewDealMilestone(deal.id, milestone.id, decision, note);
            setFeedback(previous => ({ ...previous, [key]: '' }));
        } catch (reviewError) {
            setError(reviewError.message || 'Не удалось обработать этап');
        } finally {
            setSavingKey('');
        }
    }

    async function handleDealReview(deal) {
        const draft = reviews[deal.id] ?? { rating: 5, text: '' };
        if (draft.text.trim().length < 3) {
            setError('Напишите короткий отзыв перед отправкой.');
            return;
        }
        setError('');
        setSavingKey(`review-${deal.id}`);
        try {
            await reviewCompletedDeal(deal.id, Number(draft.rating), draft.text.trim());
        } catch (reviewError) {
            setError(reviewError.message || 'Не удалось сохранить отзыв');
        } finally {
            setSavingKey('');
        }
    }

    return (
        <div className="admin-page company-deals-page">
            <AdminPanelHead
                title="Сделки и выплаты"
                subtitle={`${stats.activeDeals} активных · к выплате ${money(totalActive)}`}
            />

            <div className="admin-filters">
                {DEAL_FILTERS.map(item => (
                    <button key={item.id} type="button" className={`admin-filter${filter === item.id ? ' active' : ''}`} onClick={() => setFilter(item.id)}>
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="admin-card admin-card--flush">
                {error && <p className="auth-error company-deals-error" role="alert">{error}</p>}
                <AdminTable columns={['Кандидат', 'Задача', 'Сумма', 'Прогресс', 'Статус', '']} empty={filtered.length ? undefined : 'Сделки появятся здесь, когда вы создадите их из оффера кандидату.'}>
                    {filtered.map(deal => (
                        <Fragment key={deal.id}>
                            <tr>
                                <td>
                                    <strong>{deal.candidateName}</strong>
                                    <span className="admin-table-sub">@{deal.username}</span>
                                </td>
                                <td>{deal.taskTitle}</td>
                                <td>{money(deal.amount)}</td>
                                <td>
                                    <div className="crm-progress">
                                        <div className="crm-progress-bar" style={{ width: `${deal.progress}%` }} />
                                        <span>{money(deal.paid)} / {money(deal.amount)}</span>
                                    </div>
                                </td>
                                <td>
                                    <AdminBadge tone={deal.status === 'completed' ? 'green' : deal.status === 'in_review' ? 'orange' : 'blue'}>
                                        {DEAL_LABELS[deal.status] ?? deal.status}
                                    </AdminBadge>
                                </td>
                                <td className="admin-table-actions">
                                    {deal.status === 'active' && !deal.milestones?.length && deal.paid < deal.amount && (
                                        <button type="button" className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handlePayment(deal)}>
                                            Провести выплату
                                        </button>
                                    )}
                                    <Link to={`/users/${deal.username}`} className="admin-link">Профиль</Link>
                                </td>
                            </tr>
                            {deal.milestones?.length > 0 && (
                                <tr className="crm-deal-workflow-row">
                                    <td colSpan={6}>
                                        <details className="crm-deal-workflow">
                                            <summary>Этапы сделки <span>{deal.milestones.filter(item => item.status === 'approved').length} из {deal.milestones.length} принято</span></summary>
                                            <ol className="crm-deal-milestones">
                                                {deal.milestones.map(milestone => {
                                                    const key = `${deal.id}-${milestone.id}`;
                                                    const note = feedback[key] ?? '';
                                                    return (
                                                        <li className={`crm-deal-milestone crm-deal-milestone--${milestone.status}`} key={milestone.id}>
                                                            <div className="crm-deal-milestone-head">
                                                                <div>
                                                                    <strong>{milestone.title}</strong>
                                                                    <span>Срок: {milestone.dueDate} · {money(milestone.amount)}</span>
                                                                </div>
                                                                <AdminBadge tone={milestone.status === 'approved' ? 'green' : milestone.status === 'submitted' ? 'orange' : 'blue'}>
                                                                    {MILESTONE_LABELS[milestone.status] ?? milestone.status}
                                                                </AdminBadge>
                                                            </div>
                                                            {milestone.submission && (
                                                                <div className="crm-deal-submission">
                                                                    <p>{milestone.submission.message}</p>
                                                                    {milestone.submission.url && <a href={milestone.submission.url} target="_blank" rel="noreferrer">Открыть результат ↗</a>}
                                                                </div>
                                                            )}
                                                            {milestone.feedback && <p className="crm-deal-feedback"><strong>Комментарий:</strong> {milestone.feedback}</p>}
                                                            {milestone.status === 'submitted' && (
                                                                <div className="crm-deal-review-controls">
                                                                    <label>
                                                                        Комментарий исполнителю
                                                                        <textarea rows={2} value={note} onChange={event => setFeedback(previous => ({ ...previous, [key]: event.target.value }))} placeholder="При необходимости опишите, что улучшить…" />
                                                                    </label>
                                                                    <div>
                                                                        <button type="button" className="admin-btn admin-btn--sm admin-btn--primary" disabled={savingKey === key} onClick={() => handleMilestoneReview(deal, milestone, 'approve')}>
                                                                            {savingKey === key ? 'Сохраняем…' : `Принять и выплатить ${money(milestone.amount)}`}
                                                                        </button>
                                                                        <button type="button" className="admin-btn admin-btn--sm admin-btn--ghost" disabled={savingKey === key} onClick={() => handleMilestoneReview(deal, milestone, 'revision')}>
                                                                            Запросить доработку
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ol>
                                            {deal.status === 'completed' && !deal.review && (
                                                <div className="crm-deal-review-form">
                                                    <h3>Оценить работу исполнителя</h3>
                                                    <div className="crm-deal-review-inputs">
                                                        <label>
                                                            Оценка
                                                            <select value={reviews[deal.id]?.rating ?? 5} onChange={event => setReviews(previous => ({ ...previous, [deal.id]: { rating: Number(event.target.value), text: previous[deal.id]?.text ?? '' } }))}>
                                                                {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} из 5</option>)}
                                                            </select>
                                                        </label>
                                                        <label>
                                                            Отзыв
                                                            <textarea rows={2} value={reviews[deal.id]?.text ?? ''} onChange={event => setReviews(previous => ({ ...previous, [deal.id]: { rating: previous[deal.id]?.rating ?? 5, text: event.target.value } }))} placeholder="Что получилось хорошо?" />
                                                        </label>
                                                        <button type="button" className="admin-btn admin-btn--sm admin-btn--primary" disabled={savingKey === `review-${deal.id}`} onClick={() => handleDealReview(deal)}>
                                                            {savingKey === `review-${deal.id}` ? 'Сохраняем…' : 'Оставить отзыв'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {deal.review && <p className="crm-deal-review-saved">Отзыв оставлен · {'★'.repeat(deal.review.rating)}{'☆'.repeat(5 - deal.review.rating)} — {deal.review.text}</p>}
                                        </details>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

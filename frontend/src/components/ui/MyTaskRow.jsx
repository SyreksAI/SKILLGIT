import { Link } from 'react-router-dom';
import { CoinIcon, CalendarIcon, ArrowRightIcon } from '../pages/icons';

const STATUS_CLASS = {
    in_progress: 'active',
    applied: 'active',
    review: 'review',
    completed: 'completed',
};

const STATUS_LABEL = {
    in_progress: 'Активная',
    applied: 'Активная',
    review: 'На проверке',
    completed: 'Выполнено',
};

export function MyTaskRow({ task }) {
    const statusKind = STATUS_CLASS[task.status] ?? 'active';
    const statusLabel = STATUS_LABEL[task.status] ?? task.statusLabel;

    return (
        <article className="my-task-row">
            <div className="my-task-logo" style={{ background: task.companyColor }}>
                {task.company.charAt(0)}
            </div>

            <div className="my-task-body">
                <div className="my-task-company">
                    {task.company}
                    {task.companyType && <span>, {task.companyType}</span>}
                </div>
                <Link to={`/tasks/${task.taskId}`} className="my-task-title">
                    {task.title}
                </Link>
                {task.desc && <p className="my-task-desc">{task.desc}</p>}
                {task.tags?.length > 0 && (
                    <div className="my-task-tags">
                        {task.tags.map(tag => <span key={tag}>{tag}</span>)}
                    </div>
                )}
            </div>

            <div className="my-task-side">
                <div className="my-task-reward">
                    <CoinIcon />
                    {task.priceLabel}
                </div>
                {task.deadline !== '—' && (
                    <div className="my-task-deadline">
                        <CalendarIcon />
                        До {task.deadline}
                    </div>
                )}
                <span className={`my-task-status my-task-status--${statusKind}`}>
                    {statusLabel}
                </span>
            </div>

            <Link to={`/tasks/${task.taskId}`} className="my-task-arrow" aria-label="Открыть задачу">
                <ArrowRightIcon />
            </Link>
        </article>
    );
}

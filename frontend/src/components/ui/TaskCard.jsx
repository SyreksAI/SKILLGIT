import { Link } from 'react-router-dom';
import { ClockIcon } from '../pages/icons';

export function TaskCard({ task, onApply }) {
    return (
        <article className="home-task-card">
            <div className="home-task-head">
                <div className="home-task-company">
                    <span className="home-task-logo" style={{ background: task.companyColor }}>
                        {task.company.charAt(0)}
                    </span>
                    <span className="home-task-company-name">{task.company}</span>
                </div>
                <span className={`badge badge--${task.badge.kind}`}>{task.badge.text}</span>
            </div>

            <Link to={`/tasks/${task.id}`} className="home-task-title">{task.title}</Link>
            <p className="home-task-desc">{task.desc}</p>

            <div className="home-task-tags">
                {task.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            <footer className="home-task-foot">
                <div className="home-task-meta">
                    <span className="home-task-price">{task.priceLabel}</span>
                    <span className="home-task-days"><ClockIcon /> {task.daysLabel}</span>
                </div>
                {onApply ? (
                    <button type="button" className="home-task-btn" onClick={() => onApply(task)}>
                        Откликнуться
                    </button>
                ) : (
                    <Link to={`/tasks/${task.id}`} className="home-task-btn home-task-btn--ghost">
                        Подробнее
                    </Link>
                )}
            </footer>
        </article>
    );
}

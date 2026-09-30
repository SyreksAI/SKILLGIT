import { Link } from 'react-router-dom';

export function TaskRow({ task, onApply, applied }) {
    return (
        <article className="fl-item">
            <div className="fl-item-body">
                <Link to={`/tasks/${task.id}`} className="fl-item-title">
                    {task.title}
                </Link>

                <p className="fl-item-price">{task.priceLabel}</p>

                <p className="fl-item-desc">{task.desc}</p>

                <div className="fl-item-meta">
                    <span className="fl-item-type">Задание</span>
                    <span className="fl-item-dot">·</span>
                    <span>{task.company}</span>
                    <span className="fl-item-dot">·</span>
                    <span>{task.postedAt}</span>
                    <span className="fl-item-dot">·</span>
                    <span className="fl-item-responses">
                        {task.applicants} {responseLabel(task.applicants)}
                    </span>
                </div>

                <div className="fl-item-tags">
                    {task.tags.map(tag => (
                        <span key={tag} className="fl-item-tag">{tag}</span>
                    ))}
                </div>
            </div>

            <div className="fl-item-action">
                {applied ? (
                    <span className="fl-item-applied">Отклик отправлен</span>
                ) : onApply ? (
                    <button type="button" className="fl-btn-offer" onClick={() => onApply(task)}>
                        Откликнуться
                    </button>
                ) : (
                    <Link to={`/tasks/${task.id}`} className="fl-btn-offer fl-btn-offer--ghost">
                        Подробнее
                    </Link>
                )}
            </div>
        </article>
    );
}

function responseLabel(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return 'откликов';
    if (mod10 === 1) return 'отклик';
    if (mod10 >= 2 && mod10 <= 4) return 'отклика';
    return 'откликов';
}

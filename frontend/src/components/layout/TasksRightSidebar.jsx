import { Link } from 'react-router-dom';
import { useModals } from '../../context/ModalsContext';
import {
    CheckCircleIcon,
    ClockIcon,
    CircleIcon,
    TrophyIcon,
    ArrowRightIcon,
} from '../pages/icons';

const TECH_TAGS = [
    { label: 'Python', search: 'Python' },
    { label: 'React', search: 'React' },
    { label: 'JavaScript', search: 'JavaScript' },
    { label: 'Figma', search: 'Figma' },
    { label: 'UI/UX', search: 'UI' },
    { label: 'Docker', search: 'Docker' },
];

export function TasksRightSidebar({ stats }) {
    const { openBalance } = useModals();
    const {
        total,
        completed,
        review,
        active,
        progress,
        balance,
    } = stats;

    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <aside className="tasks-right">
            <div className="widget widget-progress-ring">
                <h3>Ваш прогресс</h3>
                <div className="progress-ring-wrap">
                    <svg className="progress-ring" viewBox="0 0 100 100">
                        <circle className="progress-ring-bg" cx="50" cy="50" r="42" />
                        <circle
                            className="progress-ring-fill"
                            cx="50"
                            cy="50"
                            r="42"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: offset,
                            }}
                        />
                    </svg>
                    <span className="progress-ring-value">{progress}%</span>
                </div>
                <p className="progress-ring-caption">
                    Выполнено заданий <strong>{completed} из {total}</strong>
                </p>
            </div>

            <div className="widget widget-income">
                <h3>Баланс</h3>
                <button type="button" className="widget-income-value widget-income-btn" onClick={openBalance}>
                    {balance}
                </button>
                <button type="button" className="widget-link widget-link-btn" onClick={openBalance}>
                    История операций <ArrowRightIcon />
                </button>
            </div>

            <div className="widget">
                <h3>Статистика</h3>
                <ul className="tasks-stats-list">
                    <li>
                        <Link to="/tasks?filter=all">
                            <span>Всего заданий</span>
                            <strong>{total}</strong>
                        </Link>
                    </li>
                    <li className="done">
                        <Link to="/tasks?filter=completed">
                            <span><CheckCircleIcon /> Выполнено</span>
                            <strong>{completed}</strong>
                        </Link>
                    </li>
                    <li className="review">
                        <Link to="/tasks?filter=review">
                            <span><ClockIcon /> На проверке</span>
                            <strong>{review}</strong>
                        </Link>
                    </li>
                    <li className="active">
                        <Link to="/tasks?filter=active">
                            <span><CircleIcon /> Активные</span>
                            <strong>{active}</strong>
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="widget">
                <h3>Популярные технологии</h3>
                <div className="tech-tags">
                    {TECH_TAGS.map(({ label, search }) => (
                        <Link
                            key={label}
                            to={`/?search=${encodeURIComponent(search)}`}
                            className="tech-tag"
                        >
                            {label}
                        </Link>
                    ))}
                </div>
                <Link to="/" className="widget-link">
                    Все технологии <ArrowRightIcon />
                </Link>
            </div>

            <div className="widget widget-promo">
                <TrophyIcon />
                <strong>Собери сильное портфолио</strong>
                <p>Каждая выполненная задача автоматически попадает в LabSkill</p>
                <Link to="/labskill" className="widget-promo-btn">
                    Перейти в портфолио <ArrowRightIcon />
                </Link>
            </div>
        </aside>
    );
}

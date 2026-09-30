import { Link } from 'react-router-dom';
import { useUserSettings } from '../../context/UserSettingsContext';
import { useModals } from '../../context/ModalsContext';
import { useBalance } from '../../context/BalanceContext';
import { CheckCircleIcon, StarIcon } from '../pages/icons';
import { DirectionIconBadge } from '../ui/DirectionIcon';

const POPULAR = [
    { name: 'Python', count: 254, icon: 'python', search: 'Python' },
    { name: 'React', count: 187, icon: 'react', search: 'React' },
    { name: 'UI/UX', count: 143, icon: 'uiux', search: 'UI' },
    { name: 'QA', count: 98, icon: 'qa', search: 'QA' },
    { name: 'AI / ML', count: 76, icon: 'ai', search: 'AI' },
];

const CHECKLIST = [
    { label: 'Заполнить профиль', done: true, href: '/settings?section=public' },
    { label: 'Добавить портфолио', done: true, href: '/labskill?tab=repositories' },
    { label: 'Пройти тест навыков', done: false, href: '/how-it-works' },
    { label: 'Получить первый отзыв', done: false, href: '/profile?tab=reviews' },
];

export function HomeRightSidebar() {
    const { openBalance } = useModals();
    const { balanceLabel } = useBalance();
    const { user } = useUserSettings();
    const progress = 70;

    return (
        <aside className="home-right">
            <div className="widget widget-profile">
                <Link to="/profile" className="widget-profile-top">
                    <div className="widget-avatar">{user.name.charAt(0)}</div>
                    <div>
                        <strong>{user.name}</strong>
                        <span>{user.role}</span>
                    </div>
                </Link>
                <div className="widget-progress-head">
                    <span>Мой профиль</span>
                    <span>{progress}%</span>
                </div>
                <div className="widget-progress-bar">
                    <div className="widget-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <ul className="widget-checklist">
                    {CHECKLIST.map(item => (
                        <li key={item.label} className={item.done ? 'done' : ''}>
                            <Link to={item.href}>
                                <CheckCircleIcon />
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="widget">
                <h3>Достижения</h3>
                <div className="widget-stats">
                    <Link to="/profile?tab=tasks">
                        <strong>{user.stats.tasksDone}</strong>
                        <span>задач выполнено</span>
                    </Link>
                    <Link to="/team?filter=mine">
                        <strong>8</strong>
                        <span>компаний пригласили</span>
                    </Link>
                    <Link to="/profile?tab=reviews">
                        <strong>{user.stats.rating} <StarIcon /></strong>
                        <span>средний рейтинг</span>
                    </Link>
                    <button type="button" className="widget-stat-btn" onClick={openBalance}>
                        <strong>{balanceLabel}</strong>
                        <span>баланс</span>
                    </button>
                </div>
            </div>

            <div className="widget">
                <h3>Популярные направления</h3>
                <ul className="widget-cats">
                    {POPULAR.map(cat => (
                        <li key={cat.name}>
                            <Link to={`/?search=${encodeURIComponent(cat.search)}`}>
                                <span className="widget-cat-label">
                                    <DirectionIconBadge id={cat.icon} />
                                    <span className="widget-cat-name">{cat.name}</span>
                                </span>
                                <span className="widget-cat-count">{cat.count}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="widget widget-promo">
                <strong>Собери сильное портфолио</strong>
                <p>Каждая выполненная задача автоматически попадает в LabSkill</p>
                <Link to="/labskill" className="widget-promo-btn">Перейти в портфолио</Link>
            </div>
        </aside>
    );
}

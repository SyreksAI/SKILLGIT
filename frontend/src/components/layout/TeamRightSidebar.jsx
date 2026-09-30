import { Link } from 'react-router-dom';
import { UsersIcon, RocketIcon, ArrowRightIcon } from '../pages/icons';
import { DirectionIconBadge } from '../ui/DirectionIcon';

const POPULAR = [
    { name: 'Разработка', direction: 'dev', icon: 'dev' },
    { name: 'AI / ML', direction: 'ai', icon: 'ai' },
    { name: 'Дизайн', direction: 'design', icon: 'design' },
    { name: 'QA', direction: 'qa', icon: 'qa' },
];

export function TeamRightSidebar({ stats, onCreateTeam }) {
    return (
        <aside className="teams-right">
            <div className="widget">
                <h3>Мои команды</h3>
                <Link to="/team?filter=mine" className="teams-stat-big">
                    <strong>{stats.joined}</strong>
                    <span>активных команд</span>
                </Link>
                <div className="teams-stat-row">
                    <Link to="/team?filter=mine">
                        <strong>{stats.totalMembers}</strong>
                        <span>участников</span>
                    </Link>
                    <Link to="/team?filter=open">
                        <strong>{stats.openTeams}</strong>
                        <span>открытых</span>
                    </Link>
                </div>
            </div>

            <div className="widget">
                <h3>Популярные направления</h3>
                <ul className="widget-cats">
                    {POPULAR.map(item => (
                        <li key={item.name}>
                            <Link to={`/team?direction=${item.direction}`}>
                                <span className="widget-cat-label">
                                    <DirectionIconBadge id={item.icon} />
                                    <span className="widget-cat-name">{item.name}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="widget">
                <h3>Советы</h3>
                <ul className="teams-tips">
                    <li>Выбирай команду по своему стеку и уровню</li>
                    <li>Pet-проекты из команд идут в LabSkill</li>
                    <li>Активность в чате повышает рейтинг</li>
                </ul>
            </div>

            <div className="widget widget-promo">
                <RocketIcon />
                <strong>Не нашёл команду?</strong>
                <p>Создай свою и пригласи джунов своего направления</p>
                <button type="button" className="widget-promo-btn" onClick={onCreateTeam}>
                    Создать команду <ArrowRightIcon />
                </button>
            </div>

            <div className="widget">
                <Link to="/chat?filter=team" className="teams-chat-link">
                    <UsersIcon />
                    Перейти в чаты команд
                    <ArrowRightIcon />
                </Link>
            </div>
        </aside>
    );
}

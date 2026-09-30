import { Link } from 'react-router-dom';
import { useModals } from '../../context/ModalsContext';
import { useBalance } from '../../context/BalanceContext';
import {
    TrophyIcon,
    StarIcon,
    CoinIcon,
    ArrowRightIcon,
    RepoIcon,
    UsersIcon,
} from '../pages/icons';

export function ProfileRightSidebar({ stats, teamsCount, reposCount }) {
    const { openBalance } = useModals();
    const { balanceLabel } = useBalance();

    return (
        <aside className="profile-right">
            <div className="widget">
                <h3>Рейтинг</h3>
                <div className="profile-rating-block">
                    <StarIcon />
                    <strong>{stats.rating}</strong>
                    <span>{stats.reviews} отзывов</span>
                </div>
            </div>

            <div className="widget">
                <h3>Достижения</h3>
                <ul className="profile-achievements">
                    <li>
                        <TrophyIcon />
                        <div>
                            <strong>{stats.tasksDone}</strong>
                            <span>Задач выполнено</span>
                        </div>
                    </li>
                    <li>
                        <button type="button" className="profile-achievement-btn" onClick={openBalance}>
                            <CoinIcon />
                            <div>
                                <strong>{balanceLabel}</strong>
                                <span>Баланс</span>
                            </div>
                        </button>
                    </li>
                </ul>
            </div>

            <div className="widget">
                <h3>Быстрые ссылки</h3>
                <ul className="profile-links-list">
                    <li>
                        <Link to="/labskill?tab=repositories">
                            <RepoIcon /> LabSkill
                            <span>{reposCount} репо</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/team?filter=mine">
                            <UsersIcon /> Команды
                            <span>{teamsCount}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/tasks?filter=all">
                            Мои задачи
                            <ArrowRightIcon />
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

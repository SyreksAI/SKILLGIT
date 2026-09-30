import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParam } from '../../hooks/useSearchParam';
import {
    MY_TASKS,
    TEAMS,
    ACTIVITY,
    USER_REVIEWS,
} from '../../data/mockData';
import { useUserSettings } from '../../context/UserSettingsContext';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { MyTaskRow } from '../ui/MyTaskRow';
import { GhPinnedRepo } from '../ui/GhRepoListItem';
import { ProfileRightSidebar } from '../layout/ProfileRightSidebar';
import { HeaderActions } from '../ui/HeaderActions';
import { useModals } from '../../context/ModalsContext';
import { useBalance } from '../../context/BalanceContext';
import {
    SearchIcon,
    MailIcon,
    StarIcon,
    RepoIcon,
    SettingsIcon,
    BookIcon,
    GridIcon,
} from './icons';

const TABS = [
    { id: 'overview', label: 'Обзор', Icon: BookIcon },
    { id: 'tasks', label: 'Задачи', count: MY_TASKS.length, Icon: GridIcon },
    { id: 'reviews', label: 'Отзывы', count: USER_REVIEWS.length, Icon: StarIcon },
];

const ACTIVITY_LABELS = {
    completed: 'Выполнено',
    repo: 'Репозиторий',
    applied: 'Отклик',
    team: 'Команда',
    review: 'Проверка',
};

const TAB_IDS = TABS.map(t => t.id);

export function ProfilePage() {
    const [tab, setTab] = useSearchParam('tab', 'overview', TAB_IDS);
    const { repos } = useLabSkillRepos();
    const { openBalance } = useModals();
    const { balanceLabel } = useBalance();
    const { user, getDirectionLabel } = useUserSettings();

    const pinnedRepos = repos.filter(r => r.pinned).slice(0, 4);
    const myTeams = TEAMS.slice(0, 3);

    const taskStats = useMemo(() => ({
        completed: MY_TASKS.filter(t => t.status === 'completed').length,
        active: MY_TASKS.filter(t => t.status === 'in_progress' || t.status === 'applied').length,
        review: MY_TASKS.filter(t => t.status === 'review').length,
    }), []);

    return (
        <div className="user-profile-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <section className="user-profile-hero">
                <div className="user-profile-cover" />
                <div className="user-profile-hero-body">
                    <div className="user-profile-avatar">{user.name.charAt(0)}</div>
                    <div className="user-profile-info">
                        <div className="user-profile-headline">
                            <div>
                                <h1>{user.name}</h1>
                                <p className="user-profile-role">
                                    {user.role}
                                    <span className="user-profile-direction">
                                        {getDirectionLabel(user.direction)}
                                    </span>
                                </p>
                                <p className="user-profile-meta">
                                    @{user.username}
                                    {user.location && <> · {user.location}</>}
                                    {user.company && <> · {user.company}</>}
                                </p>
                            </div>
                            <div className="user-profile-actions">
                                <Link to="/labskill" className="user-profile-btn user-profile-btn-primary">
                                    <RepoIcon /> LabSkill
                                </Link>
                                <Link to="/chat" className="user-profile-btn">
                                    <MailIcon /> Написать
                                </Link>
                                <Link to="/settings" className="user-profile-btn user-profile-btn-icon" aria-label="Настройки">
                                    <SettingsIcon />
                                </Link>
                            </div>
                        </div>

                        {user.bio && <p className="user-profile-bio">{user.bio}</p>}

                        <div className="user-profile-stats-bar">
                            <button type="button" onClick={() => setTab('tasks')}>
                                <strong>{user.stats.tasksDone}</strong>
                                <span>задач</span>
                            </button>
                            <button type="button" onClick={() => setTab('reviews')}>
                                <strong>{user.stats.rating}</strong>
                                <span>рейтинг</span>
                            </button>
                            <button type="button" onClick={openBalance}>
                                <strong>{balanceLabel}</strong>
                                <span>баланс</span>
                            </button>
                            <Link to="/team?filter=mine">
                                <strong>{user.followers}</strong>
                                <span>подписчиков</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="home-layout user-profile-layout">
                <div className="user-profile-main">
                    <nav className="user-profile-tabs">
                        {TABS.map(({ id, label, count, Icon }) => (
                            <button
                                key={id}
                                type="button"
                                className={`user-profile-tab${tab === id ? ' active' : ''}`}
                                onClick={() => setTab(id)}
                            >
                                <Icon />
                                {label}
                                {count != null && <span className="user-profile-tab-count">{count}</span>}
                            </button>
                        ))}
                    </nav>

                    {tab === 'overview' && (
                        <div className="user-profile-content">
                            <section className="user-profile-block">
                                <h2>Навыки</h2>
                                <div className="user-profile-skills">
                                    {user.skills.map(skill => (
                                        <span key={skill} className="user-profile-skill">{skill}</span>
                                    ))}
                                </div>
                            </section>

                            {pinnedRepos.length > 0 && (
                                <section className="user-profile-block">
                                    <div className="user-profile-block-head">
                                        <h2>Закреплённые проекты</h2>
                                        <Link to="/labskill">Все репозитории →</Link>
                                    </div>
                                    <div className="user-profile-pinned">
                                        {pinnedRepos.map(repo => (
                                            <GhPinnedRepo key={repo.id} repo={repo} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="user-profile-block">
                                <div className="user-profile-block-head">
                                    <h2>Команды</h2>
                                    <Link to="/team">Все команды →</Link>
                                </div>
                                <ul className="user-profile-teams">
                                    {myTeams.map(team => (
                                        <li key={team.id}>
                                            <Link to={`/team?search=${encodeURIComponent(team.name)}`}>
                                                <div
                                                    className="user-profile-team-logo"
                                                    style={{ background: team.color }}
                                                >
                                                    {team.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <strong>{team.name}</strong>
                                                    <span>{team.members} участников · {getDirectionLabel(team.direction)}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="user-profile-block">
                                <h2>Последняя активность</h2>
                                <div className="user-profile-activity">
                                    {ACTIVITY.map(item => (
                                        item.href ? (
                                            <Link key={item.id} to={item.href} className="user-profile-activity-item">
                                                <span className="user-profile-activity-type" data-type={item.type}>
                                                    {ACTIVITY_LABELS[item.type]}
                                                </span>
                                                <p>{item.text}</p>
                                                <time>{item.time}</time>
                                            </Link>
                                        ) : (
                                            <div key={item.id} className="user-profile-activity-item">
                                                <span className="user-profile-activity-type" data-type={item.type}>
                                                    {ACTIVITY_LABELS[item.type]}
                                                </span>
                                                <p>{item.text}</p>
                                                <time>{item.time}</time>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {tab === 'tasks' && (
                        <div className="user-profile-content">
                            <div className="user-profile-block-head user-profile-block-head-inline">
                                <h2>Мои задачи</h2>
                                <div className="user-profile-task-summary">
                                    <Link to="/tasks?filter=active">{taskStats.active} активных</Link>
                                    <Link to="/tasks?filter=review">{taskStats.review} на проверке</Link>
                                    <Link to="/tasks?filter=completed">{taskStats.completed} выполнено</Link>
                                </div>
                            </div>
                            <div className="user-profile-tasks">
                                {MY_TASKS.map(task => (
                                    <MyTaskRow key={task.id} task={task} />
                                ))}
                            </div>
                            <Link to="/tasks" className="user-profile-more-link">
                                Открыть все задачи →
                            </Link>
                        </div>
                    )}

                    {tab === 'reviews' && (
                        <div className="user-profile-content">
                            <section className="user-profile-block">
                                <div className="user-profile-rating-summary">
                                    <StarIcon />
                                    <strong>{user.stats.rating}</strong>
                                    <span>на основе {user.stats.reviews} отзывов</span>
                                </div>
                            </section>
                            <div className="user-profile-reviews">
                                {USER_REVIEWS.map(review => (
                                    <article key={review.id} className="user-profile-review">
                                        <div className="user-profile-review-head">
                                            <div>
                                                <strong>{review.author}</strong>
                                                <span>{review.company}</span>
                                            </div>
                                            <div className="user-profile-review-stars">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <p className="user-profile-review-task">{review.task}</p>
                                        <p className="user-profile-review-text">{review.text}</p>
                                        <time>{review.date}</time>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ProfileRightSidebar
                    stats={user.stats}
                    teamsCount={3}
                    reposCount={repos.length}
                />
            </div>
        </div>
    );
}

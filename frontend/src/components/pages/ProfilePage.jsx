import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParam } from '../../hooks/useSearchParam';
import { useUserSettings } from '../../context/UserSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { MyTaskRow } from '../ui/MyTaskRow';
import { ProfileRightSidebar } from '../layout/ProfileRightSidebar';
import { HeaderActions } from '../ui/HeaderActions';
import { useModals } from '../../context/ModalsContext';
import {
    SearchIcon,
    MailIcon,
    StarIcon,
    RepoIcon,
    SettingsIcon,
    BookIcon,
    GridIcon,
} from './icons';

const ACTIVITY_LABELS = {
    completed: 'Выполнено',
    repo: 'Репозиторий',
    applied: 'Отклик',
    team: 'Команда',
    review: 'Проверка',
};

const TAB_IDS = ['overview', 'tasks', 'reviews'];

export function ProfilePage() {
    const [tab, setTab] = useSearchParam('tab', 'overview', TAB_IDS);
    const { openBalance } = useModals();
    const { user, getDirectionLabel, profileLoading, profileError } = useUserSettings();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) window.dispatchEvent(new Event('skillgit:profile-refresh'));
    }, [isAuthenticated]);

    const tasks = user.tasks ?? [];
    const reviews = user.reviews ?? [];
    const activity = user.activity ?? [];
    const teams = user.teams ?? [];
    const taskStats = {
        completed: tasks.filter(task => task.status === 'completed').length,
        active: tasks.filter(task => task.status === 'in_progress' || task.status === 'applied').length,
        review: tasks.filter(task => task.status === 'review').length,
    };
    const tabs = [
        { id: 'overview', label: 'Обзор', Icon: BookIcon },
        { id: 'tasks', label: 'Задачи', count: tasks.length, Icon: GridIcon },
        { id: 'reviews', label: 'Отзывы', count: reviews.length, Icon: StarIcon },
    ];

    if (!isAuthenticated) {
        return (
            <div className="user-profile-page">
                <section className="user-profile-content profile-empty-note">
                    <h1>Войдите, чтобы открыть профиль</h1>
                    <p>Профиль доступен после входа в аккаунт.</p>
                    <Link to="/login">Войти</Link>
                </section>
            </div>
        );
    }

    if (profileLoading) {
        return <div className="user-profile-page profile-empty-note">Загружаем профиль…</div>;
    }

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
                    <div className="user-profile-avatar">{user.name?.charAt(0) || '?'}</div>
                    <div className="user-profile-info">
                        <div className="user-profile-headline">
                            <div>
                                <h1>{user.name || 'Мой профиль'}</h1>
                                <p className="user-profile-role">
                                    {user.role}
                                    {user.accountType === 'performer' && user.direction && (
                                        <span className="user-profile-direction">{getDirectionLabel(user.direction)}</span>
                                    )}
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
                        {profileError && <p className="auth-error" role="alert">{profileError}</p>}

                        <div className="user-profile-stats-bar">
                            <button type="button" onClick={() => setTab('tasks')}>
                                <strong>{user.stats.tasksDone}</strong>
                                <span>задач</span>
                            </button>
                            <button type="button" onClick={() => setTab('reviews')}>
                                <strong>{user.stats.rating ?? '—'}</strong>
                                <span>рейтинг</span>
                            </button>
                            <button type="button" onClick={openBalance}>
                                <strong>{user.stats.balanceLabel}</strong>
                                <span>баланс</span>
                            </button>
                            <Link to="/team?filter=mine">
                                <strong>{user.stats.followers}</strong>
                                <span>подписчиков</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="home-layout user-profile-layout">
                <div className="user-profile-main">
                    <nav className="user-profile-tabs">
                        {tabs.map(({ id, label, count, Icon }) => (
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
                                <div className="user-profile-block-head">
                                    <h2>Навыки</h2>
                                    <Link to="/settings?section=public">Редактировать профиль →</Link>
                                </div>
                                {user.skills.length > 0 ? (
                                    <div className="user-profile-skills">
                                        {user.skills.map(skill => (
                                            <span key={skill} className="user-profile-skill">{skill}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="profile-empty-note">Добавьте свои навыки в настройках профиля.</p>
                                )}
                            </section>

                            <section className="user-profile-block">
                                <div className="user-profile-block-head">
                                    <h2>Команды</h2>
                                    <Link to="/team">Все команды →</Link>
                                </div>
                                {teams.length > 0 ? (
                                    <ul className="user-profile-teams">
                                        {teams.map(team => (
                                            <li key={team.id}>
                                                <Link to={`/team?search=${encodeURIComponent(team.name)}`}>
                                                    <div className="user-profile-team-logo" style={{ background: team.color }}>
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
                                ) : (
                                    <p className="profile-empty-note">Вы пока не состоите в командах.</p>
                                )}
                            </section>

                            <section className="user-profile-block">
                                <h2>Последняя активность</h2>
                                {activity.length > 0 ? (
                                    <div className="user-profile-activity">
                                        {activity.map(item => {
                                            const content = (
                                                <>
                                                    <span className="user-profile-activity-type" data-type={item.type}>
                                                        {ACTIVITY_LABELS[item.type] ?? 'Активность'}
                                                    </span>
                                                    <p>{item.text}</p>
                                                    <time>{item.time}</time>
                                                </>
                                            );
                                            return item.href ? (
                                                <Link key={item.id} to={item.href} className="user-profile-activity-item">{content}</Link>
                                            ) : (
                                                <div key={item.id} className="user-profile-activity-item">{content}</div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="profile-empty-note">Здесь появятся ваши действия — отклики, выполненные задачи и обновления профиля.</p>
                                )}
                            </section>
                        </div>
                    )}

                    {tab === 'tasks' && (
                        <div className="user-profile-content">
                            <div className="user-profile-block-head user-profile-block-head-inline">
                                <h2>Мои задачи</h2>
                                <div className="user-profile-task-summary">
                                    <span>{taskStats.active} активных</span>
                                    <span>{taskStats.review} на проверке</span>
                                    <span>{taskStats.completed} выполнено</span>
                                </div>
                            </div>
                            {tasks.length > 0 ? (
                                <div className="user-profile-tasks">
                                    {tasks.map(task => <MyTaskRow key={task.id} task={task} />)}
                                </div>
                            ) : (
                                <div className="profile-empty-note">
                                    <p>У вас пока нет задач.</p>
                                    <Link to={user.accountType === 'customer' ? '/company/tasks/new' : '/tasks'}>
                                        {user.accountType === 'customer' ? 'Создать первую задачу' : 'Найти задачи'}
                                    </Link>
                                </div>
                            )}
                            <Link to={user.accountType === 'customer' ? '/company/tasks' : '/tasks'} className="user-profile-more-link">
                                Открыть все задачи →
                            </Link>
                        </div>
                    )}

                    {tab === 'reviews' && (
                        <div className="user-profile-content">
                            <section className="user-profile-block">
                                <div className="user-profile-rating-summary">
                                    <StarIcon />
                                    <strong>{user.stats.rating ?? '—'}</strong>
                                    <span>{user.stats.reviews} отзывов</span>
                                </div>
                            </section>
                            {reviews.length > 0 ? (
                                <div className="user-profile-reviews">
                                    {reviews.map(review => (
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
                            ) : (
                                <p className="profile-empty-note">Пока нет отзывов. Они появятся после завершения первых задач.</p>
                            )}
                        </div>
                    )}
                </div>

                <ProfileRightSidebar stats={user.stats} teamsCount={teams.length} reposCount={0} />
            </div>
        </div>
    );
}

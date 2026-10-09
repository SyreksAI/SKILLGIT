import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LABSKILL_USERS, getDirectionLabel } from '../../data/mockData';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { useUserSettings } from '../../context/UserSettingsContext';
import { api } from '../../services/api';
import { GhPinnedRepo } from '../ui/GhRepoListItem';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon } from './icons';

export function UserPublicPage() {
    const { username } = useParams();
    const { user: currentUser } = useUserSettings();
    const { repos } = useLabSkillRepos();
    const [publicUser, setPublicUser] = useState(null);
    const [publicLoading, setPublicLoading] = useState(true);

    const isSelf = Boolean(currentUser.username && username === currentUser.username);
    useEffect(() => {
        let cancelled = false;
        setPublicLoading(true);
        api.getPublicUser(username)
            .then(profile => { if (!cancelled) setPublicUser(profile); })
            .catch(() => { if (!cancelled) setPublicUser(null); })
            .finally(() => { if (!cancelled) setPublicLoading(false); });
        return () => { cancelled = true; };
    }, [username, isSelf]);

    const profileUser = isSelf
        ? publicUser ?? currentUser
        : publicUser ?? LABSKILL_USERS.find(u => u.username === username);

    if (publicLoading && !isSelf) {
        return (
            <div className="public-page">
                <header className="home-header"><HeaderActions /></header>
                <div className="account-page"><p>Загружаем профиль…</p></div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="public-page">
                <header className="home-header"><HeaderActions /></header>
                <div className="account-page">
                    <h1>Пользователь не найден</h1>
                    <Link to="/" className="admin-link">← На главную</Link>
                </div>
            </div>
        );
    }

    const userRepos = repos.filter(r => r.owner === profileUser.username).slice(0, 6);

    return (
        <div className="public-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <div className="public-user">
                <header className="public-user-head">
                    <span className="public-user-avatar">{profileUser.name.charAt(0)}</span>
                    <div>
                        <h1>{profileUser.name}</h1>
                        <p>@{profileUser.username} · {profileUser.role ?? getDirectionLabel(profileUser.direction)}</p>
                        {profileUser.bio && <p className="admin-text">{profileUser.bio}</p>}
                    </div>
                    {isSelf ? (
                        <Link to="/profile" className="admin-btn admin-btn--primary">Мой профиль</Link>
                    ) : (
                        <Link to={`/chat?user=${profileUser.username}`} className="admin-btn admin-btn--primary">Написать</Link>
                    )}
                </header>

                {profileUser.skills?.length > 0 && (
                    <div className="admin-tags">
                        {profileUser.skills.map(skill => <span key={skill}>{skill}</span>)}
                    </div>
                )}

                <section className="admin-card">
                    <div className="admin-card-head">
                        <h2>LabSkill репозитории</h2>
                        <Link to={`/labskill?tab=repositories&q=${profileUser.username}`} className="admin-link">
                            Все →
                        </Link>
                    </div>
                    {userRepos.length === 0 ? (
                        <p className="admin-empty-text">Публичных репозиториев пока нет</p>
                    ) : (
                        <ul className="gh-repo-list">
                            {userRepos.map(repo => (
                                <GhPinnedRepo key={`${repo.owner}/${repo.name}`} repo={repo} />
                            ))}
                        </ul>
                    )}
                </section>

                <section className="public-user-work-grid">
                    <section className="admin-card">
                        <div className="admin-card-head"><h2>Работы</h2><span>{profileUser.tasks?.length ?? 0}</span></div>
                        {profileUser.tasks?.length ? (
                            <div className="public-user-work-list">
                                {profileUser.tasks.map(task => (
                                    <Link key={task.id} to={task.taskId ? `/tasks/${task.taskId}` : '/my-work'} className="public-user-work-item">
                                        <span>{task.statusLabel ?? task.status ?? 'В работе'}</span>
                                        <strong>{task.title}</strong>
                                        <small>{task.company} · {task.priceLabel}</small>
                                    </Link>
                                ))}
                            </div>
                        ) : <p className="admin-empty-text">Завершённые и текущие работы появятся после первых сделок.</p>}
                    </section>
                    <section className="admin-card">
                        <div className="admin-card-head"><h2>Отзывы</h2><span>{profileUser.reviews?.length ?? 0}</span></div>
                        {profileUser.reviews?.length ? (
                            <div className="public-user-review-list">
                                {profileUser.reviews.map(review => (
                                    <article className="public-user-review" key={review.id}>
                                        <header><strong>{review.author}</strong><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></header>
                                        <small>{review.task}</small>
                                        <p>{review.text}</p>
                                        <time>{review.date}</time>
                                    </article>
                                ))}
                            </div>
                        ) : <p className="admin-empty-text">Пока нет отзывов о выполненных работах.</p>}
                    </section>
                </section>
            </div>
        </div>
    );
}

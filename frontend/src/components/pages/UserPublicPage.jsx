import { Link, useParams } from 'react-router-dom';
import { CURRENT_USER, LABSKILL_USERS, getDirectionLabel } from '../../data/mockData';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { useUserSettings } from '../../context/UserSettingsContext';
import { GhPinnedRepo } from '../ui/GhRepoListItem';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon } from './icons';

export function UserPublicPage() {
    const { username } = useParams();
    const { user: currentUser } = useUserSettings();
    const { repos } = useLabSkillRepos();

    const isSelf = username === currentUser.username || username === CURRENT_USER.username;
    const profileUser = isSelf
        ? currentUser
        : LABSKILL_USERS.find(u => u.username === username);

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
            </div>
        </div>
    );
}

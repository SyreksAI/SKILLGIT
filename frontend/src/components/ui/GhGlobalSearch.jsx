import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { LABSKILL_USERS, LABSKILL_EXPLORE_REPOS } from '../../data/mockData';
import { useUserSettings } from '../../context/UserSettingsContext';
import { mergeSearchRepos } from '../../utils/labskillUtils';
import { SearchIcon, RepoIcon } from '../pages/icons';

function getUserByUsername(users, username) {
    return users.find(u => u.username === username);
}

export function GhGlobalSearch({ users = LABSKILL_USERS, exploreRepos = LABSKILL_EXPLORE_REPOS }) {
    const navigate = useNavigate();
    const { user: currentUser } = useUserSettings();
    const { repos: contextRepos } = useLabSkillRepos();
    const repos = useMemo(
        () => mergeSearchRepos(contextRepos, exploreRepos),
        [contextRepos, exploreRepos],
    );
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return { users: [], repos: [] };
        }

        const matchedUsers = users.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.name.toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedRepos = repos.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.owner.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q) ||
            r.language?.toLowerCase().includes(q)
        ).slice(0, 6);

        return { users: matchedUsers, repos: matchedRepos };
    }, [query, users, repos]);

    const hasQuery = query.trim().length > 0;
    const hasResults = results.users.length > 0 || results.repos.length > 0;

    useEffect(() => {
        function handleClickOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function goToUser(user) {
        setOpen(false);
        setQuery('');
        if (user.username === currentUser.username) {
            navigate('/profile');
            return;
        }
        navigate(`/users/${user.username}`);
    }

    function goToRepo(repo) {
        setOpen(false);
        setQuery('');
        navigate(`/labskill/${repo.owner}/${repo.name}`);
    }

    return (
        <div className={`home-header-search gh-top-search${open ? ' open' : ''}`} ref={rootRef}>
            <SearchIcon />
            <input
                type="search"
                placeholder="Search LabSkill repositories and users..."
                value={query}
                onChange={e => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                aria-label="Search repositories and users"
                aria-expanded={open && hasQuery}
            />
            {hasQuery && open && (
                <div className="gh-search-dropdown" role="listbox">
                    {!hasResults && (
                        <p className="gh-search-empty">No results for &ldquo;{query.trim()}&rdquo;</p>
                    )}

                    {results.users.length > 0 && (
                        <section className="gh-search-section">
                            <h4>Users</h4>
                            <ul>
                                {results.users.map(user => (
                                    <li key={user.username}>
                                        <button
                                            type="button"
                                            className="gh-search-user"
                                            onClick={() => goToUser(user)}
                                        >
                                            <span className="gh-search-user-avatar">
                                                {user.name.charAt(0)}
                                            </span>
                                            <span className="gh-search-user-info">
                                                <strong>{user.name}</strong>
                                                <span>@{user.username}</span>
                                            </span>
                                            <span className="gh-search-user-meta">
                                                {user.repos} repos
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {results.repos.length > 0 && (
                        <section className="gh-search-section">
                            <h4>Repositories</h4>
                            <ul>
                                {results.repos.map(repo => {
                                    const owner = getUserByUsername(users, repo.owner);
                                    return (
                                        <li key={`${repo.owner}/${repo.name}`}>
                                            <button
                                                type="button"
                                                className="gh-search-repo"
                                                onClick={() => goToRepo(repo)}
                                            >
                                                <RepoIcon />
                                                <span className="gh-search-repo-info">
                                                    <strong>
                                                        {repo.owner}<span className="gh-search-repo-slash">/</span>{repo.name}
                                                    </strong>
                                                    {repo.description && (
                                                        <span>{repo.description}</span>
                                                    )}
                                                </span>
                                                <span className="gh-search-repo-meta">
                                                    {owner?.name && `${owner.name} · `}
                                                    ★ {repo.stars ?? 0}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

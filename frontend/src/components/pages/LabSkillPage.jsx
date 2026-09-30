import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import {
    CURRENT_USER,
    LABSKILL_STARRED,
    LABSKILL_CONTRIBUTIONS,
    LABSKILL_USERS,
    ACTIVITY,
} from '../../data/mockData';
import { repoUpdatedAt } from '../../utils/labskillUtils';
import { LabSkillProfileSidebar } from '../layout/LabSkillProfileSidebar';
import { GhRepoListItem, GhPinnedRepo } from '../ui/GhRepoListItem';
import { GhDropdown } from '../ui/GhDropdown';
import { HeaderActions } from '../ui/HeaderActions';
import { GhGlobalSearch } from '../ui/GhGlobalSearch';
import {
    BookIcon,
    RepoIcon,
    StarIcon,
    PlusIcon,
    SearchIcon,
} from './icons';

const TABS = [
    { id: 'overview', label: 'Overview', Icon: BookIcon },
    { id: 'repositories', label: 'Repositories', Icon: RepoIcon },
    { id: 'stars', label: 'Stars', Icon: StarIcon },
];

const TYPE_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'public', label: 'Public' },
    { id: 'private', label: 'Private' },
];

const SORT_OPTIONS = [
    { id: 'updated', label: 'Last updated' },
    { id: 'name', label: 'Name' },
    { id: 'stars', label: 'Stars' },
];

const TAB_IDS = TABS.map(t => t.id);

function resolveTab(searchParams) {
    const explicit = searchParams.get('tab');
    if (explicit && TAB_IDS.includes(explicit)) return explicit;
    if (searchParams.get('repo') || searchParams.get('q')) return 'repositories';
    return 'overview';
}

function buildLanguageOptions(repos) {
    return [
        { id: 'all', label: 'All languages' },
        ...Array.from(new Set(repos.map(r => r.language).filter(Boolean)))
            .sort()
            .map(lang => ({ id: lang, label: lang })),
    ];
}

function getTabCount(id, repos) {
    if (id === 'repositories') return repos.length;
    if (id === 'stars') return LABSKILL_STARRED.length;
    return null;
}

export function LabSkillPage() {
    const navigate = useNavigate();
    const { repos } = useLabSkillRepos();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = useMemo(() => resolveTab(searchParams), [searchParams]);
    const highlightRepo = searchParams.get('repo');
    const reposSearchRef = useRef(null);
    const [repoSearch, setRepoSearch] = useState(() => searchParams.get('q') ?? '');
    const sort = searchParams.get('sort') || 'updated';
    const typeFilter = searchParams.get('type') || 'all';
    const languageFilter = searchParams.get('lang') || 'all';
    const user = CURRENT_USER;
    const languageOptions = useMemo(() => buildLanguageOptions(repos), [repos]);

    useEffect(() => {
        const q = searchParams.get('q');
        setRepoSearch(q ?? '');
    }, [searchParams]);

    useEffect(() => {
        if (!highlightRepo) return;
        const repo = repos.find(r => String(r.id) === highlightRepo);
        if (repo) {
            navigate(`/labskill/${repo.owner}/${repo.name}`, { replace: true });
            return;
        }
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.delete('repo');
            return params;
        }, { replace: true });
    }, [highlightRepo, repos, navigate, setSearchParams]);

    function updateListParam(key, value, defaultValue) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set('tab', 'repositories');
            if (!value || value === defaultValue) params.delete(key);
            else params.set(key, value);
            return params;
        }, { replace: true });
    }

    function changeTab(id) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (id === 'overview') {
                params.delete('tab');
            } else {
                params.set('tab', id);
            }
            if (id !== 'repositories') {
                params.delete('repo');
                params.delete('q');
            }
            return params;
        }, { replace: true });
        if (id !== 'repositories') {
            setRepoSearch('');
        }
    }

    function handleRepoSearchChange(value) {
        setRepoSearch(value);
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set('tab', 'repositories');
            if (value.trim()) params.set('q', value);
            else params.delete('q');
            return params;
        }, { replace: true });
    }

    const pinnedRepos = repos.filter(r => r.pinned);
    const totalStars = repos.reduce((s, r) => s + r.stars, 0);
    const totalContributions = LABSKILL_CONTRIBUTIONS.reduce((s, l) => s + l, 0);
    const filteredRepos = useMemo(() => {
        let result = [...repos];

        if (typeFilter === 'public') {
            result = result.filter(r => r.visibility === 'public');
        } else if (typeFilter === 'private') {
            result = result.filter(r => r.visibility === 'private');
        }

        if (languageFilter !== 'all') {
            result = result.filter(r => r.language === languageFilter);
        }

        if (repoSearch.trim()) {
            const q = repoSearch.toLowerCase();
            result = result.filter(r =>
                r.name.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q) ||
                r.topics?.some(t => t.includes(q))
            );
        }

        if (sort === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'stars') {
            result.sort((a, b) => b.stars - a.stars);
        } else {
            result.sort((a, b) => repoUpdatedAt(b) - repoUpdatedAt(a));
        }

        return result;
    }, [repos, repoSearch, sort, typeFilter, languageFilter]);

    return (
        <div className="gh-page">
            <header className="home-header gh-page-header">
                <GhGlobalSearch users={LABSKILL_USERS} />
                <HeaderActions />
            </header>
            <div className="gh-layout">
                <LabSkillProfileSidebar />

                <main className="gh-main">
                    <nav className="gh-tabs" aria-label="Profile sections">
                        {TABS.map(({ id, label, Icon }) => {
                            const count = getTabCount(id, repos);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className={`gh-tab${tab === id ? ' active' : ''}`}
                                    aria-selected={tab === id}
                                    onClick={() => changeTab(id)}
                                >
                                    <Icon />
                                    {label}
                                    {count != null && <span className="gh-tab-count">{count}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {tab === 'overview' && (
                        <div className="gh-overview">
                            {pinnedRepos.length > 0 && (
                                <section className="gh-section">
                                    <div className="gh-section-head">
                                        <h2>Pinned</h2>
                                        <button type="button" className="gh-link-btn" onClick={() => changeTab('repositories')}>
                                            Customize your pins
                                        </button>
                                    </div>
                                    <div className="gh-pinned-grid">
                                        {pinnedRepos.map(repo => (
                                            <GhPinnedRepo key={repo.id} repo={repo} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="gh-section">
                                <h2>{totalContributions} contributions in the last year</h2>
                                <div className="gh-contrib-graph">
                                    <div className="gh-heatmap">
                                        {LABSKILL_CONTRIBUTIONS.map((level, i) => (
                                            <span
                                                key={i}
                                                className={`gh-heatmap-cell${level ? ` l${level}` : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="gh-contrib-legend">
                                        <span>Less</span>
                                        <span className="gh-heatmap-cell l1" />
                                        <span className="gh-heatmap-cell l2" />
                                        <span className="gh-heatmap-cell l3" />
                                        <span className="gh-heatmap-cell l4" />
                                        <span>More</span>
                                    </div>
                                </div>
                            </section>

                            <section className="gh-section">
                                <h2>Activity overview</h2>
                                <div className="gh-activity">
                                    {ACTIVITY.map(item => (
                                        item.href ? (
                                            <Link key={item.id} to={item.href} className="gh-activity-item">
                                                <div className="gh-activity-icon" data-type={item.type} />
                                                <div>
                                                    <p>{item.text}</p>
                                                    <time>{item.time}</time>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div key={item.id} className="gh-activity-item">
                                                <div className="gh-activity-icon" data-type={item.type} />
                                                <div>
                                                    <p>{item.text}</p>
                                                    <time>{item.time}</time>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {tab === 'repositories' && (
                        <div className="gh-repos-tab">
                            <div className="gh-repos-toolbar">
                                <div className="gh-repos-toolbar-main">
                                    <div className="gh-field-search">
                                        <SearchIcon />
                                        <input
                                            ref={reposSearchRef}
                                            type="search"
                                            placeholder="Find a repository..."
                                            value={repoSearch}
                                            onChange={e => handleRepoSearchChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="gh-repos-filters">
                                        <GhDropdown
                                            label="Type"
                                            value={typeFilter}
                                            options={TYPE_OPTIONS}
                                            onChange={value => updateListParam('type', value, 'all')}
                                        />
                                        <GhDropdown
                                            label="Language"
                                            value={languageFilter}
                                            options={languageOptions}
                                            onChange={value => updateListParam('lang', value, 'all')}
                                        />
                                        <GhDropdown
                                            label="Sort"
                                            value={sort}
                                            options={SORT_OPTIONS}
                                            onChange={value => updateListParam('sort', value, 'updated')}
                                        />
                                    </div>
                                </div>
                                <Link to="/labskill/new" className="gh-btn-green">
                                    <PlusIcon />
                                    New
                                </Link>
                            </div>

                            <p className="gh-repos-count">
                                {filteredRepos.length} repositories · {totalStars} stars
                            </p>

                            <div className="gh-repo-list">
                                {filteredRepos.length === 0 ? (
                                    <div className="gh-empty-tab gh-empty-tab--inline">
                                        <RepoIcon />
                                        <p>No repositories found</p>
                                    </div>
                                ) : (
                                    filteredRepos.map(repo => (
                                        <GhRepoListItem
                                            key={repo.id}
                                            repo={repo}
                                            highlighted={String(repo.id) === highlightRepo}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'stars' && (
                        <div className="gh-repos-tab">
                            <p className="gh-repos-count">
                                {LABSKILL_STARRED.length} starred repositories
                            </p>
                            <div className="gh-repo-list">
                                {LABSKILL_STARRED.map(repo => (
                                    <GhRepoListItem key={repo.id} repo={repo} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
}

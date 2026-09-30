import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { getRepoSettings } from '../../data/repoSettingsModel';
import { HeaderActions } from '../ui/HeaderActions';
import { GhGlobalSearch } from '../ui/GhGlobalSearch';
import { LABSKILL_USERS } from '../../data/mockData';
import { RepoSidebar } from '../labskill/RepoSidebar';
import { RepoCodeTab } from '../labskill/RepoCodeTab';
import { RepoIssuesTab } from '../labskill/RepoIssuesTab';
import { RepoPullsTab } from '../labskill/RepoPullsTab';
import { RepoAgentsTab } from '../labskill/RepoAgentsTab';
import { RepoActionsTab } from '../labskill/RepoActionsTab';
import { RepoProjectsTab } from '../labskill/RepoProjectsTab';
import { RepoSecurityTab } from '../labskill/RepoSecurityTab';
import { RepoInsightsTab } from '../labskill/RepoInsightsTab';
import { RepoSettingsTab } from '../labskill/RepoSettingsTab';
import { getRepoIssues, getRepoPullRequests } from '../../data/repoTabData';
import {
    RepoIcon,
    CodeIcon,
    IssueIcon,
    PullRequestIcon,
    AgentsIcon,
    PlayIcon,
    ProjectIcon,
    ShieldIcon,
    PulseIcon,
    SettingsIcon,
    EyeIcon,
    GitForkIcon,
    StarIcon,
} from './icons';

const REPO_TABS = [
    { id: 'code', label: 'Code', Icon: CodeIcon },
    { id: 'issues', label: 'Issues', Icon: IssueIcon, countKey: 'issues' },
    { id: 'pulls', label: 'Pull requests', Icon: PullRequestIcon, countKey: 'pulls' },
    { id: 'agents', label: 'Agents', Icon: AgentsIcon },
    { id: 'actions', label: 'Actions', Icon: PlayIcon },
    { id: 'projects', label: 'Projects', Icon: ProjectIcon },
    { id: 'security', label: 'Security', Icon: ShieldIcon },
    { id: 'insights', label: 'Insights', Icon: PulseIcon },
    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

function formatCount(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return String(n);
}

const TAB_IDS = REPO_TABS.map(t => t.id);

export function LabSkillRepoPage() {
    const { owner, repoName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { getRepo, addFilesToRepo, recordRepoView } = useLabSkillRepos();

    const repo = getRepo(owner, repoName);

    const viewRecorded = useRef(false);

    useEffect(() => {
        viewRecorded.current = false;
    }, [owner, repoName]);

    useEffect(() => {
        if (!repo || repo.readOnly || viewRecorded.current) return;
        viewRecorded.current = true;
        recordRepoView(owner, repoName);
    }, [owner, repoName, repo, recordRepoView]);
    const rawTab = searchParams.get('tab') || 'code';
    const activeTab = TAB_IDS.includes(rawTab) ? rawTab : 'code';
    const [starred, setStarred] = useState(false);
    const [watching, setWatching] = useState(false);

    if (!repo) {
        return (
            <div className="gh-page">
                <header className="home-header gh-page-header">
                    <GhGlobalSearch users={LABSKILL_USERS} />
                    <HeaderActions />
                </header>
                <div className="gh-repo-empty">
                    <RepoIcon />
                    <h1>Repository not found</h1>
                    <p>{owner}/{repoName} does not exist or was removed.</p>
                    <Link to="/labskill?tab=repositories" className="gh-create-btn gh-create-btn--primary">
                        Back to repositories
                    </Link>
                </div>
            </div>
        );
    }

    function changeTab(id) {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (id === 'code') p.delete('tab');
            else p.set('tab', id);
            if (id !== 'code') {
                p.delete('path');
                p.delete('file');
                p.delete('commits');
                p.delete('commit');
                p.delete('branches');
                p.delete('tags');
                p.delete('branch');
            }
            if (id !== 'settings') {
                p.delete('section');
            }
            if (id !== 'insights') {
                p.delete('insights');
            }
            return p;
        }, { replace: true });
    }

    const latestCommit = repo.commits?.[0];
    const stars = (repo.stars ?? 0) + (starred ? 1 : 0);
    const forks = repo.forks ?? 0;
    const watchers = (repo.watchers ?? 0) + (watching ? 1 : 0);

    const repoSettings = getRepoSettings(repo);
    const visibleTabs = useMemo(() => REPO_TABS.filter(tab => {
        if (tab.id === 'issues' && !repoSettings.features.issues) return false;
        if (tab.id === 'projects' && !repoSettings.features.projects) return false;
        if (tab.id === 'actions' && repoSettings.actions.enabled === false) return false;
        return true;
    }), [repoSettings]);

    const tabCounts = {
        issues: getRepoIssues(repoName).filter(i => i.state === 'open').length,
        pulls: getRepoPullRequests(repoName).filter(p => p.state === 'open').length,
    };

    function renderTabContent() {
        switch (activeTab) {
            case 'issues':
                return <RepoIssuesTab repoName={repoName} />;
            case 'pulls':
                return <RepoPullsTab repoName={repoName} />;
            case 'agents':
                return <RepoAgentsTab />;
            case 'actions':
                return <RepoActionsTab repoName={repoName} />;
            case 'projects':
                return <RepoProjectsTab repoName={repoName} />;
            case 'security':
                return <RepoSecurityTab repo={repo} />;
            case 'insights':
                return (
                    <RepoInsightsTab
                        repo={repo}
                        owner={owner}
                        repoName={repoName}
                        readOnly={Boolean(repo.readOnly)}
                    />
                );
            case 'settings':
                return (
                    <RepoSettingsTab
                        key={`${owner}/${repoName}`}
                        repo={repo}
                        owner={owner}
                        repoName={repoName}
                        readOnly={Boolean(repo.readOnly)}
                    />
                );
            default:
                return (
                    <RepoCodeTab
                        repo={repo}
                        owner={owner}
                        repoName={repoName}
                        onUpload={files => addFilesToRepo(owner, repoName, files)}
                    />
                );
        }
    }

    return (
        <div className="gh-page gh-repo-page">
            <header className="home-header gh-page-header">
                <GhGlobalSearch users={LABSKILL_USERS} />
                <HeaderActions />
            </header>

            <div className="gh-repo-page-wrap">
                <header className="gh-repo-header">
                    <div className="gh-repo-title-row">
                        <span className="gh-repo-title-icon"><RepoIcon /></span>
                        <Link to="/labskill" className="gh-repo-owner">{owner}</Link>
                        <span className="gh-repo-slash">/</span>
                        <h1>
                            <Link to={`/labskill/${owner}/${repoName}`}>{repoName}</Link>
                        </h1>
                        <span className={`gh-repo-vis gh-repo-vis--${repo.visibility}`}>
                            {repo.visibility === 'private' ? 'Private' : 'Public'}
                        </span>
                    </div>
                    <div className="gh-repo-actions">
                        <button
                            type="button"
                            className={`gh-repo-action-btn gh-repo-action-btn--count${watching ? ' gh-repo-action-btn--active' : ''}`}
                            onClick={() => setWatching(v => !v)}
                        >
                            <EyeIcon />
                            {watching ? 'Unwatch' : 'Watch'}
                            <span>{formatCount(watchers)}</span>
                        </button>
                        <button type="button" className="gh-repo-action-btn gh-repo-action-btn--count">
                            <GitForkIcon />
                            Fork
                            <span>{formatCount(forks)}</span>
                        </button>
                        <button
                            type="button"
                            className={`gh-repo-action-btn gh-repo-action-btn--count gh-repo-action-btn--star${starred ? ' gh-repo-action-btn--starred' : ''}`}
                            onClick={() => setStarred(v => !v)}
                        >
                            <StarIcon />
                            {starred ? 'Starred' : 'Star'}
                            <span>{formatCount(stars)}</span>
                        </button>
                    </div>
                </header>

                <nav className="gh-repo-tabs" aria-label="Repository sections">
                    {visibleTabs.map(({ id, label, Icon, countKey }) => {
                        const count = countKey ? tabCounts[countKey] : 0;
                        return (
                            <button
                                key={id}
                                type="button"
                                className={`gh-repo-tab${activeTab === id ? ' active' : ''}`}
                                aria-selected={activeTab === id}
                                onClick={() => changeTab(id)}
                            >
                                {Icon && <Icon />}
                                {label}
                                {count > 0 && <span className="gh-repo-tab-count">{count}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className={`gh-repo-body${
                    activeTab !== 'code'
                        || searchParams.has('commits')
                        || searchParams.has('commit')
                        || searchParams.has('branches')
                        || searchParams.has('tags')
                        ? ' gh-repo-body--full'
                        : ''
                }${activeTab === 'settings' ? ' gh-repo-body--settings' : ''}`}>
                    <div className="gh-repo-main">
                        {renderTabContent()}
                    </div>
                    {activeTab === 'code' && (
                        <RepoSidebar
                            repo={repo}
                            owner={owner}
                            latestCommit={latestCommit}
                            stars={stars}
                            forks={forks}
                            watchers={watchers}
                            onOpenSettings={() => changeTab('settings')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

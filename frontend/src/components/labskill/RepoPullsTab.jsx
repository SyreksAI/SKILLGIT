import { useMemo, useState } from 'react';
import { getRepoPullRequests } from '../../data/repoTabData';
import { PullRequestIcon, SearchIcon, GitBranchIcon } from '../pages/icons';

const FILTERS = ['open', 'closed', 'merged', 'all'];

export function RepoPullsTab({ repoName }) {
    const pulls = getRepoPullRequests(repoName);
    const [filter, setFilter] = useState('open');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let result = pulls;
        if (filter !== 'all') result = result.filter(p => p.state === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p => p.title.toLowerCase().includes(q));
        }
        return result;
    }, [pulls, filter, search]);

    const counts = {
        open: pulls.filter(p => p.state === 'open').length,
        closed: pulls.filter(p => p.state === 'closed').length,
        merged: pulls.filter(p => p.state === 'merged').length,
        all: pulls.length,
    };

    return (
        <div className="gh-repo-section">
            <div className="gh-repo-section-head">
                <div className="gh-repo-section-filters">
                    {FILTERS.map(id => (
                        <button
                            key={id}
                            type="button"
                            className={`gh-repo-filter-btn${filter === id ? ' active' : ''}`}
                            onClick={() => setFilter(id)}
                        >
                            {id === 'open' && <PullRequestIcon />}
                            {id.charAt(0).toUpperCase() + id.slice(1)}
                            <span>{counts[id]}</span>
                        </button>
                    ))}
                </div>
                <div className="gh-repo-section-actions">
                    <div className="gh-repo-section-search">
                        <SearchIcon />
                        <input type="search" placeholder="Search pull requests" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button type="button" className="gh-btn-green">New pull request</button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="gh-repo-empty-state">
                    <PullRequestIcon />
                    <h3>No pull requests found</h3>
                    <p>Create a branch, push changes, and open a pull request.</p>
                    <button type="button" className="gh-btn-green">New pull request</button>
                </div>
            ) : (
                <ul className="gh-repo-issue-list">
                    {filtered.map(pr => (
                        <li key={pr.id} className="gh-repo-issue-item">
                            <span className={`gh-repo-issue-state gh-repo-issue-state--${pr.state}`}>
                                <PullRequestIcon />
                            </span>
                            <div className="gh-repo-issue-body">
                                <div className="gh-repo-issue-title-row">
                                    <a href="#" className="gh-repo-issue-title">{pr.title}</a>
                                    <span className="gh-repo-issue-num">#{pr.number}</span>
                                </div>
                                <div className="gh-repo-issue-meta">
                                    <span>
                                        {pr.state === 'merged' ? 'merged' : pr.state} {pr.createdAt} by {pr.author}
                                    </span>
                                    <span className="gh-repo-pr-branch">
                                        <GitBranchIcon />
                                        {pr.branch} → {pr.base}
                                    </span>
                                    {pr.comments > 0 && <span>{pr.comments} comments</span>}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

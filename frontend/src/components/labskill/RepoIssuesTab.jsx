import { useMemo, useState } from 'react';
import { getRepoIssues } from '../../data/repoTabData';
import { IssueIcon, SearchIcon } from '../pages/icons';

const FILTERS = ['open', 'closed', 'all'];

export function RepoIssuesTab({ repoName }) {
    const issues = getRepoIssues(repoName);
    const [filter, setFilter] = useState('open');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let result = issues;
        if (filter !== 'all') result = result.filter(i => i.state === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(i => i.title.toLowerCase().includes(q));
        }
        return result;
    }, [issues, filter, search]);

    const openCount = issues.filter(i => i.state === 'open').length;
    const closedCount = issues.filter(i => i.state === 'closed').length;

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
                            {id === 'open' && <IssueIcon />}
                            {id.charAt(0).toUpperCase() + id.slice(1)}
                            <span>{id === 'open' ? openCount : id === 'closed' ? closedCount : issues.length}</span>
                        </button>
                    ))}
                </div>
                <div className="gh-repo-section-actions">
                    <div className="gh-repo-section-search">
                        <SearchIcon />
                        <input type="search" placeholder="Search issues" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button type="button" className="gh-btn-green">New issue</button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="gh-repo-empty-state">
                    <IssueIcon />
                    <h3>No issues match your search</h3>
                    <p>Try adjusting filters or create a new issue.</p>
                </div>
            ) : (
                <ul className="gh-repo-issue-list">
                    {filtered.map(issue => (
                        <li key={issue.id} className="gh-repo-issue-item">
                            <span className={`gh-repo-issue-state gh-repo-issue-state--${issue.state}`}>
                                <IssueIcon />
                            </span>
                            <div className="gh-repo-issue-body">
                                <div className="gh-repo-issue-title-row">
                                    <a href="#" className="gh-repo-issue-title">{issue.title}</a>
                                    <span className="gh-repo-issue-num">#{issue.number}</span>
                                </div>
                                <div className="gh-repo-issue-meta">
                                    <span>opened {issue.createdAt} by {issue.author}</span>
                                    {issue.comments > 0 && <span>{issue.comments} comments</span>}
                                </div>
                                {issue.labels.length > 0 && (
                                    <div className="gh-repo-labels">
                                        {issue.labels.map(label => (
                                            <span key={label.name} className="gh-repo-label" style={{ '--label-color': label.color.startsWith('#') ? label.color : `#${label.color}` }}>
                                                {label.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

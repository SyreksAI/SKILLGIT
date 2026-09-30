import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRepoBranches } from '../../data/branchData';
import { GitBranchIcon, SearchIcon } from '../pages/icons';

export function RepoBranchesView({
    repo,
    repoName,
    owner,
    selectedBranch,
    onSelectBranch,
}) {
    const branches = useMemo(() => getRepoBranches(repo, repoName), [repo, repoName]);
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return branches;
        const q = query.toLowerCase();
        return branches.filter(branch => branch.name.toLowerCase().includes(q));
    }, [branches, query]);

    return (
        <div className="gh-repo-branches">
            <nav className="gh-repo-breadcrumbs">
                <Link to={`/labskill/${owner}/${repoName}`}>{repoName}</Link>
                <span>/</span>
                <span>branches</span>
            </nav>

            <header className="gh-repo-branches-head">
                <h2>
                    <GitBranchIcon />
                    Branches
                </h2>
                <button type="button" className="gh-btn-green">New branch</button>
            </header>

            <div className="gh-repo-branches-search">
                <SearchIcon />
                <input
                    type="search"
                    placeholder="Search branches..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>

            <div className="gh-repo-branches-tabs">
                <button type="button" className="active">All</button>
                <button type="button">Yours</button>
                <button type="button">Active</button>
                <button type="button">Stale</button>
            </div>

            <div className="gh-repo-branches-list">
                <div className="gh-repo-branches-row gh-repo-branches-row--head">
                    <span>Branch</span>
                    <span>Updated</span>
                    <span>Check status</span>
                    <span>Behind</span>
                    <span>Ahead</span>
                    <span>Pull request</span>
                </div>
                {filtered.map(branch => (
                    <div key={branch.name} className="gh-repo-branches-row">
                        <div className="gh-repo-branches-name">
                            <button
                                type="button"
                                className={`gh-link-btn${selectedBranch === branch.name ? ' gh-repo-branches-current' : ''}`}
                                onClick={() => onSelectBranch?.(branch.name)}
                            >
                                <GitBranchIcon />
                                {branch.name}
                            </button>
                            {branch.default && <span className="gh-branch-panel-badge">default</span>}
                        </div>
                        <span className="gh-repo-branches-updated">{branch.updated}</span>
                        <span className="gh-repo-branches-status">
                            <code>{branch.sha}</code>
                        </span>
                        <span className="gh-repo-branches-diff">{branch.behind ?? 0}</span>
                        <span className="gh-repo-branches-diff">{branch.ahead ?? 0}</span>
                        <span className="gh-repo-branches-pr">—</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

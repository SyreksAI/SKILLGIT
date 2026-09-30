import { Link } from 'react-router-dom';
import { GitBranchIcon, HistoryIcon } from '../pages/icons';

export function RepoCommitsList({
    repo,
    owner,
    repoName,
    selectedBranch,
    onSelectCommit,
}) {
    const commits = repo.commits ?? [];
    const branch = selectedBranch || repo.defaultBranch || 'main';

    return (
        <div className="gh-repo-commits">
            <nav className="gh-repo-breadcrumbs">
                <Link to={`/labskill/${owner}/${repoName}`}>{repoName}</Link>
                <span>/</span>
                <span>commits</span>
            </nav>

            <header className="gh-repo-commits-head">
                <h2>
                    <HistoryIcon />
                    Commits
                </h2>
                <div className="gh-repo-commits-branch">
                    <GitBranchIcon />
                    <span>{branch}</span>
                </div>
            </header>

            <div className="gh-repo-commits-list">
                {commits.length === 0 ? (
                    <div className="gh-repo-empty-state">
                        <p>No commits yet.</p>
                    </div>
                ) : (
                    commits.map(commit => (
                        <button
                            key={commit.id || commit.sha}
                            type="button"
                            className="gh-repo-commit-row"
                            onClick={() => onSelectCommit(commit.sha)}
                        >
                            <div className="gh-repo-commit-row-main">
                                <span className="gh-repo-commit-avatar">
                                    {commit.author?.charAt(0)?.toUpperCase() ?? '?'}
                                </span>
                                <div className="gh-repo-commit-row-text">
                                    <strong>{commit.message}</strong>
                                    <span>
                                        {commit.author} committed {commit.date}
                                    </span>
                                </div>
                            </div>
                            <div className="gh-repo-commit-row-meta">
                                {commit.changes?.length > 0 && (
                                    <span className="gh-repo-commit-files-count">
                                        {commit.changes.length} file{commit.changes.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                                <code className="gh-repo-commit-sha">{commit.sha}</code>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

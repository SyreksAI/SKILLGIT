import { Link } from 'react-router-dom';
import { formatCommitStats } from '../../utils/commitUtils';
import { FileIcon, GitBranchIcon, HistoryIcon } from '../pages/icons';

const STATUS_LABELS = {
    added: 'Added',
    modified: 'Modified',
    deleted: 'Deleted',
    renamed: 'Renamed',
};

export function RepoCommitDetail({
    repo,
    owner,
    repoName,
    commit,
    onBackToList,
    onOpenFile,
}) {
    const branch = repo.defaultBranch || 'main';
    const stats = formatCommitStats(commit.changes);
    const changes = commit.changes ?? [];

    return (
        <div className="gh-repo-commits">
            <nav className="gh-repo-breadcrumbs">
                <Link to={`/labskill/${owner}/${repoName}`}>{repoName}</Link>
                <span>/</span>
                <button type="button" className="gh-link-btn" onClick={onBackToList}>
                    commits
                </button>
                <span>/</span>
                <strong>{commit.sha}</strong>
            </nav>

            <header className="gh-repo-commit-detail-head">
                <div className="gh-repo-commit-detail-title">
                    <h2>{commit.message}</h2>
                    <div className="gh-repo-commit-detail-meta">
                        <span className="gh-repo-commit-avatar">
                            {commit.author?.charAt(0)?.toUpperCase() ?? '?'}
                        </span>
                        <span>
                            <strong>{commit.author}</strong> committed {commit.date}
                        </span>
                    </div>
                </div>
                <div className="gh-repo-commit-detail-actions">
                    <button type="button" className="gh-repo-action-btn" onClick={onBackToList}>
                        <HistoryIcon />
                        All commits
                    </button>
                    <span className="gh-repo-commit-detail-branch">
                        <GitBranchIcon />
                        {branch}
                    </span>
                </div>
            </header>

            <div className="gh-repo-commit-detail-sha">
                <span>Commit</span>
                <code>{commit.sha}</code>
            </div>

            {changes.length > 0 && (
                <div className="gh-repo-commit-detail-summary">
                    Showing <strong>{stats.files}</strong> changed file{stats.files !== 1 ? 's' : ''}
                    {' '}with <strong className="gh-diff-add">+{stats.additions}</strong>
                    {' '}<strong className="gh-diff-del">−{stats.deletions}</strong>
                </div>
            )}

            <div className="gh-repo-commit-changes">
                {changes.length === 0 ? (
                    <div className="gh-repo-empty-state gh-repo-empty-state--inline">
                        <p>No file changes recorded for this commit.</p>
                    </div>
                ) : (
                    changes.map(change => (
                        <button
                            key={change.path}
                            type="button"
                            className="gh-repo-commit-change-row"
                            onClick={() => onOpenFile?.(change.path)}
                        >
                            <span className="gh-repo-commit-change-status">
                                <span className={`gh-commit-badge gh-commit-badge--${change.status}`}>
                                    {STATUS_LABELS[change.status] ?? change.status}
                                </span>
                            </span>
                            <span className="gh-repo-commit-change-icon"><FileIcon /></span>
                            <span className="gh-repo-commit-change-path">{change.path}</span>
                            <span className="gh-repo-commit-change-stats">
                                {(change.additions ?? 0) > 0 && (
                                    <span className="gh-diff-add">+{change.additions}</span>
                                )}
                                {(change.deletions ?? 0) > 0 && (
                                    <span className="gh-diff-del">−{change.deletions}</span>
                                )}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

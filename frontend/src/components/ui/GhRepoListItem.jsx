import { Link } from 'react-router-dom';
import { StarIcon, GitForkIcon } from '../pages/icons';
import { CURRENT_USER } from '../../data/mockData';

const VIS_LABELS = {
    public: 'Public',
    private: 'Private',
};

function repoLink(repo) {
    const owner = repo.owner || CURRENT_USER.username;
    return `/labskill/${owner}/${repo.name}`;
}

function repoTitle(repo) {
    const owner = repo.owner || CURRENT_USER.username;
    if (repo.owner && repo.owner !== CURRENT_USER.username) {
        return `${repo.owner}/${repo.name}`;
    }
    return repo.name;
}

export function GhRepoListItem({ repo, highlighted }) {
    return (
        <article
            className={`gh-repo-item${highlighted ? ' gh-repo-item--highlight' : ''}`}
            id={highlighted ? `repo-${repo.id}` : undefined}
        >
            <div className="gh-repo-item-head">
                <Link to={repoLink(repo)} className="gh-repo-name">
                    {repoTitle(repo)}
                </Link>
                <span className="gh-repo-vis">{VIS_LABELS[repo.visibility] ?? repo.visibility}</span>
            </div>
            {repo.description && <p className="gh-repo-desc">{repo.description}</p>}
            {repo.topics?.length > 0 && (
                <div className="gh-repo-topics">
                    {repo.topics.map(topic => (
                        <span key={topic} className="gh-topic">{topic}</span>
                    ))}
                </div>
            )}
            <div className="gh-repo-meta">
                {repo.language && (
                    <span className="gh-repo-lang">
                        <i style={{ background: repo.languageColor }} />
                        {repo.language}
                    </span>
                )}
                {repo.stars > 0 && (
                    <span className="gh-repo-stat"><StarIcon /> {repo.stars}</span>
                )}
                {repo.forks > 0 && (
                    <span className="gh-repo-stat"><GitForkIcon /> {repo.forks}</span>
                )}
                <span>Updated {repo.updated}</span>
            </div>
        </article>
    );
}

export function GhPinnedRepo({ repo }) {
    return (
        <article className="gh-pinned-repo">
            <div className="gh-repo-item-head">
                <Link to={repoLink(repo)} className="gh-repo-name">
                    {repoTitle(repo)}
                </Link>
                <span className="gh-repo-vis">{VIS_LABELS[repo.visibility] ?? repo.visibility}</span>
            </div>
            {repo.description && <p className="gh-repo-desc">{repo.description}</p>}
            <div className="gh-repo-meta">
                {repo.language && (
                    <span className="gh-repo-lang">
                        <i style={{ background: repo.languageColor }} />
                        {repo.language}
                    </span>
                )}
                {repo.stars > 0 && (
                    <span className="gh-repo-stat"><StarIcon /> {repo.stars}</span>
                )}
            </div>
        </article>
    );
}

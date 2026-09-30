import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRepoTags } from '../../data/branchData';
import { TagIcon } from '../pages/icons';

export function RepoTagsView({ repo, repoName, owner }) {
    const tags = useMemo(() => getRepoTags(repo, repoName), [repo, repoName]);

    return (
        <div className="gh-repo-branches gh-repo-tags">
            <nav className="gh-repo-breadcrumbs">
                <Link to={`/labskill/${owner}/${repoName}`}>{repoName}</Link>
                <span>/</span>
                <span>tags</span>
            </nav>

            <header className="gh-repo-branches-head">
                <h2>
                    <TagIcon />
                    Tags
                </h2>
                <button type="button" className="gh-btn-green">Create a new release</button>
            </header>

            {tags.length === 0 ? (
                <div className="gh-repo-empty-state">
                    <TagIcon />
                    <h3>No tags found</h3>
                    <p>This repository has no tags yet.</p>
                    <button type="button" className="gh-btn-green">Create a new release</button>
                </div>
            ) : (
                <div className="gh-repo-tags-list">
                    {tags.map(tag => (
                        <div key={tag.name} className="gh-repo-tags-row">
                            <div className="gh-repo-tags-name">
                                <TagIcon />
                                <strong>{tag.name}</strong>
                            </div>
                            <code>{tag.sha}</code>
                            <span>{tag.date}</span>
                            <span className="gh-repo-tags-downloads">{tag.downloads ?? 0} downloads</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

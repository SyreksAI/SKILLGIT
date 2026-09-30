import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserSettings } from '../../context/UserSettingsContext';
import { getRepoInsights } from '../../data/repoTabData';
import { getLanguageColor } from '../../utils/repoFiles';
import {
    SettingsIcon,
    StarIcon,
    EyeIcon,
    GitForkIcon,
} from '../pages/icons';

export function RepoSidebar({
    repo,
    owner,
    latestCommit,
    stars = 0,
    forks = 0,
    watchers = 0,
    onOpenSettings,
}) {
    const { user } = useUserSettings();
    const contributorName = owner === user.username
        ? user.name
        : (latestCommit?.author ?? owner);

    const contributorInitial = contributorName.charAt(0).toUpperCase();
    const languages = useMemo(() => getRepoInsights(repo).languages, [repo]);
    const totalLang = languages.reduce((sum, lang) => sum + lang.count, 0) || 1;

    return (
        <aside className="gh-repo-sidebar">
            <section className="gh-repo-side-block">
                <div className="gh-repo-side-head">
                    <h2>About</h2>
                    <button
                        type="button"
                        className="gh-repo-side-gear"
                        aria-label="Repository settings"
                        onClick={onOpenSettings}
                    >
                        <SettingsIcon />
                    </button>
                </div>

                {repo.description ? (
                    <p className="gh-repo-side-desc">{repo.description}</p>
                ) : (
                    <p className="gh-repo-side-desc gh-repo-side-desc--muted">
                        No description, website, or topics provided.
                    </p>
                )}

                {repo.language && (
                    <p className="gh-repo-side-lang">
                        <span
                            className="gh-repo-lang-dot"
                            style={{ background: getLanguageColor(repo.language) }}
                        />
                        {repo.language}
                    </p>
                )}

                {repo.topics?.length > 0 && (
                    <div className="gh-repo-side-topics">
                        {repo.topics.map(topic => (
                            <Link key={topic} to="#" className="gh-topic">{topic}</Link>
                        ))}
                    </div>
                )}

                <ul className="gh-repo-side-stats">
                    <li>
                        <StarIcon />
                        <strong>{stars}</strong> stars
                    </li>
                    <li>
                        <EyeIcon />
                        <strong>{watchers}</strong> watching
                    </li>
                    <li>
                        <GitForkIcon />
                        <strong>{forks}</strong> forks
                    </li>
                </ul>
            </section>

            <section className="gh-repo-side-block">
                <div className="gh-repo-side-head">
                    <h2>Releases</h2>
                </div>
                <p className="gh-repo-side-muted">No releases published</p>
                <Link to="#" className="gh-repo-side-link">Create a new release</Link>
            </section>

            <section className="gh-repo-side-block">
                <div className="gh-repo-side-head">
                    <h2>Packages</h2>
                </div>
                <p className="gh-repo-side-muted">No packages published</p>
                <Link to="#" className="gh-repo-side-link">Publish your first package</Link>
            </section>

            {languages.length > 0 && (
                <section className="gh-repo-side-block">
                    <h2>Languages</h2>
                    <div className="gh-repo-lang-bar gh-repo-lang-bar--side">
                        {languages.map(lang => (
                            <span
                                key={lang.name}
                                className="gh-repo-lang-segment"
                                style={{
                                    width: `${(lang.count / totalLang) * 100}%`,
                                    background: lang.color,
                                }}
                            />
                        ))}
                    </div>
                    <ul className="gh-repo-lang-legend gh-repo-lang-legend--side">
                        {languages.map(lang => (
                            <li key={lang.name}>
                                <span className="gh-repo-lang-dot" style={{ background: lang.color }} />
                                {lang.name}
                                <span>{Math.round((lang.count / totalLang) * 100)}%</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="gh-repo-side-block">
                <h2>Contributors</h2>
                <div className="gh-repo-contributor">
                    <span className="gh-repo-contributor-avatar">{contributorInitial}</span>
                    <div>
                        <strong>{contributorName}</strong>
                        <span>@{owner}</span>
                    </div>
                </div>
            </section>
        </aside>
    );
}

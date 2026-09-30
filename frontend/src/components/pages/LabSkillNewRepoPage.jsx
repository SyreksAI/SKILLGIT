import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CURRENT_USER, LABSKILL_USERS } from '../../data/mockData';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { HeaderActions } from '../ui/HeaderActions';
import { GhGlobalSearch } from '../ui/GhGlobalSearch';
import { GhFileUploadZone } from '../ui/GhFileUploadZone';
import { slugifyRepoName, createDefaultFiles, LANGUAGE_COLORS } from '../../utils/repoFiles';
import { ArrowRightIcon, RepoIcon } from './icons';

const LANGUAGE_OPTIONS = [
    { id: '', label: 'Auto-detect' },
    { id: 'JavaScript', label: 'JavaScript' },
    { id: 'TypeScript', label: 'TypeScript' },
    { id: 'Python', label: 'Python' },
    { id: 'HTML', label: 'HTML' },
];

const LICENSE_OPTIONS = [
    { id: '', label: 'No license' },
    { id: 'mit', label: 'MIT License' },
    { id: 'apache-2.0', label: 'Apache License 2.0' },
    { id: 'gpl-3.0', label: 'GNU GPLv3' },
];

const GITIGNORE_OPTIONS = [
    { id: '', label: 'No .gitignore' },
    { id: 'node', label: 'Node' },
    { id: 'python', label: 'Python' },
];

export function LabSkillNewRepoPage() {
    const navigate = useNavigate();
    const { repos, createRepo } = useLabSkillRepos();
    const user = CURRENT_USER;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [language, setLanguage] = useState('');
    const [license, setLicense] = useState('');
    const [gitignore, setGitignore] = useState('');
    const [withReadme, setWithReadme] = useState(true);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const slug = useMemo(() => slugifyRepoName(name), [name]);
    const existingNames = useMemo(() => repos.map(r => r.name), [repos]);

    function handleSubmit(e) {
        e.preventDefault();
        if (!slug) {
            setError('Repository name is required');
            return;
        }
        if (existingNames.includes(slug)) {
            setError('Repository with this name already exists');
            return;
        }

        setSubmitting(true);

        let files = [...stagedFiles];
        if (withReadme && !files.some(f => f.name.toLowerCase() === 'readme.md')) {
            files = [...createDefaultFiles({ name: slug, description }), ...files];
        }
        if (gitignore && !files.some(f => f.name === '.gitignore')) {
            const templates = {
                node: 'node_modules/\n.env\n.DS_Store\ndist/\n',
                python: '__pycache__/\n*.pyc\n.env\n.venv/\n',
            };
            files.push({
                path: '.gitignore',
                name: '.gitignore',
                type: 'file',
                size: 20,
                content: templates[gitignore] || 'node_modules/\n',
            });
        }
        if (license && !files.some(f => f.name.toLowerCase().startsWith('license'))) {
            files.push({
                path: 'LICENSE',
                name: 'LICENSE',
                type: 'file',
                size: 40,
                content: `${license.toUpperCase()} License\n`,
            });
        }

        const repo = createRepo({
            name: slug,
            description: description.trim(),
            visibility,
            language: language || undefined,
            languageColor: language ? LANGUAGE_COLORS[language] : undefined,
            files,
            withReadme: false,
            initialCommitMessage: files.length > 1
                ? `Initial commit with ${files.length} files`
                : 'Initial commit',
        });

        navigate(`/labskill/${repo.owner}/${repo.name}`);
    }

    return (
        <div className="gh-page gh-new-page">
            <header className="home-header gh-page-header">
                <GhGlobalSearch users={LABSKILL_USERS} />
                <HeaderActions />
            </header>

            <div className="gh-new-page-wrap">
                <nav className="gh-new-breadcrumb">
                    <Link to="/labskill">LabSkill</Link>
                    <span>/</span>
                    <span>New repository</span>
                </nav>

                <header className="gh-new-header">
                    <div>
                        <h1>Create a new repository</h1>
                        <p>Repositories contain your project files and revision history. Have a project elsewhere? Import a repository.</p>
                    </div>
                </header>

                <form className="gh-new-form gh-new-form--centered" onSubmit={handleSubmit}>
                    <section className="gh-new-card">
                        <div className="gh-create-field">
                            <span className="gh-create-label">Owner</span>
                            <div className="gh-create-owner gh-create-owner--select">
                                <span className="gh-create-owner-avatar">{user.name.charAt(0)}</span>
                                <span>{user.username}</span>
                            </div>
                        </div>

                        <label className="gh-create-field">
                            <span className="gh-create-label">Repository name <span className="gh-create-required">*</span></span>
                            <div className="gh-create-name-row">
                                <input
                                    type="text"
                                    className="gh-create-input"
                                    placeholder="my-awesome-project"
                                    value={name}
                                    onChange={e => { setName(e.target.value); setError(''); }}
                                />
                            </div>
                            {slug && (
                                <span className="gh-create-hint">Your repository will be created at /labskill/{user.username}/<strong>{slug}</strong></span>
                            )}
                        </label>

                        <label className="gh-create-field">
                            <span className="gh-create-label">Description <span className="gh-create-optional">(optional)</span></span>
                            <input
                                type="text"
                                className="gh-create-input"
                                placeholder="Short description of your repository"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </label>

                        <fieldset className="gh-create-field">
                            <legend className="gh-create-label">Visibility</legend>
                            <div className="gh-create-visibility">
                                <label className={`gh-create-vis-option${visibility === 'public' ? ' active' : ''}`}>
                                    <input type="radio" name="vis" checked={visibility === 'public'} onChange={() => setVisibility('public')} />
                                    <div>
                                        <strong>Public</strong>
                                        <span>Anyone on LabSkill can see this repository</span>
                                    </div>
                                </label>
                                <label className={`gh-create-vis-option${visibility === 'private' ? ' active' : ''}`}>
                                    <input type="radio" name="vis" checked={visibility === 'private'} onChange={() => setVisibility('private')} />
                                    <div>
                                        <strong>Private</strong>
                                        <span>You choose who can see and commit to this repository</span>
                                    </div>
                                </label>
                            </div>
                        </fieldset>
                    </section>

                    <section className="gh-new-card">
                        <h2>Initialize this repository with:</h2>

                        <label className="gh-create-check">
                            <input type="checkbox" checked={withReadme} onChange={e => setWithReadme(e.target.checked)} />
                            <span>Add a README file</span>
                        </label>

                        <label className="gh-create-field">
                            <span className="gh-create-label">Add .gitignore</span>
                            <select className="gh-create-select" value={gitignore} onChange={e => setGitignore(e.target.value)}>
                                {GITIGNORE_OPTIONS.map(opt => (
                                    <option key={opt.id || 'none'} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="gh-create-field">
                            <span className="gh-create-label">Choose a license</span>
                            <select className="gh-create-select" value={license} onChange={e => setLicense(e.target.value)}>
                                {LICENSE_OPTIONS.map(opt => (
                                    <option key={opt.id || 'none'} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="gh-create-field">
                            <span className="gh-create-label">Primary language</span>
                            <select className="gh-create-select" value={language} onChange={e => setLanguage(e.target.value)}>
                                {LANGUAGE_OPTIONS.map(opt => (
                                    <option key={opt.id || 'auto'} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </label>

                        <div className="gh-new-import">
                            <button type="button" className="gh-link-btn" onClick={() => setShowUpload(v => !v)}>
                                {showUpload ? 'Hide file upload' : 'Import files from your computer'}
                            </button>
                        </div>

                        {showUpload && (
                            <GhFileUploadZone
                                files={stagedFiles}
                                onChange={setStagedFiles}
                                onAnalysis={analysis => {
                                    if (!analysis) return;
                                    if (!name.trim() && analysis.suggestedName) setName(analysis.suggestedName);
                                    if (!description.trim() && analysis.suggestedDescription) setDescription(analysis.suggestedDescription);
                                    if (!language && analysis.language) setLanguage(analysis.language);
                                }}
                            />
                        )}
                    </section>

                    {error && <p className="gh-create-error gh-new-error">{error}</p>}

                    <div className="gh-new-submit">
                        <button type="submit" className="gh-create-btn gh-create-btn--primary" disabled={submitting}>
                            <RepoIcon />
                            {submitting ? 'Creating repository...' : 'Create repository'}
                            <ArrowRightIcon />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

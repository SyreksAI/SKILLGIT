import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRepoSettings } from '../../../data/repoSettingsModel';
import { slugifyRepoName } from '../../../utils/repoFiles';
import {
    SettingsBox,
    SettingsBoxHeader,
    SettingsBoxRow,
    SettingsField,
    SettingsPanel,
    SettingsToggleRow,
} from './SettingsShared';

export function RepoSettingsGeneral({
    repo,
    owner,
    repoName,
    readOnly,
    updateRepo,
    updateRepoSettings,
    deleteRepo,
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [name, setName] = useState(repoName);
    const [description, setDescription] = useState(repo.description || '');
    const [website, setWebsite] = useState(repo.website || '');
    const [topicsText, setTopicsText] = useState('');
    const [saved, setSaved] = useState(false);
    const [template, setTemplate] = useState(false);
    const [signoff, setSignoff] = useState(false);
    const [features, setFeatures] = useState({
        wikis: true,
        issues: true,
        sponsorships: false,
        discussions: false,
        projects: true,
    });
    const [mergeOptions, setMergeOptions] = useState({
        mergeCommit: true,
        squash: true,
        rebase: true,
        updateBranch: false,
        autoMerge: false,
        deleteBranch: true,
    });
    const [archives, setArchives] = useState(false);
    const [autoCloseIssues, setAutoCloseIssues] = useState(true);

    useEffect(() => {
        const settings = getRepoSettings(repo);
        setName(repoName);
        setDescription(repo.description || '');
        setWebsite(repo.website || '');
        setTopicsText((settings.topics?.length ? settings.topics : repo.topics || []).join(' '));
        setTemplate(settings.template);
        setSignoff(settings.signoff);
        setFeatures({ ...settings.features });
        setMergeOptions({ ...settings.merge });
        setArchives(settings.archives);
        setAutoCloseIssues(settings.autoCloseIssues);
        setSaved(false);
    }, [repo, repoName]);

    function persistSettings(patch) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, patch);
    }

    function toggleFeature(key, value) {
        setFeatures(prev => ({ ...prev, [key]: value }));
        persistSettings({ features: { [key]: value } });
    }

    function toggleMerge(key, value) {
        setMergeOptions(prev => ({ ...prev, [key]: value }));
        persistSettings({ merge: { [key]: value } });
    }

    function handleRename(e) {
        e.preventDefault();
        if (readOnly) return;

        const slug = slugifyRepoName(name) || repoName;
        const topics = topicsText.split(/\s+/).map(t => t.trim()).filter(Boolean);

        updateRepo(owner, repoName, {
            name: slug,
            description: description.trim(),
            website: website.trim(),
            topics,
        });
        persistSettings({
            template,
            signoff,
            merge: mergeOptions,
            archives,
            autoCloseIssues,
            topics,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        if (slug !== repoName) {
            const params = new URLSearchParams(searchParams);
            params.set('tab', 'settings');
            navigate(`/labskill/${owner}/${slug}?${params.toString()}`, { replace: true });
        }
    }

    function handleDelete() {
        if (readOnly) return;
        const confirmed = window.confirm(
            `Delete ${owner}/${repoName}? This cannot be undone.`,
        );
        if (!confirmed) return;
        deleteRepo(owner, repoName);
        navigate('/labskill?tab=repositories', { replace: true });
    }

    function handleVisibilityChange() {
        if (readOnly) return;
        const next = repo.visibility === 'private' ? 'public' : 'private';
        updateRepo(owner, repoName, { visibility: next });
    }

    const visibility = repo.visibility || 'public';

    return (
        <SettingsPanel title="General">
            <form onSubmit={handleRename}>
                <SettingsBox>
                    <SettingsField
                        label="Repository name"
                        hint="Great repository names are short and memorable. Need inspiration? How about super-duper-robot?"
                    >
                        <div className="gh-settings-input-row">
                            <input
                                type="text"
                                className="gh-settings-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={readOnly}
                            />
                            {!readOnly && (
                                <button type="submit" className="gh-settings-btn">
                                    {saved ? 'Saved!' : 'Rename'}
                                </button>
                            )}
                        </div>
                    </SettingsField>
                </SettingsBox>

                <SettingsBox>
                    <SettingsToggleRow
                        title="Template repository"
                        description="Template repositories let users generate new repositories with the same directory structure and files. Learn more about template repositories."
                        checked={template}
                        onChange={v => {
                            setTemplate(v);
                            persistSettings({ template: v });
                        }}
                        disabled={readOnly}
                    />
                </SettingsBox>

                <SettingsBox>
                    <SettingsToggleRow
                        title="Require commit signoff for web-based commits"
                        description="Enabling this setting will require contributors to sign off on commits made through LabSkill's web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the Developer Certificate of Origin (DCO)."
                        checked={signoff}
                        onChange={v => {
                            setSignoff(v);
                            persistSettings({ signoff: v });
                        }}
                        disabled={readOnly}
                        last
                    />
                </SettingsBox>

                <SettingsBox>
                    <SettingsField label="Description">
                        <textarea
                            className="gh-settings-textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Short description of this repository"
                            rows={3}
                            disabled={readOnly}
                        />
                    </SettingsField>
                    <SettingsField label="Website">
                        <input
                            type="url"
                            className="gh-settings-input"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            placeholder="https://"
                            disabled={readOnly}
                        />
                    </SettingsField>
                    <SettingsField
                        label="Topics (separate with spaces)"
                        hint="Help people discover your repository by adding topics."
                    >
                        <input
                            type="text"
                            className="gh-settings-input"
                            placeholder="e.g. react, api, skillgit"
                            value={topicsText}
                            onChange={e => setTopicsText(e.target.value)}
                            disabled={readOnly}
                        />
                    </SettingsField>
                    <SettingsBoxRow
                        title="Social preview"
                        description="Upload an image to customize how this repository appears when shared on social media."
                        last
                    >
                        <button type="button" className="gh-settings-btn" disabled={readOnly}>
                            Edit
                        </button>
                    </SettingsBoxRow>
                </SettingsBox>

                <SettingsBox>
                    <SettingsBoxHeader title="Features" />
                    <SettingsToggleRow
                        title="Wikis"
                        description="Wikis host documentation for your repository."
                        checked={features.wikis}
                        onChange={v => toggleFeature('wikis', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Issues"
                        description="Issues integrate lightweight task tracking into your repository."
                        checked={features.issues}
                        onChange={v => toggleFeature('issues', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Sponsorships"
                        description="Sponsorships help the community know how to financially support this repository."
                        checked={features.sponsorships}
                        onChange={v => toggleFeature('sponsorships', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Discussions"
                        description="Discussions is the space for your community to have conversations, ask questions, and find answers."
                        checked={features.discussions}
                        onChange={v => toggleFeature('discussions', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Projects"
                        description="Projects in LabSkill are created at the repository level."
                        checked={features.projects}
                        onChange={v => toggleFeature('projects', v)}
                        disabled={readOnly}
                        last
                    />
                </SettingsBox>

                <SettingsBox>
                    <SettingsBoxHeader title="Pull Requests" />
                    <SettingsToggleRow
                        title="Allow merge commits"
                        description="Add all commits from the head branch to the base branch with a merge commit."
                        checked={mergeOptions.mergeCommit}
                        onChange={v => toggleMerge('mergeCommit', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Allow squash merging"
                        description="Combine all commits from the head branch into a single commit in the base branch."
                        checked={mergeOptions.squash}
                        onChange={v => toggleMerge('squash', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Allow rebase merging"
                        description="Add all commits from the head branch onto the base branch individually."
                        checked={mergeOptions.rebase}
                        onChange={v => toggleMerge('rebase', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Always suggest updating pull request branches"
                        description="Whenever there are new changes available in the base branch, present an update branch option in the pull request."
                        checked={mergeOptions.updateBranch}
                        onChange={v => toggleMerge('updateBranch', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Allow auto-merge"
                        description="Waits for merge requirements to be met and then merges automatically."
                        checked={mergeOptions.autoMerge}
                        onChange={v => toggleMerge('autoMerge', v)}
                        disabled={readOnly}
                    />
                    <SettingsToggleRow
                        title="Automatically delete head branches"
                        description="After pull requests are merged, linked heads are deleted."
                        checked={mergeOptions.deleteBranch}
                        onChange={v => toggleMerge('deleteBranch', v)}
                        disabled={readOnly}
                        last
                    />
                </SettingsBox>

                <SettingsBox>
                    <SettingsBoxHeader title="Archives" />
                    <SettingsToggleRow
                        title="Include Git LFS objects in archives"
                        description="Git LFS objects will be included in the tarballs available from the Downloads section."
                        checked={archives}
                        onChange={v => {
                            setArchives(v);
                            persistSettings({ archives: v });
                        }}
                        disabled={readOnly}
                        last
                    />
                </SettingsBox>

                <SettingsBox>
                    <SettingsBoxHeader title="Issues" />
                    <SettingsToggleRow
                        title="Auto-close issues with merged linked pull requests"
                        description="Closing issues automatically when their linked pull requests are merged."
                        checked={autoCloseIssues}
                        onChange={v => {
                            setAutoCloseIssues(v);
                            persistSettings({ autoCloseIssues: v });
                        }}
                        disabled={readOnly}
                        last
                    />
                </SettingsBox>
            </form>

            <SettingsBox danger>
                <SettingsBoxHeader title="Danger Zone" />
                <SettingsBoxRow
                    title="Change repository visibility"
                    description={`This repository is currently ${visibility}.`}
                >
                    <button
                        type="button"
                        className="gh-settings-btn gh-settings-btn--danger"
                        disabled={readOnly}
                        onClick={handleVisibilityChange}
                    >
                        Change visibility
                    </button>
                </SettingsBoxRow>
                <SettingsBoxRow
                    title="Disable branch protection rules"
                    description="Disable branch protection rules enforcement and APIs."
                >
                    <button type="button" className="gh-settings-btn gh-settings-btn--danger" disabled={readOnly}>
                        Disable branch protection rules
                    </button>
                </SettingsBoxRow>
                <SettingsBoxRow
                    title="Transfer ownership"
                    description="Transfer this repository to another user or to an organization where you have the ability to create repositories."
                >
                    <button type="button" className="gh-settings-btn gh-settings-btn--danger" disabled={readOnly}>
                        Transfer
                    </button>
                </SettingsBoxRow>
                <SettingsBoxRow
                    title="Archive this repository"
                    description="Mark this repository as archived and read-only."
                >
                    <button type="button" className="gh-settings-btn gh-settings-btn--danger" disabled={readOnly}>
                        Archive this repository
                    </button>
                </SettingsBoxRow>
                <SettingsBoxRow
                    title="Delete this repository"
                    description="Once you delete a repository, there is no going back. Please be certain."
                    last
                >
                    <button
                        type="button"
                        className="gh-settings-btn gh-settings-btn--danger-solid"
                        disabled={readOnly}
                        onClick={handleDelete}
                    >
                        Delete this repository
                    </button>
                </SettingsBoxRow>
            </SettingsBox>
        </SettingsPanel>
    );
}

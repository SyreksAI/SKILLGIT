import { useMemo, useState } from 'react';
import { getRepoBranches, getDefaultBranchName } from '../../data/branchData';
import { GitBranchIcon } from '../pages/icons';
import { SettingsBox, SettingsField, SettingsPanel } from './settings/SettingsShared';

export function RepoSettingsBranches({ repo, repoName }) {
    const branches = useMemo(() => getRepoBranches(repo, repoName), [repo, repoName]);
    const defaultName = getDefaultBranchName(repo, repoName);
    const [selectedDefault, setSelectedDefault] = useState(defaultName);

    return (
        <SettingsPanel title="Branches">
            <SettingsBox>
                <SettingsField
                    label="Default branch"
                    hint="The default branch is considered the base branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch."
                >
                    <div className="gh-settings-input-row">
                        <select
                            className="gh-settings-select"
                            value={selectedDefault}
                            onChange={e => setSelectedDefault(e.target.value)}
                        >
                            {branches.map(branch => (
                                <option key={branch.name} value={branch.name}>{branch.name}</option>
                            ))}
                        </select>
                        <button type="button" className="gh-settings-btn gh-settings-btn--primary">
                            Update
                        </button>
                    </div>
                </SettingsField>
            </SettingsBox>

            <SettingsBox>
                <div className="gh-settings-branches-head">
                    <h3>{branches.length} branch{branches.length !== 1 ? 'es' : ''}</h3>
                    <button type="button" className="gh-settings-btn">New branch</button>
                </div>
                <ul className="gh-settings-branches-list">
                    {branches.map(branch => (
                        <li key={branch.name} className="gh-settings-branch-item">
                            <GitBranchIcon />
                            <div>
                                <strong>{branch.name}</strong>
                                {branch.default && <span className="gh-branch-panel-badge">default</span>}
                                <span>Updated {branch.updated}</span>
                            </div>
                            <button type="button" className="gh-link-btn">Edit</button>
                        </li>
                    ))}
                </ul>
            </SettingsBox>

            <SettingsBox>
                <div className="gh-settings-branches-protection">
                    <h3>Branch protection rules</h3>
                    <p>
                        Classic branch protections have not been configured. Define branch rules to
                        disable force pushing, prevent branches from being deleted, or require pull
                        requests before merging.
                    </p>
                    <button type="button" className="gh-settings-btn">Add rule</button>
                </div>
            </SettingsBox>
        </SettingsPanel>
    );
}

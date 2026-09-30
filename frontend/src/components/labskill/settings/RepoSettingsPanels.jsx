import { useMemo, useState } from 'react';
import { getRepoTags } from '../../../data/branchData';
import { getRepoSettings } from '../../../data/repoSettingsModel';
import {
    MOCK_COLLABORATORS,
    MOCK_DEPLOY_KEYS,
    MOCK_ENVIRONMENTS,
    MOCK_LABSKILL_APPS,
    MOCK_MCP_SERVERS,
    MOCK_OIDC_PROVIDERS,
    MOCK_RULESETS,
    MOCK_RUNNERS,
    MOCK_SECRETS,
    MOCK_WEBHOOKS,
} from '../../../data/settingsData';
import { TagIcon, WebhookIcon } from '../../pages/icons';
import {
    SettingsBox,
    SettingsBoxHeader,
    SettingsBoxRow,
    SettingsEmptyState,
    SettingsField,
    SettingsNotice,
    SettingsPanel,
    SettingsPanelToolbar,
    SettingsRadioGroup,
    SettingsSubTabs,
    SettingsTable,
    SettingsTableRow,
    SettingsToggleRow,
} from './SettingsShared';

export function ModerationInteractionPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const limits = getRepoSettings(repo).moderation.interaction;

    function setLimit(key, value) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, {
            moderation: { interaction: { [key]: value } },
        });
    }

    return (
        <SettingsPanel title="Interaction limits">
            <SettingsNotice>
                Limit interactions to users who have been on LabSkill for less than 24 hours,
                have a new account, or have not yet interacted with your repository.
            </SettingsNotice>
            <SettingsBox>
                <SettingsToggleRow
                    title="Limit to existing users"
                    description="Users who have recently created their account will be unable to interact with your repository."
                    checked={limits.users}
                    onChange={v => setLimit('users', v)}
                    disabled={readOnly}
                />
                <SettingsToggleRow
                    title="Limit to users who have recently created issues or pull requests"
                    description="Users who have recently created their first issue or pull request will be unable to interact with your repository."
                    checked={limits.issues}
                    onChange={v => setLimit('issues', v)}
                    disabled={readOnly}
                />
                <SettingsToggleRow
                    title="Limit to users who have recently commented"
                    description="Users who have recently commented on issues or pull requests will be unable to interact with your repository."
                    checked={limits.comments}
                    onChange={v => setLimit('comments', v)}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function ModerationReviewPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const limit = getRepoSettings(repo).moderation.review.limit;

    function setReviewLimit(value) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, {
            moderation: { review: { limit: value } },
        });
    }

    return (
        <SettingsPanel title="Code review limits">
            <SettingsBox>
                <SettingsToggleRow
                    title="Limit to users who are not collaborators"
                    description="Users who are not collaborators will be unable to approve or request changes on pull requests."
                    checked={limit}
                    onChange={setReviewLimit}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function RulesetsPanel({ readOnly }) {
    return (
        <SettingsPanel title="Rulesets">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    Rulesets define whether collaborators can modify tagged resources and set requirements for how changes can land.
                </SettingsNotice>
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    New ruleset
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                <SettingsTable columns={['Ruleset name', 'Enforcement', 'Updated']}>
                    {MOCK_RULESETS.map(rule => (
                        <SettingsTableRow
                            key={rule.name}
                            cells={[
                                <strong key="n">{rule.name}</strong>,
                                <span className="gh-settings-badge gh-settings-badge--green">{rule.enforcement}</span>,
                                rule.updated,
                            ]}
                            actions={<button type="button" className="gh-link-btn">Edit</button>}
                        />
                    ))}
                </SettingsTable>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function TagsPanel({ repo, repoName, readOnly }) {
    const tags = useMemo(() => getRepoTags(repo, repoName), [repo, repoName]);

    return (
        <SettingsPanel title="Tags">
            <SettingsBox>
                <SettingsBoxHeader title="Tag protection rules" />
                <SettingsBoxRow
                    title="No tag protection rules"
                    description="Define rules to protect important tags from being deleted or modified."
                    last
                >
                    <button type="button" className="gh-settings-btn" disabled={readOnly}>Add rule</button>
                </SettingsBoxRow>
            </SettingsBox>
            <SettingsBox>
                <div className="gh-settings-branches-head">
                    <h3>{tags.length} tag{tags.length !== 1 ? 's' : ''}</h3>
                </div>
                {tags.length === 0 ? (
                    <SettingsEmptyState message="There are no tags in this repository." />
                ) : (
                    <ul className="gh-settings-branches-list">
                        {tags.map(tag => (
                            <li key={tag.name} className="gh-settings-branch-item">
                                <TagIcon />
                                <div>
                                    <strong>{tag.name}</strong>
                                    <span>{tag.date} · {tag.downloads} downloads</span>
                                </div>
                                <button type="button" className="gh-link-btn">View</button>
                            </li>
                        ))}
                    </ul>
                )}
            </SettingsBox>
        </SettingsPanel>
    );
}

function actionsPolicyFromSettings(actions) {
    if (!actions.enabled) return 'none';
    if (actions.allowAllActions) return 'all';
    return 'local';
}

export function ActionsGeneralPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const actions = getRepoSettings(repo).actions;
    const actionsPolicy = actionsPolicyFromSettings(actions);
    const [workflowPolicy, setWorkflowPolicy] = useState('read');

    function persistActions(patch) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, { actions: patch });
    }

    function handleActionsPolicy(value) {
        if (value === 'none') {
            persistActions({ enabled: false, allowAllActions: false });
        } else if (value === 'local') {
            persistActions({ enabled: true, allowAllActions: false });
        } else {
            persistActions({ enabled: true, allowAllActions: true });
        }
    }

    return (
        <SettingsPanel title="Actions permissions">
            <SettingsBox>
                <SettingsField label="Actions permissions">
                    <SettingsRadioGroup
                        name="actions-policy"
                        value={actionsPolicy}
                        onChange={handleActionsPolicy}
                        disabled={readOnly}
                        options={[
                            {
                                value: 'all',
                                label: 'Allow all actions and reusable workflows',
                                description: 'Any action or reusable workflow can be used, regardless of who authored it or where it is defined.',
                            },
                            {
                                value: 'local',
                                label: 'Allow SkillGit actions and reusable workflows',
                                description: 'Only actions and reusable workflows defined in a repository within this enterprise are allowed.',
                            },
                            {
                                value: 'none',
                                label: 'Disable actions',
                                description: 'The Actions tab is hidden and no workflows can run.',
                            },
                        ]}
                    />
                </SettingsField>
            </SettingsBox>
            <SettingsBox>
                <SettingsField
                    label="Workflow permissions"
                    hint="Choose the default permissions granted to the SKILLGIT_TOKEN when running workflows in this repository."
                >
                    <SettingsRadioGroup
                        name="workflow-policy"
                        value={workflowPolicy}
                        onChange={setWorkflowPolicy}
                        disabled={readOnly}
                        options={[
                            { value: 'read', label: 'Read repository contents and packages permissions' },
                            { value: 'write', label: 'Read and write permissions' },
                        ]}
                    />
                </SettingsField>
                <SettingsToggleRow
                    title="Allow SkillGit Actions to create pull requests or submit code"
                    description="Workflows can create pull requests or push code to your repository."
                    checked={actions.forkPullRequestWorkflows}
                    onChange={v => persistActions({ forkPullRequestWorkflows: v })}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
            <SettingsBox>
                <SettingsBoxHeader title="Artifact and log retention" />
                <SettingsField label="Artifact and log retention (days)">
                    <div className="gh-settings-input-row">
                        <input type="number" className="gh-settings-input" defaultValue={90} disabled={readOnly} />
                        <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>Save</button>
                    </div>
                </SettingsField>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function ActionsRunnersPanel({ readOnly }) {
    return (
        <SettingsPanel title="Runners">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    Host your own runners and customize the environment used to run jobs in your LabSkill Actions workflows.
                </SettingsNotice>
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    New self-hosted runner
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                <SettingsTable columns={['Runner name', 'Labels', 'Status', 'Last job']}>
                    {MOCK_RUNNERS.map(runner => (
                        <SettingsTableRow
                            key={runner.name}
                            cells={[runner.name, runner.labels, runner.status, runner.lastJob]}
                            actions={<button type="button" className="gh-link-btn">Configure</button>}
                        />
                    ))}
                </SettingsTable>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function ActionsPoliciesPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const requireApproval = getRepoSettings(repo).actions.requireApprovalForForks;

    function setRequireApproval(value) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, {
            actions: { requireApprovalForForks: value },
        });
    }

    return (
        <SettingsPanel title="Policies">
            <SettingsBox>
                <SettingsToggleRow
                    title="Require approval for all outside collaborators"
                    description="Workflow runs triggered by outside collaborators require approval from someone with write access."
                    checked={requireApproval}
                    onChange={setRequireApproval}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function ActionsPolicyInsightsPanel() {
    return (
        <SettingsPanel title="Policy insights">
            <SettingsBox>
                <SettingsEmptyState message="No policy insights available for this repository yet." />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function ActionsOidcPanel({ readOnly }) {
    return (
        <SettingsPanel title="OpenID Connect">
            <SettingsNotice>
                Use OpenID Connect to access cloud resources without long-lived secrets.
            </SettingsNotice>
            <SettingsPanelToolbar>
                <span />
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    Add provider
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                {MOCK_OIDC_PROVIDERS.length === 0 ? (
                    <SettingsEmptyState message="No OIDC providers configured." />
                ) : (
                    <SettingsTable columns={['Provider name', 'Issuer URL']}>
                        {MOCK_OIDC_PROVIDERS.map(p => (
                            <SettingsTableRow
                                key={p.name}
                                cells={[p.name, <code key="i">{p.issuer}</code>]}
                                actions={<button type="button" className="gh-link-btn">Edit</button>}
                            />
                        ))}
                    </SettingsTable>
                )}
            </SettingsBox>
        </SettingsPanel>
    );
}

export function WebhooksPanel({ repo, readOnly }) {
    const webhooks = getRepoSettings(repo).webhooks ?? MOCK_WEBHOOKS;

    return (
        <SettingsPanel title="Webhooks">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    Webhooks allow external services to be notified when certain events happen.
                </SettingsNotice>
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    Add webhook
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                {webhooks.length === 0 ? (
                    <SettingsEmptyState message="Webhooks will appear here when configured." />
                ) : (
                    <ul className="gh-settings-branches-list">
                        {webhooks.map(hook => (
                            <li key={hook.id} className="gh-settings-branch-item">
                                <WebhookIcon />
                                <div>
                                    <strong>{hook.url}</strong>
                                    <span>{hook.events} · Last delivery {hook.lastDelivery}</span>
                                </div>
                                <span className={`gh-settings-badge${hook.active ? ' gh-settings-badge--green' : ''}`}>
                                    {hook.active ? 'Active' : 'Inactive'}
                                </span>
                                <button type="button" className="gh-link-btn">Edit</button>
                            </li>
                        ))}
                    </ul>
                )}
            </SettingsBox>
        </SettingsPanel>
    );
}

export function SkillMateCodeReviewPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const skillmate = getRepoSettings(repo).skillmate;

    function persistSkillmate(patch) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, { skillmate: patch });
    }

    return (
        <SettingsPanel title="SkillMate code review">
            <SettingsBox>
                <SettingsToggleRow
                    title="Enable SkillMate code review"
                    description="SkillMate can review pull requests and suggest improvements automatically."
                    checked={skillmate.codeReview}
                    onChange={v => persistSkillmate({ codeReview: v })}
                    disabled={readOnly}
                />
                <SettingsToggleRow
                    title="Automatically review new pull requests"
                    description="SkillMate will post a review when a pull request is opened or updated."
                    checked={skillmate.autoReview ?? false}
                    onChange={v => persistSkillmate({ autoReview: v })}
                    disabled={readOnly || !skillmate.codeReview}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function SkillMateCloudAgentPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const enabled = getRepoSettings(repo).skillmate.cloudAgent;

    function setEnabled(value) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, { skillmate: { cloudAgent: value } });
    }

    return (
        <SettingsPanel title="SkillMate cloud agent">
            <SettingsBox>
                <SettingsToggleRow
                    title="Enable cloud agent"
                    description="Allow SkillMate to run tasks in a managed cloud environment for this repository."
                    checked={enabled}
                    onChange={setEnabled}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function SkillMateInternetPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const enabled = getRepoSettings(repo).skillmate.internetAccess;

    function setEnabled(value) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, { skillmate: { internetAccess: value } });
    }

    return (
        <SettingsPanel title="Internet access">
            <SettingsBox>
                <SettingsToggleRow
                    title="Allow SkillMate to access the internet"
                    description="SkillMate can fetch documentation, package metadata, and external APIs when assisting in this repository."
                    checked={enabled}
                    onChange={setEnabled}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function SkillMateMcpPanel({ readOnly }) {
    return (
        <SettingsPanel title="MCP servers">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    Model Context Protocol servers extend SkillMate with custom tools and data sources.
                </SettingsNotice>
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    Add MCP server
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                <SettingsTable columns={['Server', 'Endpoint', 'Status']}>
                    {MOCK_MCP_SERVERS.map(s => (
                        <SettingsTableRow
                            key={s.name}
                            cells={[s.name, s.url, s.status]}
                            actions={<button type="button" className="gh-link-btn">Configure</button>}
                        />
                    ))}
                </SettingsTable>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function PlanningAgentSuggestionsPanel({ readOnly }) {
    const [enabled, setEnabled] = useState(true);

    return (
        <SettingsPanel title="Agent suggestions for issues">
            <SettingsBox>
                <SettingsToggleRow
                    title="Enable agent suggestions"
                    description="LabSkill agents can suggest labels, assignees, and next steps on new issues."
                    checked={enabled}
                    onChange={setEnabled}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function EnvironmentsPanel({ readOnly }) {
    return (
        <SettingsPanel title="Environments">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    Environments are used by your workflows and can include protection rules and secrets.
                </SettingsNotice>
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    New environment
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                <SettingsTable columns={['Environment', 'Protection', 'Updated']}>
                    {MOCK_ENVIRONMENTS.map(env => (
                        <SettingsTableRow
                            key={env.name}
                            cells={[
                                <strong key="n">{env.name}</strong>,
                                env.protection
                                    ? <span className="gh-settings-badge gh-settings-badge--green">Protected</span>
                                    : 'None',
                                env.updated,
                            ]}
                            actions={<button type="button" className="gh-link-btn">Configure</button>}
                        />
                    ))}
                </SettingsTable>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function CodespacesPanel({ readOnly }) {
    const [enabled, setEnabled] = useState(true);
    const [retention, setRetention] = useState('30');

    return (
        <SettingsPanel title="Codespaces">
            <SettingsBox>
                <SettingsToggleRow
                    title="Enable Codespaces"
                    description="Members with write access can create codespaces for this repository."
                    checked={enabled}
                    onChange={setEnabled}
                    disabled={readOnly}
                />
                <SettingsField label="Default retention period (days)">
                    <select
                        className="gh-settings-select"
                        value={retention}
                        onChange={e => setRetention(e.target.value)}
                        disabled={readOnly}
                    >
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                    </select>
                </SettingsField>
                <SettingsBoxRow
                    title="Dev container configuration"
                    description="Add a devcontainer.json file to configure the development environment."
                    last
                >
                    <button type="button" className="gh-settings-btn" disabled={readOnly}>Set up dev container</button>
                </SettingsBoxRow>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function PagesPanel({ repo, readOnly }) {
    const [source, setSource] = useState('main');
    const branch = repo.defaultBranch || 'main';

    return (
        <SettingsPanel title="LabSkill Pages">
            <SettingsNotice>
                LabSkill Pages lets you host static sites from this repository.
            </SettingsNotice>
            <SettingsBox>
                <SettingsField label="Build and deployment">
                    <SettingsRadioGroup
                        name="pages-source"
                        value={source}
                        onChange={setSource}
                        disabled={readOnly}
                        options={[
                            {
                                value: 'main',
                                label: 'Deploy from a branch',
                                description: `Your site will be built from the ${branch} branch.`,
                            },
                            {
                                value: 'actions',
                                label: 'LabSkill Actions',
                                description: 'Use a workflow to build and deploy your site.',
                            },
                        ]}
                    />
                </SettingsField>
                <SettingsBoxRow
                    title="Custom domain"
                    description="Custom domains allow you to serve your site from a domain other than skillgit.ru."
                    last
                >
                    <button type="button" className="gh-settings-btn" disabled={readOnly}>Save</button>
                </SettingsBoxRow>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function AdvancedSecurityPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const security = getRepoSettings(repo).advancedSecurity;

    function persistSecurity(patch) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, { advancedSecurity: patch });
    }

    function toggleDependency(value) {
        persistSecurity({ dependencyGraph: value });
        if (updateRepoSettings) {
            updateRepoSettings(owner, repoName, {
                features: { dependencyGraph: value },
            });
        }
    }

    return (
        <SettingsPanel title="Advanced Security">
            <SettingsBox>
                <SettingsToggleRow
                    title="Dependency graph"
                    description="Understand your dependencies and receive alerts for vulnerable dependencies."
                    checked={security.dependencyGraph}
                    onChange={toggleDependency}
                    disabled={readOnly}
                />
                <SettingsToggleRow
                    title="Secret scanning"
                    description="Get notified when a secret is pushed to your repository."
                    checked={security.secretScanning}
                    onChange={v => persistSecurity({ secretScanning: v })}
                    disabled={readOnly}
                />
                <SettingsToggleRow
                    title="Dependabot alerts"
                    description="Receive alerts when dependencies have known vulnerabilities."
                    checked={security.dependabot}
                    onChange={v => persistSecurity({ dependabot: v })}
                    disabled={readOnly}
                    last
                />
            </SettingsBox>
        </SettingsPanel>
    );
}

export function DeployKeysPanel({ readOnly }) {
    return (
        <SettingsPanel title="Deploy keys">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    Deploy keys use an SSH key to grant readonly or write access to a single repository.
                </SettingsNotice>
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    Add deploy key
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                {MOCK_DEPLOY_KEYS.length === 0 ? (
                    <SettingsEmptyState message="There are no deploy keys for this repository." />
                ) : (
                    <SettingsTable columns={['Title', 'Fingerprint', 'Added']}>
                        {MOCK_DEPLOY_KEYS.map(key => (
                            <SettingsTableRow
                                key={key.title}
                                cells={[
                                    <strong key="t">{key.title}</strong>,
                                    <code key="f">{key.fingerprint}</code>,
                                    key.added,
                                ]}
                                actions={<button type="button" className="gh-link-btn gh-link-btn--danger">Delete</button>}
                            />
                        ))}
                    </SettingsTable>
                )}
            </SettingsBox>
        </SettingsPanel>
    );
}

function SecretsScopePanel({ title, scope, readOnly }) {
    const [tab, setTab] = useState('secrets');
    const secrets = MOCK_SECRETS[scope] ?? [];

    return (
        <SettingsPanel title={title}>
            <SettingsSubTabs
                tabs={[
                    { id: 'secrets', label: 'Secrets' },
                    { id: 'variables', label: 'Variables' },
                ]}
                active={tab}
                onChange={setTab}
            />
            <SettingsPanelToolbar>
                <span />
                <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                    New {tab === 'secrets' ? 'secret' : 'variable'}
                </button>
            </SettingsPanelToolbar>
            <SettingsBox>
                {secrets.length === 0 ? (
                    <SettingsEmptyState
                        message={`This repository has no ${tab} for ${scope}.`}
                    />
                ) : (
                    <SettingsTable columns={['Name', 'Last updated']}>
                        {secrets.map(item => (
                            <SettingsTableRow
                                key={item.name}
                                cells={[<strong key="n">{item.name}</strong>, item.updated]}
                                actions={<button type="button" className="gh-link-btn">Update</button>}
                            />
                        ))}
                    </SettingsTable>
                )}
            </SettingsBox>
        </SettingsPanel>
    );
}

export function SecretsActionsPanel(props) {
    return <SecretsScopePanel title="Actions secrets and variables" scope="actions" {...props} />;
}

export function SecretsAgentsPanel(props) {
    return <SecretsScopePanel title="Agents secrets and variables" scope="agents" {...props} />;
}

export function SecretsCodespacesPanel(props) {
    return <SecretsScopePanel title="Codespaces secrets and variables" scope="codespaces" {...props} />;
}

export function SecretsDependabotPanel(props) {
    return <SecretsScopePanel title="Dependabot secrets and variables" scope="dependabot" {...props} />;
}

export function LabSkillAppsPanel({ readOnly }) {
    return (
        <SettingsPanel title="LabSkill Apps">
            <SettingsPanelToolbar>
                <SettingsNotice>
                    LabSkill Apps can automate tasks and extend your workflow with integrations.
                </SettingsNotice>
            </SettingsPanelToolbar>
            <SettingsBox>
                {MOCK_LABSKILL_APPS.length === 0 ? (
                    <SettingsEmptyState message="No LabSkill Apps are installed on this repository." />
                ) : (
                    <SettingsTable columns={['App', 'Description', 'Installed']}>
                        {MOCK_LABSKILL_APPS.map(app => (
                            <SettingsTableRow
                                key={app.name}
                                cells={[
                                    <strong key="n">{app.name}</strong>,
                                    app.description,
                                    app.installed,
                                ]}
                                actions={<button type="button" className="gh-link-btn">Configure</button>}
                            />
                        ))}
                    </SettingsTable>
                )}
            </SettingsBox>
        </SettingsPanel>
    );
}

export function EmailNotificationsPanel({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const notify = getRepoSettings(repo).emailNotifications;

    function setNotify(value) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, { emailNotifications: value });
    }

    return (
        <SettingsPanel title="Email notifications">
            <SettingsBox>
                <SettingsField label="Who receives notifications for pushes to this repository?">
                    <SettingsRadioGroup
                        name="email-notify"
                        value={notify}
                        onChange={setNotify}
                        disabled={readOnly}
                        options={[
                            { value: 'participating', label: 'Use your personal notification settings' },
                            { value: 'watchers', label: 'Notify all watchers' },
                            { value: 'none', label: 'Do not send notifications for pushes' },
                        ]}
                    />
                </SettingsField>
            </SettingsBox>
        </SettingsPanel>
    );
}

export function CollaboratorsPanelEnhanced({ repo, owner, repoName, readOnly, updateRepoSettings }) {
    const collaborators = getRepoSettings(repo).collaborators ?? MOCK_COLLABORATORS;

    function removeCollaborator(username) {
        if (readOnly || !updateRepoSettings) return;
        updateRepoSettings(owner, repoName, {
            collaborators: collaborators.filter(user => user.username !== username),
        });
    }

    return (
        <SettingsPanel title="Collaborators">
            <SettingsBox>
                <SettingsField label="Add people">
                    <div className="gh-settings-input-row">
                        <input
                            type="text"
                            className="gh-settings-input"
                            placeholder="Search by username, full name, or email address"
                            disabled={readOnly}
                        />
                        <button type="button" className="gh-settings-btn gh-settings-btn--primary" disabled={readOnly}>
                            Add collaborator
                        </button>
                    </div>
                </SettingsField>
            </SettingsBox>
            <SettingsBox>
                <SettingsTable columns={['Collaborator', 'Role', '']}>
                    {collaborators.map(user => (
                        <SettingsTableRow
                            key={user.username}
                            cells={[
                                <span key="u" className="gh-settings-user-cell">
                                    <span className="gh-settings-user-avatar">{user.avatar}</span>
                                    <span>
                                        <strong>{user.name}</strong>
                                        <span className="gh-settings-user-handle">@{user.username}</span>
                                    </span>
                                </span>,
                                user.role,
                            ]}
                            actions={
                                <>
                                    <button type="button" className="gh-link-btn">Change role</button>
                                    <button
                                        type="button"
                                        className="gh-link-btn gh-link-btn--danger"
                                        disabled={readOnly}
                                        onClick={() => removeCollaborator(user.username)}
                                    >
                                        Remove
                                    </button>
                                </>
                            }
                        />
                    ))}
                </SettingsTable>
            </SettingsBox>
        </SettingsPanel>
    );
}

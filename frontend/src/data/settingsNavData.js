import {
    AgentsIcon,
    CubeIcon,
    GitBranchIcon,
    GridIcon,
    KeyIcon,
    LaptopIcon,
    LockIcon,
    MailIcon,
    ModerationIcon,
    PagesIcon,
    PlayIcon,
    RulesetIcon,
    SettingsIcon,
    ShieldSearchIcon,
    TagIcon,
    UsersIcon,
    WebhookIcon,
} from '../components/pages/icons';

export const SETTINGS_SIDEBAR = [
    { kind: 'link', id: 'general', label: 'General', Icon: SettingsIcon },
    { kind: 'heading', label: 'Access' },
    { kind: 'link', id: 'collaborators', label: 'Collaborators', Icon: UsersIcon },
    {
        kind: 'group',
        id: 'moderation',
        label: 'Moderation',
        Icon: ModerationIcon,
        children: [
            { id: 'moderation-interaction', label: 'Interaction limits' },
            { id: 'moderation-review', label: 'Code review limits' },
        ],
    },
    { kind: 'divider' },
    { kind: 'heading', label: 'Code, planning, and automation' },
    {
        kind: 'group',
        id: 'rulesets',
        label: 'Rulesets',
        Icon: RulesetIcon,
        children: [
            { id: 'rulesets', label: 'Rulesets' },
        ],
    },
    { kind: 'link', id: 'branches', label: 'Branches', Icon: GitBranchIcon },
    { kind: 'link', id: 'tags', label: 'Tags', Icon: TagIcon },
    {
        kind: 'group',
        id: 'actions',
        label: 'Actions',
        Icon: PlayIcon,
        children: [
            { id: 'actions-general', label: 'General' },
            { id: 'actions-runners', label: 'Runners' },
            { id: 'actions-policies', label: 'Policies' },
            { id: 'actions-policy-insights', label: 'Policy insights' },
            { id: 'actions-oidc', label: 'OIDC' },
        ],
    },
    { kind: 'link', id: 'webhooks', label: 'Webhooks', Icon: WebhookIcon },
    {
        kind: 'group',
        id: 'skillmate',
        label: 'SkillMate',
        Icon: AgentsIcon,
        children: [
            { id: 'skillmate-code-review', label: 'Code review' },
            { id: 'skillmate-cloud-agent', label: 'Cloud agent' },
            { id: 'skillmate-internet', label: 'Internet access' },
            { id: 'skillmate-mcp', label: 'MCP servers' },
        ],
    },
    {
        kind: 'group',
        id: 'planning',
        label: 'Planning',
        Icon: GridIcon,
        children: [
            { id: 'planning-agent-suggestions', label: 'Agent suggestions for issues' },
        ],
    },
    { kind: 'link', id: 'environments', label: 'Environments', Icon: CubeIcon },
    { kind: 'link', id: 'codespaces', label: 'Codespaces', Icon: LaptopIcon },
    { kind: 'link', id: 'pages', label: 'Pages', Icon: PagesIcon },
    { kind: 'divider' },
    { kind: 'heading', label: 'Security and quality' },
    { kind: 'link', id: 'advanced-security', label: 'Advanced Security', Icon: ShieldSearchIcon },
    { kind: 'link', id: 'deploy-keys', label: 'Deploy keys', Icon: KeyIcon },
    {
        kind: 'group',
        id: 'secrets',
        label: 'Secrets and variables',
        Icon: LockIcon,
        children: [
            { id: 'secrets-actions', label: 'Actions' },
            { id: 'secrets-agents', label: 'Agents' },
            { id: 'secrets-codespaces', label: 'Codespaces' },
            { id: 'secrets-dependabot', label: 'Dependabot' },
        ],
    },
    { kind: 'divider' },
    { kind: 'heading', label: 'Integrations' },
    { kind: 'link', id: 'labskill-apps', label: 'LabSkill Apps', Icon: GridIcon },
    { kind: 'link', id: 'email-notifications', label: 'Email notifications', Icon: MailIcon },
];

function collectIds(items) {
    const ids = [];
    for (const item of items) {
        if (item.kind === 'link' && item.id) ids.push(item.id);
        if (item.children) ids.push(...item.children.map(c => c.id));
    }
    return ids;
}

export const SETTINGS_SECTION_IDS = collectIds(SETTINGS_SIDEBAR);

const SECTION_LABELS = SETTINGS_SIDEBAR.reduce((map, item) => {
    if (item.id && item.label) map[item.id] = item.label;
    if (item.children) {
        for (const child of item.children) {
            map[child.id] = child.label;
        }
    }
    return map;
}, {});

export function getSettingsSectionLabel(sectionId) {
    return SECTION_LABELS[sectionId] ?? 'Settings';
}

export function getSettingsGroupForSection(sectionId) {
    for (const item of SETTINGS_SIDEBAR) {
        if (item.kind === 'group' && item.children?.some(c => c.id === sectionId)) {
            return item.id;
        }
    }
    return null;
}

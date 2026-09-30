export const MOCK_COLLABORATORS = [
    { username: 'maria-k', name: 'Maria K.', role: 'Write', avatar: 'M' },
    { username: 'alex-p', name: 'Alex P.', role: 'Read', avatar: 'A' },
];

export const MOCK_WEBHOOKS = [
    {
        id: 1,
        url: 'https://hooks.skillgit.ru/deploy',
        events: 'push, pull_request',
        active: true,
        lastDelivery: '2 hours ago',
    },
];

export const MOCK_ENVIRONMENTS = [
    { name: 'production', updated: '3 days ago', protection: true },
    { name: 'staging', updated: '1 week ago', protection: false },
];

export const MOCK_DEPLOY_KEYS = [
    { title: 'CI deploy key', fingerprint: 'SHA256:abc123…', added: 'Jan 12, 2026', readOnly: true },
];

export const MOCK_RULESETS = [
    { name: 'main-protection', target: 'Branch', enforcement: 'Active', updated: '5 days ago' },
];

export const MOCK_RUNNERS = [
    { name: 'self-hosted-linux', labels: 'self-hosted, Linux, X64', status: 'Idle', lastJob: '1 day ago' },
];

export const MOCK_LABSKILL_APPS = [
    { name: 'SkillDeploy', description: 'Automated deployments on push to main.', installed: 'Feb 2, 2026' },
];

export const MOCK_MCP_SERVERS = [
    { name: 'docs-server', url: 'https://mcp.skillgit.ru/docs', status: 'Connected' },
];

export const MOCK_SECRETS = {
    actions: [
        { name: 'API_TOKEN', updated: '2 weeks ago' },
        { name: 'DEPLOY_KEY', updated: '1 month ago' },
    ],
    agents: [],
    codespaces: [{ name: 'NPM_TOKEN', updated: '3 days ago' }],
    dependabot: [],
};

export const MOCK_OIDC_PROVIDERS = [
    { name: 'skillgit-cloud', issuer: 'https://token.skillgit.ru' },
];

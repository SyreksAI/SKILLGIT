import {
    MOCK_COLLABORATORS,
    MOCK_WEBHOOKS,
} from './settingsData';

export const DEFAULT_REPO_SETTINGS = {
    template: false,
    signoff: false,
    features: {
        wikis: true,
        issues: true,
        sponsorships: false,
        discussions: false,
        projects: true,
        dependencyGraph: false,
    },
    merge: {
        mergeCommit: true,
        squash: true,
        rebase: true,
        updateBranch: false,
        autoMerge: false,
        deleteBranch: true,
    },
    archives: false,
    autoCloseIssues: true,
    topics: [],
    moderation: {
        interaction: { comments: false, issues: false, users: false },
        review: { limit: false },
    },
    actions: {
        enabled: true,
        allowAllActions: true,
        forkPullRequestWorkflows: true,
        requireApprovalForForks: false,
    },
    skillmate: {
        codeReview: true,
        autoReview: false,
        cloudAgent: false,
        internetAccess: false,
        mcpServers: true,
    },
    advancedSecurity: {
        dependencyGraph: false,
        dependabot: true,
        secretScanning: true,
    },
    emailNotifications: 'participating',
    collaborators: MOCK_COLLABORATORS,
    webhooks: MOCK_WEBHOOKS,
    secrets: {
        actions: [],
        agents: [],
        codespaces: [],
        dependabot: [],
    },
};

function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge(base, patch) {
    if (!patch) return base;
    const next = { ...base };
    for (const key of Object.keys(patch)) {
        if (isPlainObject(patch[key]) && isPlainObject(base[key])) {
            next[key] = deepMerge(base[key], patch[key]);
        } else {
            next[key] = patch[key];
        }
    }
    return next;
}

export function getRepoSettings(repo) {
    return deepMerge(DEFAULT_REPO_SETTINGS, repo?.settings ?? {});
}

export function buildDefaultAnalytics(repo) {
    const seed = (repo?.commits?.length ?? 0) * 4 + (repo?.stars ?? 0);
    return {
        views: seed + 24,
        clones: Math.max(seed, 8),
        viewHistory: buildMetricHistory(seed + 24),
        cloneHistory: buildMetricHistory(Math.max(seed, 8)),
        forksList: [],
    };
}

function buildMetricHistory(total) {
    const days = 14;
    const base = Math.max(Math.floor(total / days), 0);
    return Array.from({ length: days }, (_, index) => {
        const date = new Date('2026-09-16');
        date.setDate(date.getDate() + index);
        const spike = index >= days - 2 ? Math.ceil(base * 1.4) : base;
        return {
            date: date.toISOString().slice(0, 10),
            total: spike,
            unique: Math.max(spike - 2, 0),
        };
    });
}

export function mergeRepoAnalytics(current, patch) {
    return deepMerge(buildDefaultAnalytics(), deepMerge(current ?? {}, patch ?? {}));
}

import { CURRENT_USER, LABSKILL_CONTRIBUTIONS } from './mockData';
import { getLanguageColor } from '../utils/repoFiles';

const DEFAULT_ISSUES = [
    {
        id: 1,
        number: 1,
        title: 'Add README with setup instructions',
        state: 'open',
        author: CURRENT_USER.username,
        authorName: CURRENT_USER.name,
        labels: [{ name: 'documentation', color: '#0075ca' }],
        comments: 2,
        createdAt: '3 days ago',
    },
    {
        id: 2,
        number: 2,
        title: 'Fix responsive layout on screens < 768px',
        state: 'open',
        author: CURRENT_USER.username,
        authorName: CURRENT_USER.name,
        labels: [{ name: 'bug', color: '#d73a4a' }, { name: 'ui', color: '#a2eeef' }],
        comments: 5,
        createdAt: '1 week ago',
    },
    {
        id: 3,
        number: 3,
        title: 'Set up ESLint and Prettier',
        state: 'closed',
        author: CURRENT_USER.username,
        authorName: CURRENT_USER.name,
        labels: [{ name: 'enhancement', color: '#a2eeef' }],
        comments: 1,
        createdAt: '2 weeks ago',
    },
];

const REPO_ISSUES = {
    'syreks-ai-frontend': [
        ...DEFAULT_ISSUES,
        {
            id: 4,
            number: 4,
            title: 'Add streaming AI responses',
            state: 'open',
            author: CURRENT_USER.username,
            authorName: CURRENT_USER.name,
            labels: [{ name: 'feature', color: '#0e8a16' }],
            comments: 8,
            createdAt: '5 hours ago',
        },
    ],
    'tinkoff-landing': [
        {
            id: 1,
            number: 1,
            title: 'Pixel-perfect hero section',
            state: 'closed',
            author: CURRENT_USER.username,
            authorName: CURRENT_USER.name,
            labels: [{ name: 'design', color: '#d876e3' }],
            comments: 4,
            createdAt: '1 month ago',
        },
    ],
};

const DEFAULT_PRS = [
    {
        id: 1,
        number: 1,
        title: 'feat: initial project setup',
        state: 'merged',
        author: CURRENT_USER.username,
        authorName: CURRENT_USER.name,
        branch: 'main',
        base: 'main',
        comments: 0,
        createdAt: '2 weeks ago',
    },
    {
        id: 2,
        number: 2,
        title: 'fix: mobile navigation overlap',
        state: 'open',
        author: CURRENT_USER.username,
        authorName: CURRENT_USER.name,
        branch: 'fix/mobile-nav',
        base: 'main',
        comments: 3,
        createdAt: '2 days ago',
    },
];

const REPO_PRS = {
    'syreks-ai-frontend': [
        ...DEFAULT_PRS,
        {
            id: 3,
            number: 3,
            title: 'feat: chat UI components',
            state: 'open',
            author: CURRENT_USER.username,
            authorName: CURRENT_USER.name,
            branch: 'feature/chat-ui',
            base: 'main',
            comments: 6,
            createdAt: '1 день назад',
        },
    ],
};

const DEFAULT_WORKFLOWS = [
    {
        id: 'ci',
        name: 'CI',
        file: 'ci.yml',
        badge: 'passing',
        runs: [
            {
                id: 1,
                event: 'push',
                branch: 'main',
                message: 'Initial commit',
                author: CURRENT_USER.name,
                time: '2 days ago',
                status: 'success',
                duration: '1m 24s',
            },
        ],
    },
];

const REPO_WORKFLOWS = {
    'syreks-ai-frontend': [
        {
            id: 'ci',
            name: 'CI',
            file: 'ci.yml',
            badge: 'passing',
            runs: [
                {
                    id: 1,
                    event: 'push',
                    branch: 'main',
                    message: 'Инициализация проекта, настройка vite, подключение React',
                    author: CURRENT_USER.name,
                    time: '2 days ago',
                    status: 'success',
                    duration: '2m 08s',
                },
                {
                    id: 2,
                    event: 'pull_request',
                    branch: 'feature/chat-ui',
                    message: 'feat: chat UI components',
                    author: CURRENT_USER.name,
                    time: '1 day ago',
                    status: 'success',
                    duration: '1m 52s',
                },
            ],
        },
        {
            id: 'deploy',
            name: 'Deploy',
            file: 'deploy.yml',
            badge: 'passing',
            runs: [
                {
                    id: 3,
                    event: 'push',
                    branch: 'main',
                    message: 'Инициализация проекта, настройка vite, подключение React',
                    author: CURRENT_USER.name,
                    time: '2 days ago',
                    status: 'success',
                    duration: '3m 41s',
                },
            ],
        },
    ],
};

const DEFAULT_PROJECTS = [
    {
        id: 1,
        name: 'Backlog',
        description: 'Задачи на ближайший спринт',
        columns: 3,
        cards: 5,
        updated: '3 дня назад',
    },
];

const REPO_PROJECTS = {
    'syreks-ai-frontend': [
        {
            id: 1,
            name: 'MVP Roadmap',
            description: 'Первый релиз SyreksAI Frontend',
            columns: 4,
            cards: 12,
            updated: '1 день назад',
        },
        {
            id: 2,
            name: 'Bug Tracker',
            description: 'Баги и регрессии',
            columns: 3,
            cards: 4,
            updated: '5 дней назад',
        },
    ],
};

export function getRepoIssues(repoName) {
    return REPO_ISSUES[repoName] ?? [];
}

export function getRepoPullRequests(repoName) {
    return REPO_PRS[repoName] ?? [];
}

export function getRepoWorkflows(repoName) {
    return REPO_WORKFLOWS[repoName] ?? [];
}

export function getRepoProjects(repoName) {
    return REPO_PROJECTS[repoName] ?? [];
}

export function getRepoSecurity(repo) {
    const hasPackageJson = repo.files?.some(f => f.name === 'package.json');
    return {
        dependabot: {
            enabled: hasPackageJson,
            alerts: hasPackageJson ? 0 : 0,
        },
        codeScanning: {
            enabled: false,
            alerts: 0,
        },
        secretScanning: {
            enabled: true,
            alerts: 0,
        },
    };
}

const FILE_EXT_LANGUAGES = {
    js: 'JavaScript',
    jsx: 'JavaScript',
    mjs: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    htm: 'HTML',
    py: 'Python',
    md: 'Markdown',
    json: 'JSON',
    rs: 'Rust',
    go: 'Go',
    java: 'Java',
    rb: 'Ruby',
    php: 'PHP',
    cpp: 'C++',
    c: 'C',
    sh: 'Shell',
    kt: 'Kotlin',
    swift: 'Swift',
    dart: 'Dart',
    vue: 'Vue',
};

export function getRepoInsights(repo) {
    const files = repo.files ?? [];
    const langCounts = {};
    for (const file of files) {
        if (file.type !== 'file') continue;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const lang = FILE_EXT_LANGUAGES[ext];
        if (lang) langCounts[lang] = (langCounts[lang] || 0) + 1;
    }
    const languages = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, color: getLanguageColor(name) }));

    return {
        commits: repo.commits?.length ?? 1,
        contributors: 1,
        languages: languages.length
            ? languages
            : [{ name: repo.language || 'Other', count: 1, color: getLanguageColor(repo.language) }],
        contributions: LABSKILL_CONTRIBUTIONS,
        traffic: {
            views: 128,
            unique: 42,
            clones: 7,
        },
    };
}

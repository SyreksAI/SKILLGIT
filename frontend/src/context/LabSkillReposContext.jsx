import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    CURRENT_USER,
    LABSKILL_REPOS,
    LABSKILL_EXPLORE_REPOS,
    LABSKILL_STARRED,
} from '../data/mockData';
import { repoUpdatedAt } from '../utils/labskillUtils';
import {
    createDefaultFiles,
    createSampleFiles,
    detectLanguageFromFiles,
    LANGUAGE_COLORS,
    mergeUploadedFiles,
    normalizeAndAnalyze,
} from '../utils/repoFiles';
import { buildCommitChanges, buildUploadCommitChanges } from '../utils/commitUtils';
import {
    buildDefaultAnalytics,
    deepMerge,
    getRepoSettings,
} from '../data/repoSettingsModel';

const STORAGE_KEY = 'skillgit-labskill-repos';

const LabSkillReposContext = createContext(null);

function createSampleCommitHistory(repo, files) {
    const author = CURRENT_USER.name;
    const byPath = Object.fromEntries(files.map(file => [file.path, file]));

    const histories = {
        'syreks-ai-frontend': [
            {
                id: 'c4',
                sha: 'a91f3c2',
                message: 'feat: add Vite config and entry point',
                author,
                date: '1 day ago',
                changes: buildCommitChanges([
                    byPath['vite.config.js'],
                    byPath['src/main.jsx'],
                ].filter(Boolean)),
            },
            {
                id: 'c3',
                sha: 'b72e4d1',
                message: 'feat: scaffold React application',
                author,
                date: '1 week ago',
                changes: buildCommitChanges([
                    byPath['src/App.jsx'],
                    byPath['package.json'],
                ].filter(Boolean)),
            },
            {
                id: 'c2',
                sha: 'c63d5e0',
                message: 'docs: add project README',
                author,
                date: '2 weeks ago',
                changes: buildCommitChanges([byPath['README.md']].filter(Boolean)),
            },
            {
                id: 'c1',
                sha: '8f3a2b1',
                message: 'Initial commit',
                author,
                date: '3 weeks ago',
                changes: buildCommitChanges(files),
            },
        ],
        'tinkoff-landing': [
            {
                id: 'c3',
                sha: 'f4a8b21',
                message: 'style: add main stylesheet',
                author,
                date: '2 days ago',
                changes: buildCommitChanges([byPath['styles/main.css']].filter(Boolean)),
            },
            {
                id: 'c2',
                sha: 'e391a10',
                message: 'feat: build landing page markup',
                author,
                date: '1 week ago',
                changes: buildCommitChanges([byPath['index.html']].filter(Boolean)),
            },
            {
                id: 'c1',
                sha: 'd280900',
                message: 'Initial commit',
                author,
                date: '2 weeks ago',
                changes: buildCommitChanges(files),
            },
        ],
        'vk-mobile-ui': [
            {
                id: 'c3',
                sha: '7c2b891',
                message: 'feat: add design tokens',
                author,
                date: '5 days ago',
                changes: buildCommitChanges([byPath['src/theme/tokens.ts']].filter(Boolean), 'added'),
            },
            {
                id: 'c2',
                sha: '6b1a780',
                message: 'feat: create App shell component',
                author,
                date: '2 weeks ago',
                changes: buildCommitChanges([byPath['src/components/App.tsx']].filter(Boolean)),
            },
            {
                id: 'c1',
                sha: '5a0976f',
                message: 'Initial commit',
                author,
                date: '3 weeks ago',
                changes: buildCommitChanges(files),
            },
        ],
    };

    return histories[repo.name] ?? null;
}

function enrichCommits(repo, files) {
    if (repo.commits?.length) {
        return repo.commits.map(commit => ({
            ...commit,
            changes: commit.changes?.length
                ? commit.changes
                : buildCommitChanges(files.slice(0, 6)),
        }));
    }

    const sampleHistory = createSampleCommitHistory(repo, files);
    if (sampleHistory) return sampleHistory;

    return [{
        id: 'c1',
        sha: '8f3a2b1',
        message: 'Initial commit',
        author: CURRENT_USER.name,
        date: repo.updated || 'recently',
        changes: buildCommitChanges(files.slice(0, 8)),
    }];
}

const CATALOG_REPOS = [...LABSKILL_EXPLORE_REPOS, ...LABSKILL_STARRED].reduce((map, item) => {
    map.set(`${item.owner}/${item.name}`, item);
    return map;
}, new Map());

function buildCatalogStub(catalogItem) {
    return enrichRepo({
        ...catalogItem,
        visibility: catalogItem.visibility || 'public',
        forks: catalogItem.forks ?? 0,
        pinned: false,
        topics: catalogItem.topics || [],
        readOnly: true,
    });
}

function enrichRepo(repo) {
    const files = repo.files?.length ? repo.files : createSampleFiles(repo);
    const language = repo.language || detectLanguageFromFiles(files);

    return {
        ...repo,
        owner: repo.owner || CURRENT_USER.username,
        defaultBranch: repo.defaultBranch || 'main',
        branches: repo.branches || ['main'],
        files,
        language,
        languageColor: repo.languageColor || LANGUAGE_COLORS[language] || '#6e7781',
        commits: enrichCommits(repo, files),
        updatedAt: repoUpdatedAt(repo),
        settings: getRepoSettings(repo),
        analytics: repo.analytics
            ? deepMerge(buildDefaultAnalytics(repo), repo.analytics)
            : buildDefaultAnalytics(repo),
    };
}

function loadRepos() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(enrichRepo);
            }
        }
    } catch {
        /* ignore */
    }
    return LABSKILL_REPOS.map(enrichRepo);
}

function saveRepos(repos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

export function LabSkillReposProvider({ children }) {
    const [repos, setReposState] = useState(loadRepos);

    const setRepos = useCallback((updater) => {
        setReposState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            saveRepos(next);
            return next;
        });
    }, []);

    const getRepo = useCallback((owner, name) => {
        const found = repos.find(r => r.owner === owner && r.name === name);
        if (found) return found;

        const catalogItem = CATALOG_REPOS.get(`${owner}/${name}`);
        return catalogItem ? buildCatalogStub(catalogItem) : null;
    }, [repos]);

    const createRepo = useCallback((payload) => {
        const rawFiles = payload.files?.length
            ? payload.files
            : (payload.withReadme ? createDefaultFiles({ name: payload.name, description: payload.description }) : []);
        const { files } = normalizeAndAnalyze(rawFiles);

        const language = payload.language || detectLanguageFromFiles(files);
        const newRepo = enrichRepo({
            id: Date.now(),
            owner: CURRENT_USER.username,
            name: payload.name,
            description: payload.description || '',
            language,
            languageColor: payload.languageColor || LANGUAGE_COLORS[language] || '#6e7781',
            stars: 0,
            forks: 0,
            updated: 'just now',
            updatedAt: Date.now(),
            visibility: payload.visibility || 'public',
            pinned: false,
            topics: payload.topics || [],
            taskId: null,
            source: 'pet',
            verified: false,
            files,
                commits: [{
                    id: `c-${Date.now()}`,
                    sha: Math.random().toString(16).slice(2, 9),
                    message: payload.initialCommitMessage || 'Initial commit',
                    author: CURRENT_USER.name,
                    date: 'just now',
                    changes: buildCommitChanges(files),
                }],
        });

        setRepos(prev => [newRepo, ...prev]);
        return newRepo;
    }, [setRepos]);

    const updateRepo = useCallback((owner, name, patch) => {
        setRepos(prev => prev.map(repo => {
            if (repo.owner !== owner || repo.name !== name) return repo;
            const merged = { ...repo, ...patch };
            if (patch.settings) {
                merged.settings = deepMerge(repo.settings ?? getRepoSettings(repo), patch.settings);
            }
            if (patch.analytics) {
                merged.analytics = deepMerge(repo.analytics ?? buildDefaultAnalytics(repo), patch.analytics);
            }
            return enrichRepo(merged);
        }));
    }, [setRepos]);

    const updateRepoSettings = useCallback((owner, name, settingsPatch) => {
        updateRepo(owner, name, {
            settings: settingsPatch,
        });
    }, [updateRepo]);

    const recordRepoView = useCallback((owner, name) => {
        setRepos(prev => prev.map(repo => {
            if (repo.owner !== owner || repo.name !== name) return repo;
            const analytics = repo.analytics ?? buildDefaultAnalytics(repo);
            const history = [...(analytics.viewHistory ?? [])];
            const today = new Date().toISOString().slice(0, 10);
            const last = history[history.length - 1];
            if (last?.date === today) {
                history[history.length - 1] = {
                    ...last,
                    total: last.total + 1,
                    unique: last.unique + (Math.random() > 0.7 ? 1 : 0),
                };
            } else {
                history.push({ date: today, total: 1, unique: 1 });
                if (history.length > 14) history.shift();
            }
            return enrichRepo({
                ...repo,
                analytics: {
                    ...analytics,
                    views: (analytics.views ?? 0) + 1,
                    viewHistory: history,
                },
            });
        }));
    }, [setRepos]);

    const recordRepoClone = useCallback((owner, name) => {
        setRepos(prev => prev.map(repo => {
            if (repo.owner !== owner || repo.name !== name) return repo;
            const analytics = repo.analytics ?? buildDefaultAnalytics(repo);
            const history = [...(analytics.cloneHistory ?? [])];
            const today = new Date().toISOString().slice(0, 10);
            const last = history[history.length - 1];
            if (last?.date === today) {
                history[history.length - 1] = {
                    ...last,
                    total: last.total + 1,
                    unique: last.unique + (Math.random() > 0.6 ? 1 : 0),
                };
            } else {
                history.push({ date: today, total: 1, unique: 1 });
                if (history.length > 14) history.shift();
            }
            return enrichRepo({
                ...repo,
                analytics: {
                    ...analytics,
                    clones: (analytics.clones ?? 0) + 1,
                    cloneHistory: history,
                },
            });
        }));
    }, [setRepos]);

    const deleteRepo = useCallback((owner, name) => {
        setRepos(prev => prev.filter(repo => !(repo.owner === owner && repo.name === name)));
    }, [setRepos]);

    const addFilesToRepo = useCallback((owner, name, newFiles) => {
        setRepos(prev => prev.map(repo => {
            if (repo.owner !== owner || repo.name !== name) return repo;
            const { files } = normalizeAndAnalyze(mergeUploadedFiles(repo.files || [], newFiles));
            const language = detectLanguageFromFiles(files) || repo.language;
            return {
                ...repo,
                files,
                language,
                languageColor: LANGUAGE_COLORS[language] || repo.languageColor,
                updated: 'just now',
                updatedAt: Date.now(),
                commits: [
                    {
                        id: `c-${Date.now()}`,
                        sha: Math.random().toString(16).slice(2, 9),
                        message: `Add ${newFiles.length} file(s)`,
                        author: CURRENT_USER.name,
                        date: 'just now',
                        changes: buildUploadCommitChanges(repo.files, newFiles),
                    },
                    ...(repo.commits || []),
                ],
            };
        }));
    }, [setRepos]);

    const value = useMemo(() => ({
        repos,
        setRepos,
        getRepo,
        createRepo,
        updateRepo,
        updateRepoSettings,
        recordRepoView,
        recordRepoClone,
        deleteRepo,
        addFilesToRepo,
    }), [repos, setRepos, getRepo, createRepo, updateRepo, updateRepoSettings, recordRepoView, recordRepoClone, deleteRepo, addFilesToRepo]);

    return (
        <LabSkillReposContext.Provider value={value}>
            {children}
        </LabSkillReposContext.Provider>
    );
}

export function useLabSkillRepos() {
    const context = useContext(LabSkillReposContext);
    if (!context) {
        throw new Error('useLabSkillRepos must be used within LabSkillReposProvider');
    }
    return context;
}

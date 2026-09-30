export function slugifyRepoName(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
}

export function formatFileSize(bytes) {
    if (bytes == null || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileStats(content, size) {
    const text = content ?? '';
    const lines = text.split('\n');
    const lineCount = lines.length;
    const loc = lines.filter(line => line.trim()).length;
    const bytes = size ?? new TextEncoder().encode(text).length;

    return { lineCount, loc, bytes };
}

export function getFileExtension(name) {
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.slice(idx + 1).toLowerCase() : '';
}

const TEXT_EXTENSIONS = new Set([
    'md', 'txt', 'json', 'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'css', 'scss', 'sass',
    'html', 'htm', 'py', 'yml', 'yaml', 'xml', 'svg', 'sql', 'sh', 'bash', 'zsh',
    'vue', 'svelte', 'go', 'rs', 'java', 'kt', 'rb', 'php', 'toml', 'ini', 'cfg',
    'env', 'lock', 'gitignore', 'dockerignore', 'editorconfig', 'prettierrc',
]);

const TEXT_BASENAMES = new Set([
    'dockerfile', 'makefile', 'license', 'readme', 'gitignore', 'editorconfig',
    'procfile', 'gemfile', 'rakefile', 'vagrantfile',
]);

export function isTextFile(name) {
    const base = name.split('/').pop().toLowerCase();
    const ext = getFileExtension(name);

    if (TEXT_BASENAMES.has(base) || base.startsWith('readme')) return true;
    if (TEXT_EXTENSIONS.has(ext)) return true;
    if (base.startsWith('.env')) return true;
    return !ext;
}

const IGNORED_PATH_SEGMENTS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage',
    '__pycache__', '.pytest_cache', '.mypy_cache', '.venv', 'venv', 'env',
    '.idea', '.vscode', 'target', '.gradle', '.turbo', '.parcel-cache',
    '.cache', '.sass-cache', 'out', '.output', '.vercel', '.netlify',
]);

const ALLOWED_HIDDEN_SEGMENTS = new Set(['.skillgit', '.github', '.gitlab', '.husky', '.vscode']);

export function shouldIgnoreUploadPath(path) {
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    if (!parts.length) return true;

    for (let i = 0; i < parts.length - 1; i += 1) {
        const part = parts[i];
        if (IGNORED_PATH_SEGMENTS.has(part)) return true;
        if (part.startsWith('.') && !ALLOWED_HIDDEN_SEGMENTS.has(part)) return true;
    }

    const fileName = parts[parts.length - 1];
    if (IGNORED_PATH_SEGMENTS.has(fileName)) return true;

    return false;
}

export function getCommonRootFolder(files) {
    if (!files.length) return null;

    const paths = files.map(file => file.path.replace(/\\/g, '/'));
    const roots = new Set(paths.map(path => path.split('/')[0]));
    if (roots.size !== 1) return null;

    const root = [...roots][0];
    const isFolderUpload = paths.some(path => path.includes('/'));
    if (!isFolderUpload) return null;

    return root;
}

export function stripCommonRootPrefix(files) {
    const root = getCommonRootFolder(files);
    if (!root) return { files, rootFolderName: null };

    const stripped = files
        .map(file => {
            const path = file.path.replace(/\\/g, '/');
            if (!path.startsWith(`${root}/`)) return file;
            const nextPath = path.slice(root.length + 1);
            return {
                ...file,
                path: nextPath,
                name: nextPath.split('/').pop(),
            };
        })
        .filter(file => file.path);

    return { files: stripped, rootFolderName: root };
}

export function normalizeUploadedProject(files) {
    const filtered = files.filter(file => !shouldIgnoreUploadPath(file.path));
    return stripCommonRootPrefix(filtered);
}

function findFileByBasename(files, basename) {
    const target = basename.toLowerCase();
    return files.find(file =>
        file.type === 'file' &&
        file.name.toLowerCase() === target &&
        file.content
    );
}

function parseJsonContent(content) {
    try {
        return JSON.parse(content);
    } catch {
        return null;
    }
}

export function detectProjectStack(files) {
    const paths = new Set(files.map(file => file.path.replace(/\\/g, '/')));
    const has = basename => [...paths].some(path =>
        path === basename || path.endsWith(`/${basename}`)
    );

    const stack = [];
    const pkgFile = findFileByBasename(files, 'package.json');
    const pkg = pkgFile ? parseJsonContent(pkgFile.content) : null;

    if (pkg || has('package.json')) {
        stack.push('Node.js');
        const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
        if (deps?.react || deps?.['react-dom']) stack.push('React');
        if (deps?.vue) stack.push('Vue');
        if (deps?.vite) stack.push('Vite');
        if (deps?.next) stack.push('Next.js');
        if (deps?.['@angular/core']) stack.push('Angular');
        if (deps?.express || deps?.fastify) stack.push('Backend');
    }

    if (has('requirements.txt') || has('pyproject.toml') || has('Pipfile')) {
        stack.push('Python');
    }
    if (has('Cargo.toml')) stack.push('Rust');
    if (has('go.mod')) stack.push('Go');
    if (has('pom.xml') || has('build.gradle') || has('build.gradle.kts')) {
        stack.push('Java');
    }
    if (has('composer.json')) stack.push('PHP');
    if (has('Gemfile')) stack.push('Ruby');
    if (has('index.html') && !stack.includes('Node.js')) stack.push('Static');

    return [...new Set(stack)];
}

export function analyzeProject(files, rootFolderName = null) {
    const language = detectLanguageFromFiles(files);
    const stack = detectProjectStack(files);

    let suggestedName = '';
    let suggestedDescription = '';

    const pkgFile = findFileByBasename(files, 'package.json');
    const pkg = pkgFile ? parseJsonContent(pkgFile.content) : null;
    if (pkg?.name) {
        suggestedName = String(pkg.name);
        if (suggestedName.includes('/')) {
            suggestedName = suggestedName.split('/').pop();
        }
    }
    if (pkg?.description) suggestedDescription = String(pkg.description);

    if (!suggestedName && rootFolderName) {
        suggestedName = rootFolderName;
    }

    const readme = getReadmeContent(files);
    if (!suggestedDescription && readme) {
        const line = readme
            .split('\n')
            .map(item => item.trim())
            .find(item => item && !item.startsWith('#') && !item.startsWith('['));
        if (line) suggestedDescription = line.replace(/[#*_`]/g, '').slice(0, 160);
    }

    return {
        suggestedName: slugifyRepoName(suggestedName),
        suggestedDescription: suggestedDescription.trim(),
        language: language || '',
        stack,
        fileCount: files.length,
        rootFolderName,
    };
}

export function normalizeAndAnalyze(files) {
    const beforeCount = files.length;
    const { files: normalized, rootFolderName } = normalizeUploadedProject(files);
    const analysis = analyzeProject(normalized, rootFolderName);
    return {
        files: normalized,
        analysis,
        ignoredCount: Math.max(0, beforeCount - normalized.length),
    };
}

async function readAllDirectoryEntries(reader) {
    const entries = [];
    let batch = await new Promise(resolve => reader.readEntries(resolve));
    while (batch.length > 0) {
        entries.push(...batch);
        batch = await new Promise(resolve => reader.readEntries(resolve));
    }
    return entries;
}

async function traverseFileEntry(entry, pathPrefix = '') {
    if (entry.isFile) {
        const file = await new Promise((resolve, reject) => {
            entry.file(resolve, reject);
        });
        const relativePath = pathPrefix ? `${pathPrefix}/${file.name}` : file.name;
        Object.defineProperty(file, 'webkitRelativePath', {
            value: relativePath,
            configurable: true,
        });
        return [file];
    }

    if (entry.isDirectory) {
        const dirPath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
        const reader = entry.createReader();
        const children = await readAllDirectoryEntries(reader);
        const nested = await Promise.all(
            children.map(child => traverseFileEntry(child, dirPath))
        );
        return nested.flat();
    }

    return [];
}

export async function collectFilesFromDataTransfer(dataTransfer) {
    const items = dataTransfer?.items;
    if (!items?.length) return Array.from(dataTransfer.files || []);

    const entries = [];
    for (let i = 0; i < items.length; i += 1) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) entries.push(entry);
    }

    if (!entries.length) return Array.from(dataTransfer.files || []);

    const nested = await Promise.all(entries.map(entry => traverseFileEntry(entry)));
    return nested.flat();
}

export async function processProjectUpload(fileList) {
    const raw = await readUploadFileList(Array.from(fileList || []));
    return normalizeAndAnalyze(raw);
}

export async function readUploadFile(file) {
    const path = (file.webkitRelativePath || file.name).replace(/\\/g, '/');
    const name = path.split('/').pop();
    const entry = {
        path,
        name,
        type: 'file',
        size: file.size,
    };

    if (isTextFile(name) && file.size < 512000) {
        try {
            entry.content = await file.text();
        } catch {
            entry.content = null;
            entry.isBinary = true;
        }
    } else {
        entry.content = null;
        entry.isBinary = true;
    }

    return entry;
}

export async function readUploadFileList(fileList) {
    const files = Array.from(fileList);
    return Promise.all(files.map(readUploadFile));
}

export function mergeUploadedFiles(existing, incoming) {
    const map = new Map(existing.map(file => [file.path, file]));
    for (const file of incoming) {
        map.set(file.path, file);
    }
    return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

export function buildFileTree(files, currentPath = '') {
    const normalizedPath = currentPath.replace(/^\/+|\/+$/g, '');
    const entries = new Map();

    for (const file of files) {
        if (file.type !== 'file') continue;

        let relative = file.path;
        if (normalizedPath) {
            if (!relative.startsWith(`${normalizedPath}/`)) continue;
            relative = relative.slice(normalizedPath.length + 1);
        }

        if (!relative) continue;

        const parts = relative.split('/');
        const first = parts[0];

        if (parts.length === 1) {
            entries.set(first, {
                ...file,
                name: first,
                displayPath: normalizedPath ? `${normalizedPath}/${first}` : first,
            });
        } else if (!entries.has(first)) {
            const dirPath = normalizedPath ? `${normalizedPath}/${first}` : first;
            entries.set(first, {
                name: first,
                type: 'dir',
                path: dirPath,
                displayPath: dirPath,
            });
        }
    }

    return Array.from(entries.values()).sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name, 'ru');
    });
}

export function getReadmeContent(files) {
    const readme = files.find(file =>
        file.type === 'file' &&
        file.name.toLowerCase() === 'readme.md' &&
        file.content
    );
    return readme?.content ?? null;
}

export function detectLanguageFromFiles(files) {
    const pkgFile = files.find(file =>
        file.type === 'file' &&
        file.name.toLowerCase() === 'package.json' &&
        file.content
    );
    if (pkgFile) {
        const pkg = parseJsonContent(pkgFile.content);
        if (pkg?.language && typeof pkg.language === 'string') {
            const normalized = pkg.language.charAt(0).toUpperCase() + pkg.language.slice(1);
            if (LANGUAGE_COLORS[normalized]) return normalized;
        }
    }

    const counts = {};
    for (const file of files) {
        if (file.type !== 'file') continue;
        const ext = getFileExtension(file.name);
        const map = {
            js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
            ts: 'TypeScript', tsx: 'TypeScript',
            py: 'Python', html: 'HTML', htm: 'HTML', css: 'CSS', scss: 'SCSS',
            vue: 'Vue', md: 'Markdown', json: 'JSON',
        };
        const lang = map[ext];
        if (lang) counts[lang] = (counts[lang] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export const LANGUAGE_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#663399',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Markdown: '#083fa1',
    JSON: '#6e7781',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    Shell: '#89e051',
    Kotlin: '#A97BFF',
    Swift: '#F05138',
    Dart: '#00B4AB',
    Other: '#6e7781',
};

export function getLanguageColor(languageName) {
    if (!languageName) return LANGUAGE_COLORS.Other;
    return LANGUAGE_COLORS[languageName] ?? LANGUAGE_COLORS.Other;
}

export function createDefaultFiles(repo) {
    const readme = `# ${repo.name}\n\n${repo.description || 'Новый репозиторий LabSkill.'}\n\n## О проекте\n\nРепозиторий создан на SKILLGIT LabSkill.\n`;
    return [
        {
            path: 'README.md',
            name: 'README.md',
            type: 'file',
            size: readme.length,
            content: readme,
        },
        {
            path: '.gitignore',
            name: '.gitignore',
            type: 'file',
            size: 32,
            content: 'node_modules/\n.env\n.DS_Store\n',
        },
    ];
}

export function createSampleFiles(repo) {
    const samples = {
        'syreks-ai-frontend': [
            { path: 'README.md', content: '# SyreksAI Frontend\n\nReact + Vite MVP для AI-ассистента студентов.\n' },
            { path: 'package.json', content: '{\n  "name": "syreks-ai-frontend",\n  "private": true,\n  "version": "0.1.0"\n}\n' },
            { path: 'src/App.jsx', content: "import React from 'react';\n\nexport default function App() {\n  return <h1>SyreksAI</h1>;\n}\n" },
            { path: 'src/main.jsx', content: "import React from 'react';\nimport App from './App';\n" },
            { path: 'vite.config.js', content: "export default { plugins: [] };\n" },
        ],
        'tinkoff-landing': [
            { path: 'README.md', content: '# Tinkoff Landing\n\nАдаптивный лендинг для Tinkoff.\n' },
            { path: 'index.html', content: '<!DOCTYPE html><html><body><h1>Tinkoff</h1></body></html>\n' },
            { path: 'styles/main.css', content: 'body { margin: 0; font-family: sans-serif; }\n' },
        ],
        'vk-mobile-ui': [
            { path: 'README.md', content: '# VK Mobile UI\n\nUI/UX концепт мобильного приложения.\n' },
            { path: 'src/components/App.tsx', content: 'export function App() { return null; }\n' },
            { path: 'src/theme/tokens.ts', content: 'export const colors = { primary: "#0077ff" };\n' },
        ],
    };

    const preset = samples[repo.name];
    if (preset) {
        return preset.map(item => ({
            path: item.path,
            name: item.path.split('/').pop(),
            type: 'file',
            size: item.content.length,
            content: item.content,
        }));
    }

    return createDefaultFiles(repo);
}

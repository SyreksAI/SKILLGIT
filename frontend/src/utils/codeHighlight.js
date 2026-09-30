import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import dart from 'highlight.js/lib/languages/dart';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import ini from 'highlight.js/lib/languages/ini';
import makefile from 'highlight.js/lib/languages/makefile';
import plaintext from 'highlight.js/lib/languages/plaintext';

const REGISTERED = new Set();

function registerLanguage(name, module) {
    if (REGISTERED.has(name)) return;
    hljs.registerLanguage(name, module);
    REGISTERED.add(name);
}

[
    ['javascript', javascript],
    ['typescript', typescript],
    ['python', python],
    ['css', css],
    ['scss', scss],
    ['xml', xml],
    ['json', json],
    ['markdown', markdown],
    ['bash', bash],
    ['yaml', yaml],
    ['sql', sql],
    ['java', java],
    ['go', go],
    ['rust', rust],
    ['php', php],
    ['ruby', ruby],
    ['csharp', csharp],
    ['cpp', cpp],
    ['c', c],
    ['swift', swift],
    ['kotlin', kotlin],
    ['dart', dart],
    ['dockerfile', dockerfile],
    ['ini', ini],
    ['makefile', makefile],
    ['plaintext', plaintext],
].forEach(([name, mod]) => registerLanguage(name, mod));

const EXT_MAP = {
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'xml',
    htm: 'xml',
    svg: 'xml',
    vue: 'xml',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'css',
    json: 'json',
    md: 'markdown',
    mdx: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    sql: 'sql',
    java: 'java',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    cs: 'csharp',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    c: 'c',
    h: 'c',
    hpp: 'cpp',
    swift: 'swift',
    kt: 'kotlin',
    kts: 'kotlin',
    dart: 'dart',
    toml: 'ini',
    ini: 'ini',
    env: 'bash',
    gitignore: 'plaintext',
    dockerignore: 'plaintext',
    lock: 'json',
};

const BASENAME_MAP = {
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    'docker-compose.yml': 'yaml',
    'docker-compose.yaml': 'yaml',
    '.gitignore': 'plaintext',
    '.env': 'bash',
    '.env.example': 'bash',
};

export function getHighlightLanguage(filename = '') {
    const base = filename.split('/').pop()?.toLowerCase() ?? '';
    if (BASENAME_MAP[base]) return BASENAME_MAP[base];
    if (base.startsWith('dockerfile')) return 'dockerfile';

    const ext = base.includes('.') ? base.split('.').pop() : '';
    return EXT_MAP[ext] || 'plaintext';
}

export function getLanguageLabel(language) {
    const labels = {
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        python: 'Python',
        css: 'CSS',
        scss: 'SCSS',
        xml: 'HTML',
        json: 'JSON',
        markdown: 'Markdown',
        bash: 'Shell',
        yaml: 'YAML',
        sql: 'SQL',
        java: 'Java',
        go: 'Go',
        rust: 'Rust',
        php: 'PHP',
        ruby: 'Ruby',
        csharp: 'C#',
        cpp: 'C++',
        c: 'C',
        swift: 'Swift',
        kotlin: 'Kotlin',
        dart: 'Dart',
        dockerfile: 'Dockerfile',
        ini: 'INI',
        makefile: 'Makefile',
        plaintext: 'Plain text',
    };
    return labels[language] || language;
}

export function highlightCode(content, language) {
    const source = content ?? '';
    const lang = hljs.getLanguage(language) ? language : 'plaintext';

    try {
        const { value } = hljs.highlight(source, { language: lang, ignoreIllegals: true });
        return value.split('\n');
    } catch {
        return source
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .split('\n');
    }
}

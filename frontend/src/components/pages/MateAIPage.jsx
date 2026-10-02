import { Link } from 'react-router-dom';
import { MateAILogo } from '../ui/MateAILogo';
import {
    CodeIcon,
    DownloadIcon,
    LaptopIcon,
    TerminalIcon,
} from './icons';

const PLATFORMS = [
    { id: 'windows', label: 'Windows', sub: 'x64 · .exe', primary: true },
    { id: 'macos', label: 'macOS', sub: 'Apple Silicon & Intel' },
    { id: 'linux', label: 'Linux', sub: '.deb / .AppImage' },
];

const FEATURES = [
    {
        icon: CodeIcon,
        title: 'AI в редакторе',
        desc: 'Автодополнение, рефакторинг и объяснение кода прямо в файле.',
    },
    {
        icon: TerminalIcon,
        title: 'Терминал и git',
        desc: 'Команды, тесты и деплой без переключения между приложениями.',
    },
    {
        icon: LaptopIcon,
        title: 'Локальные проекты',
        desc: 'Код остаётся на вашем компьютере. Работайте офлайн, когда нужно.',
    },
];

const NAV = [
    { label: 'Скачать', href: '#download' },
    { label: 'Возможности', href: '#features' },
    { label: 'Документация', to: '/help' },
];

export function MateAIPage() {
    function handleDownload(platform) {
        window.alert(`Скоро: загрузка MateAI IDE для ${platform}`);
    }

    return (
        <div className="mateai-app">
            <header className="mateai-app-topbar">
                <div className="mateai-app-topbar-start">
                    <Link to="/mateai" className="mateai-app-logo">
                        <MateAILogo className="mateai-app-logo-img" />
                    </Link>
                    <nav className="mateai-app-nav" aria-label="MateAI">
                        {NAV.map(item => (
                            item.to ? (
                                <Link key={item.label} to={item.to}>{item.label}</Link>
                            ) : (
                                <a key={item.label} href={item.href}>{item.label}</a>
                            )
                        ))}
                    </nav>
                </div>
                <div className="mateai-app-topbar-end">
                    <Link to="/skillmate" className="mateai-app-skillmate-link">
                        SkillMate Web
                    </Link>
                    <button
                        type="button"
                        className="mateai-app-download-cta"
                        onClick={() => handleDownload('Windows')}
                    >
                        <DownloadIcon />
                        Скачать
                    </button>
                </div>
            </header>

            <main className="mateai-app-main">
                <section className="mateai-hero" id="download">
                    <div className="mateai-hero-copy">
                        <MateAILogo variant="icon" className="mateai-hero-logo" />
                        <span className="mateai-hero-badge">Desktop IDE</span>
                        <h1>IDE для разработки с AI</h1>
                        <p>
                            MateAI — отдельное приложение, как Cursor: редактор, агенты SkillMate
                            и LabSkill в одном окне на вашем компьютере.
                        </p>

                        <div className="mateai-downloads">
                            {PLATFORMS.map(platform => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    className={`mateai-download-btn${platform.primary ? ' primary' : ''}`}
                                    onClick={() => handleDownload(platform.label)}
                                >
                                    <DownloadIcon />
                                    <span>
                                        <strong>{platform.label}</strong>
                                        <small>{platform.sub}</small>
                                    </span>
                                </button>
                            ))}
                        </div>

                        <p className="mateai-version">v1.2.0 · Universal build</p>
                    </div>

                    <div className="mateai-preview" aria-label="Предпросмотр IDE">
                        <div className="mateai-preview-window">
                            <div className="mateai-preview-titlebar">
                                <span />
                                <span />
                                <span />
                                <strong>MateAI IDE — skillgit-project</strong>
                            </div>
                            <div className="mateai-preview-body">
                                <aside className="mateai-preview-sidebar">
                                    <span>src</span>
                                    <span>components</span>
                                    <span>App.jsx</span>
                                    <span>main.jsx</span>
                                </aside>
                                <div className="mateai-preview-editor">
                                    <code>
                                        <span className="mateai-code-muted">// MateAI suggestion</span>
                                        {'\n'}
                                        <span className="mateai-code-keyword">export</span>
                                        {' function '}
                                        <span className="mateai-code-fn">createProject</span>
                                        {'() {\n  '}
                                        <span className="mateai-code-keyword">return</span>
                                        {' agent.run('}
                                        <span className="mateai-code-str">'build MVP'</span>
                                        {');\n}'}
                                    </code>
                                </div>
                                <aside className="mateai-preview-chat">
                                    <strong>MateAI</strong>
                                    <p>Добавить обработку ошибок в createProject?</p>
                                    <button type="button">Применить</button>
                                </aside>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mateai-features" id="features">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <article key={title} className="mateai-feature-card">
                            <span className="mateai-feature-icon">
                                <Icon />
                            </span>
                            <h2>{title}</h2>
                            <p>{desc}</p>
                        </article>
                    ))}
                </section>
            </main>

            <footer className="mateai-app-footer">
                <span>© MateAI · часть экосистемы SKILLGIT</span>
                <Link to="/skillmate">Вернуться в SkillMate</Link>
            </footer>
        </div>
    );
}

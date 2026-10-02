import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillMateSectionView } from '../skillmate/SkillMateSections';
import { MateAILogo } from '../ui/MateAILogo';
import { SkillMateAttachModal } from '../ui/SkillMateAttachModal';
import { SkillMateCreateProjectModal } from '../ui/SkillMateCreateProjectModal';
import { SkillMateWorkModal } from '../ui/SkillMateWorkModal';
import {
    AgentsIcon,
    ArrowUpRightIcon,
    BookIcon,
    ChevronUpIcon,
    ClockIcon,
    CodeIcon,
    DiscussIcon,
    EditSquareIcon,
    FolderIcon,
    ImageIcon,
    PanelLeftToggleIcon,
    PlugIcon,
    PlusIcon,
    SearchIcon,
    SendIcon,
    StarIcon,
} from './icons';

const MODELS = [
    { id: 'auto', label: 'Auto', desc: 'Автовыбор лучшей модели' },
    { id: 'gpt-4o', label: 'GPT-4o', desc: 'Универсальная модель' },
    { id: 'claude', label: 'Claude Sonnet', desc: 'Длинный контекст' },
    { id: 'skillmate', label: 'Mate Pro', desc: 'Код и LabSkill' },
];

const SIDEBAR_NAV = [
    { id: 'new', label: 'Новый чат', icon: EditSquareIcon, action: 'new' },
    { id: 'images', label: 'Изображения', icon: ImageIcon },
    { id: 'library', label: 'Библиотека', icon: BookIcon },
    { id: 'scheduled', label: 'Запланированное', icon: ClockIcon },
    { id: 'plugins', label: 'Плагины', icon: PlugIcon },
    { id: 'projects', label: 'Проекты', icon: FolderIcon, quickAdd: true },
    { id: 'mateai', label: 'MateAI', logo: true, external: '/mateai' },
];

const SUGGESTIONS = [
    { id: 'image', label: 'Создать изображение или стикер', icon: ImageIcon, draft: 'Создай изображение для...' },
    { id: 'code', label: 'Напиши или отредактируй код', icon: CodeIcon, draft: 'Напиши или отредактируй...' },
    { id: 'search', label: 'Искать в интернете', icon: SearchIcon, draft: 'Найди информацию о...' },
];

const CHATS = [
    { id: 1, title: '3D приставка для монстров', preview: 'Создам 3D-модель приставки...', updatedAt: '2 мин', unread: 0, pinned: true },
    { id: 2, title: 'Telegram-bot /stats', preview: 'Создам handlers/stats.py...', updatedAt: '1 ч', unread: 1, pinned: true },
    { id: 3, title: 'Дорисовать детали макета', preview: 'Добавлю детали в макет...', updatedAt: 'вчера', unread: 0, pinned: false },
    { id: 4, title: 'Портреты целевой аудитории…', preview: 'Опишу сегменты аудитории...', updatedAt: 'вчера', unread: 0, pinned: false },
    { id: 5, title: 'Выполнение задания файла', preview: 'Разберу задание по шагам...', updatedAt: '2 дня', unread: 0, pinned: false },
    { id: 6, title: 'Выполнение задания в DOCX', preview: 'Подготовлю документ...', updatedAt: '3 дня', unread: 0, pinned: false },
    { id: 7, title: 'Определить текст ИИ', preview: 'Проверю текст на признаки...', updatedAt: '4 дня', unread: 0, pinned: false },
];

const CHAT_MESSAGES = {
    1: [
        { id: 1, role: 'agent', text: 'Привет! Помогу с 3D-приставкой. Опишите стиль и размеры.', time: '10:02' },
    ],
    2: [
        { id: 1, role: 'agent', text: 'Привет! Вижу репозиторий telegram-bot. Чем помочь?', time: '10:02' },
        { id: 2, role: 'user', text: 'Добавь команду /stats для админов', time: '10:03' },
        { id: 3, role: 'agent', text: 'Создам handlers/stats.py и подключу в main.py. Также добавлю тесты.', time: '10:03' },
    ],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
};

const AI_REPLIES = [
    'Понял, работаю над этим. Могу показать diff или объяснить шаги.',
    'Проверил код — вот что предлагаю изменить. Готов продолжить.',
    'Задача принята. Уточните детали, если нужен другой подход.',
    'Подготовил план изменений. Могу сразу перейти к реализации.',
];

function Message({ msg }) {
    const isUser = msg.role === 'user';

    return (
        <div className={`skillmate-msg${isUser ? ' skillmate-msg--user' : ''}`}>
            {!isUser && (
                <span className="skillmate-msg-avatar">
                    <AgentsIcon />
                </span>
            )}
            <div className="skillmate-msg-body">
                <p>{msg.text}</p>
            </div>
        </div>
    );
}

function Composer({
    draft,
    setDraft,
    attachOpen,
    setAttachOpen,
    modelOpen,
    setModelOpen,
    modelId,
    setModelId,
    typing,
    onSend,
    textareaRef,
    modelRef,
    placeholder = 'Спросите что угодно',
}) {
    const [isMultiline, setIsMultiline] = useState(false);
    const modelLabel = MODELS.find(item => item.id === modelId)?.label ?? 'Auto';

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = 'auto';
        const height = Math.min(el.scrollHeight, 160);
        el.style.height = `${height}px`;

        const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
        const hasNewline = draft.includes('\n');
        const isWrapped = height > lineHeight + 2;
        setIsMultiline(hasNewline || isWrapped);
    }, [draft, textareaRef]);

    return (
        <form className="skillmate-composer" onSubmit={onSend}>
            <div className={`skillmate-composer-inner${isMultiline ? ' skillmate-composer-inner--multiline' : ''}`}>
                <button
                    type="button"
                    className={`skillmate-composer-plus${attachOpen ? ' open' : ''}`}
                    aria-label="Добавить"
                    aria-expanded={attachOpen}
                    onClick={() => {
                        setModelOpen(false);
                        setAttachOpen(v => !v);
                    }}
                >
                    <PlusIcon />
                </button>

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend(e);
                        }
                    }}
                    placeholder={placeholder}
                />

                <div className="skillmate-composer-actions">
                    <div className="skillmate-model" ref={modelRef}>
                        <button
                            type="button"
                            className={`skillmate-model-btn${modelOpen ? ' open' : ''}`}
                            onClick={() => setModelOpen(v => !v)}
                            aria-expanded={modelOpen}
                        >
                            <AgentsIcon />
                            {modelLabel}
                            <ChevronUpIcon />
                        </button>
                        {modelOpen && (
                            <div className="skillmate-model-menu" role="menu">
                                {MODELS.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="menuitem"
                                        className={item.id === modelId ? 'active' : ''}
                                        onClick={() => {
                                            setModelId(item.id);
                                            setModelOpen(false);
                                        }}
                                    >
                                        <strong>{item.label}</strong>
                                        <span>{item.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="skillmate-send"
                        aria-label="Отправить"
                        disabled={!draft.trim() || typing}
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </form>
    );
}

function ChatSidebar({
    filteredChats,
    activeId,
    activeSection,
    chatSearch,
    setChatSearch,
    searchOpen,
    setSearchOpen,
    onSelect,
    onNavigate,
    onOpenExternal,
    onQuickAddProject,
    onNewChat,
    onCollapse,
}) {
    const pinned = filteredChats.filter(c => c.pinned);
    const recent = filteredChats.filter(c => !c.pinned);
    const searchRef = useRef(null);

    useEffect(() => {
        if (searchOpen) {
            searchRef.current?.focus();
        }
    }, [searchOpen]);

    return (
        <aside className="skillmate-sidebar">
            <div className="skillmate-sidebar-head">
                <strong>SkillMate</strong>
                <div className="skillmate-sidebar-head-actions">
                    <button
                        type="button"
                        className={`skillmate-sidebar-icon-btn${searchOpen ? ' active' : ''}`}
                        aria-label="Поиск"
                        aria-pressed={searchOpen}
                        onClick={() => setSearchOpen(v => !v)}
                    >
                        <SearchIcon />
                    </button>
                    <button
                        type="button"
                        className="skillmate-sidebar-icon-btn"
                        aria-label="Свернуть боковую панель"
                        onClick={onCollapse}
                    >
                        <PanelLeftToggleIcon open />
                    </button>
                </div>
            </div>

            <nav className="skillmate-sidebar-nav" aria-label="Навигация">
                {SIDEBAR_NAV.map(({ id, label, icon: Icon, logo, action, quickAdd, external }) => {
                    const isActive = action === 'new'
                        ? activeSection === 'chat'
                        : activeSection === id;

                    if (quickAdd) {
                        return (
                            <div
                                key={id}
                                className={`skillmate-sidebar-nav-row${isActive ? ' active' : ''}`}
                            >
                                <button
                                    type="button"
                                    className="skillmate-sidebar-nav-item"
                                    onClick={() => onNavigate(id)}
                                >
                                    <span className="skillmate-sidebar-nav-icon">
                                        <Icon />
                                    </span>
                                    {label}
                                </button>
                                <button
                                    type="button"
                                    className="skillmate-sidebar-nav-plus"
                                    aria-label="Новый проект"
                                    onClick={e => {
                                        e.stopPropagation();
                                        onQuickAddProject?.();
                                    }}
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={id}
                            type="button"
                            className={`skillmate-sidebar-nav-item${isActive ? ' active' : ''}${external ? ' skillmate-sidebar-nav-item--external' : ''}`}
                            onClick={() => {
                                if (action === 'new') {
                                    onNewChat();
                                    return;
                                }
                                if (external) {
                                    onOpenExternal(external);
                                    return;
                                }
                                onNavigate(id);
                            }}
                        >
                            <span className="skillmate-sidebar-nav-icon">
                                {logo ? (
                                    <MateAILogo className="skillmate-sidebar-mateai-logo" />
                                ) : (
                                    <Icon />
                                )}
                            </span>
                            <span className="skillmate-sidebar-nav-label">{label}</span>
                            {external && (
                                <span className="skillmate-sidebar-nav-external" aria-hidden="true">
                                    <ArrowUpRightIcon />
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {searchOpen && (
                <div className="skillmate-sidebar-search">
                    <SearchIcon />
                    <input
                        ref={searchRef}
                        type="search"
                        placeholder="Поиск чатов..."
                        value={chatSearch}
                        onChange={e => setChatSearch(e.target.value)}
                    />
                </div>
            )}

            <div className="skillmate-sidebar-list">
                {filteredChats.length === 0 ? (
                    <p className="skillmate-sidebar-empty">Чаты не найдены</p>
                ) : (
                    <>
                        {pinned.length > 0 && (
                            <section>
                                <h3>Закреплённые</h3>
                                {pinned.map(chat => (
                                    <button
                                        key={chat.id}
                                        type="button"
                                        className={`skillmate-sidebar-item skillmate-sidebar-item--pinned${activeSection === 'chat' && activeId === chat.id ? ' active' : ''}`}
                                        onClick={() => onSelect(chat.id)}
                                    >
                                        <span className="skillmate-sidebar-item-icon">
                                            <DiscussIcon />
                                        </span>
                                        <span className="skillmate-sidebar-item-label">{chat.title}</span>
                                    </button>
                                ))}
                            </section>
                        )}
                        {recent.length > 0 && (
                            <section>
                                <h3>Недавнее</h3>
                                {recent.map(chat => (
                                    <button
                                        key={chat.id}
                                        type="button"
                                        className={`skillmate-sidebar-item${activeSection === 'chat' && activeId === chat.id ? ' active' : ''}`}
                                        onClick={() => onSelect(chat.id)}
                                    >
                                        {chat.title}
                                    </button>
                                ))}
                            </section>
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}

export function SkillMatePage() {
    const navigate = useNavigate();
    const [chats, setChats] = useState(CHATS);
    const [activeId, setActiveId] = useState(2);
    const [sidebarOpen, setSidebarOpen] = useState(() => (
        typeof window !== 'undefined' ? window.matchMedia('(min-width: 900px)').matches : true
    ));
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('chat');
    const [chatSearch, setChatSearch] = useState('');
    const [messagesByChat, setMessagesByChat] = useState(CHAT_MESSAGES);
    const [draft, setDraft] = useState('');
    const [modelId, setModelId] = useState('auto');
    const [modelOpen, setModelOpen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [attachOpen, setAttachOpen] = useState(false);
    const [workModalOpen, setWorkModalOpen] = useState(false);
    const [projectModalOpen, setProjectModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const bottomRef = useRef(null);
    const modelRef = useRef(null);
    const textareaRef = useRef(null);

    const messages = messagesByChat[activeId] ?? [];

    const filteredChats = useMemo(() => {
        const q = chatSearch.trim().toLowerCase();
        if (!q) return chats;
        return chats.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.preview.toLowerCase().includes(q)
        );
    }, [chats, chatSearch]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeId, typing]);

    useEffect(() => {
        function onDocClick(e) {
            if (modelRef.current && !modelRef.current.contains(e.target)) {
                setModelOpen(false);
            }
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    function selectChat(id) {
        setActiveSection('chat');
        setActiveId(id);
        if (window.matchMedia('(max-width: 899px)').matches) {
            setSidebarOpen(false);
        }
    }

    function navigateSection(sectionId) {
        setActiveSection(sectionId);
        setWorkModalOpen(false);
        if (window.matchMedia('(max-width: 899px)').matches) {
            setSidebarOpen(false);
        }
    }

    function handleNewChat() {
        setActiveSection('chat');
        const id = Date.now();
        const chat = {
            id,
            title: 'Новый чат',
            preview: 'Без сообщений',
            updatedAt: 'сейчас',
            unread: 0,
            pinned: false,
        };
        setChats(prev => [chat, ...prev]);
        setMessagesByChat(prev => ({ ...prev, [id]: [] }));
        setActiveId(id);
        setChatSearch('');
        if (window.matchMedia('(max-width: 899px)').matches) {
            setSidebarOpen(false);
        }
    }

    function handleCreateProject({ name, memoryId }) {
        const words = name.trim().split(/\s+/);
        const label = words.length >= 2
            ? `${words[0][0]}${words[1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
        const accents = ['#0066e0', '#7c3aed', '#059669', '#ea580c', '#db2777', '#0d9488'];
        const id = Date.now();

        setProjects(prev => [
            {
                id,
                name: name.trim(),
                chats: 0,
                files: 0,
                updated: 'сейчас',
                accent: accents[Math.floor(Math.random() * accents.length)],
                label,
                memoryId,
                owner: 'me',
            },
            ...prev,
        ]);
        setActiveSection('projects');
    }

    function handleAttachSelect(actionId) {
        const hints = {
            file: 'Прикрепите файл к сообщению…',
            photo: 'Добавьте изображение к запросу…',
            repo: 'Подключите репозиторий LabSkill: ',
            code: 'Вставьте код или путь к файлу…',
            docs: 'Расскажи про возможности SkillMate…',
        };
        setDraft(hints[actionId] ?? '');
        textareaRef.current?.focus();
    }

    function updateChatMeta(text) {
        const preview = text.length > 48 ? `${text.slice(0, 48)}…` : text;
        setChats(prev => prev.map(chat => (
            chat.id === activeId
                ? {
                    ...chat,
                    preview,
                    updatedAt: 'сейчас',
                    title: chat.title === 'Новый чат' ? preview : chat.title,
                    unread: 0,
                }
                : chat
        )));
    }

    function handleSend(e) {
        e.preventDefault();
        if (!draft.trim() || typing) return;

        const text = draft.trim();
        const userMsg = {
            id: Date.now(),
            role: 'user',
            text,
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessagesByChat(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] ?? []), userMsg],
        }));
        updateChatMeta(text);
        setDraft('');
        setTyping(true);

        setTimeout(() => {
            setTyping(false);
            const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
            const aiMsg = {
                id: Date.now() + 1,
                role: 'agent',
                text: reply,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessagesByChat(prev => ({
                ...prev,
                [activeId]: [...(prev[activeId] ?? []), aiMsg],
            }));
            setChats(prev => prev.map(chat => (
                chat.id === activeId ? { ...chat, preview: reply.slice(0, 48), updatedAt: 'сейчас' } : chat
            )));
        }, 1100);
    }

    const hasThread = messages.length > 0;
    const composerProps = {
        draft,
        setDraft,
        attachOpen,
        setAttachOpen,
        modelOpen,
        setModelOpen,
        modelId,
        setModelId,
        typing,
        onSend: handleSend,
        textareaRef,
        modelRef,
    };

    return (
        <div className={`skillmate-shell${sidebarOpen ? ' skillmate-shell--sidebar-open' : ' skillmate-shell--sidebar-collapsed'}${activeSection === 'chat' && !hasThread ? ' skillmate-shell--idle' : ''}${activeSection !== 'chat' ? ' skillmate-shell--section' : ''}`}>
            {sidebarOpen && (
                <button
                    type="button"
                    className="skillmate-sidebar-backdrop"
                    aria-label="Закрыть боковую панель"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <ChatSidebar
                filteredChats={filteredChats}
                activeId={activeId}
                activeSection={activeSection}
                chatSearch={chatSearch}
                setChatSearch={setChatSearch}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
                onSelect={selectChat}
                onNavigate={navigateSection}
                onOpenExternal={path => navigate(path)}
                onQuickAddProject={() => setProjectModalOpen(true)}
                onNewChat={handleNewChat}
                onCollapse={() => setSidebarOpen(false)}
            />

            <div className="skillmate-main">
                <header className={`skillmate-topbar${activeSection === 'chat' ? '' : ' skillmate-topbar--section'}`}>
                    {!sidebarOpen && (
                        <button
                            type="button"
                            className="skillmate-topbar-toggle"
                            aria-label="Открыть боковую панель"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <PanelLeftToggleIcon />
                        </button>
                    )}

                    {activeSection === 'chat' && (
                        <div className="skillmate-mode-switch" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={!workModalOpen}
                                className={!workModalOpen ? 'active' : ''}
                                onClick={() => setWorkModalOpen(false)}
                            >
                                Чат
                            </button>
                            <button
                                type="button"
                                aria-expanded={workModalOpen}
                                aria-haspopup="dialog"
                                className={`skillmate-mode-switch-work${workModalOpen ? ' active' : ''}`}
                                onClick={() => setWorkModalOpen(true)}
                            >
                                <StarIcon />
                                Работа
                            </button>
                        </div>
                    )}

                    {activeSection === 'chat' && (
                        <button type="button" className="skillmate-connect">
                            <StarIcon />
                            Подключить
                        </button>
                    )}
                </header>

                <div className="skillmate-body">
                    {activeSection !== 'chat' ? (
                        <SkillMateSectionView
                            sectionId={activeSection}
                            projects={projects}
                            onOpenCreateProject={() => setProjectModalOpen(true)}
                        />
                    ) : (
                        <>
                            <div className="skillmate-canvas">
                                {!hasThread ? (
                                    <div className="skillmate-idle">
                                        <h1 className="skillmate-idle-title">Начинайте, когда будете готовы.</h1>
                                        <div className="skillmate-idle-input-block">
                                            <Composer {...composerProps} placeholder="Спросите что угодно" />
                                            <ul className="skillmate-suggestions">
                                                {SUGGESTIONS.map(({ id, label, icon: Icon, draft: hint }) => (
                                                    <li key={id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDraft(hint);
                                                                textareaRef.current?.focus();
                                                            }}
                                                        >
                                                            <Icon />
                                                            {label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="skillmate-thread">
                                        {messages.map(msg => (
                                            <Message key={msg.id} msg={msg} />
                                        ))}
                                        {typing && (
                                            <div className="skillmate-typing">
                                                <span className="skillmate-msg-avatar">
                                                    <AgentsIcon />
                                                </span>
                                                <div className="skillmate-typing-dots">
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={bottomRef} />
                                    </div>
                                )}
                            </div>

                            {hasThread && (
                                <div className="skillmate-composer-wrap">
                                    <Composer {...composerProps} placeholder="Спросите что угодно" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <SkillMateAttachModal
                isOpen={attachOpen}
                onClose={() => setAttachOpen(false)}
                onSelect={handleAttachSelect}
            />

            <SkillMateWorkModal
                isOpen={workModalOpen}
                onClose={() => setWorkModalOpen(false)}
            />

            <SkillMateCreateProjectModal
                isOpen={projectModalOpen}
                onClose={() => setProjectModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
}

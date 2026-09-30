import React, { useRef, useEffect, useState, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { CONVERSATIONS, MESSAGES } from '../../data/mockData';

import { useSearchParam } from '../../hooks/useSearchParam';

import { HeaderActions } from '../ui/HeaderActions';

import {

    SearchIcon,

    PlusIcon,

    SendIcon,

    PhoneIcon,

    MoreIcon,

    PaperclipIcon,

    ImageIcon,

    CodeIcon,

    SmileIcon,

    DownloadIcon,

    CheckReadIcon,

} from './icons';



const FILTERS = [

    { id: 'all', label: 'Все' },

    { id: 'team', label: 'Команды' },

    { id: 'personal', label: 'Личные' },

];



function filterCount(id) {

    if (id === 'all') return CONVERSATIONS.length;

    return CONVERSATIONS.filter(c => c.type === id).length;

}



function MessageBubble({ msg, isGroup }) {

    const isMine = msg.from === 'me';



    return (

        <div className={`chat-msg${isMine ? ' chat-msg--mine' : ''}`}>

            {!isMine && (

                <span

                    className="chat-msg-avatar"

                    style={{ background: msg.senderColor ?? '#94a3b8' }}

                >

                    {(msg.sender ?? '?').charAt(0)}

                </span>

            )}

            <div className="chat-msg-content">

                {!isMine && isGroup && msg.sender && (

                    <span className="chat-msg-sender">{msg.sender}</span>

                )}

                <div className="chat-msg-bubble">

                    {msg.attachment && (

                        <div className="chat-attachment">

                            <div className="chat-attachment-icon">ZIP</div>

                            <div className="chat-attachment-info">

                                <strong>{msg.attachment.name}</strong>

                                <span>{msg.attachment.size}</span>

                            </div>

                            <button type="button" className="chat-attachment-dl" aria-label="Скачать">

                                <DownloadIcon />

                            </button>

                        </div>

                    )}

                    {msg.text && <p>{msg.text}</p>}

                    <div className="chat-msg-meta">

                        <time>{msg.time}</time>

                        {isMine && msg.read && (

                            <span className="chat-msg-read"><CheckReadIcon /></span>

                        )}

                    </div>

                </div>

                {msg.reactions?.length > 0 && (

                    <div className="chat-reactions">

                        {msg.reactions.map(r => (

                            <span key={r.emoji} className="chat-reaction">

                                {r.emoji} {r.count}

                            </span>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );

}



const FILTER_IDS = FILTERS.map(f => f.id);



function resolveChatId(raw) {

    if (!raw) return null;

    const match = CONVERSATIONS.find(c => String(c.id) === raw);

    return match?.id ?? null;

}



export function ChatPage() {

    const [searchParams, setSearchParams] = useSearchParams();

    const [activeFilter, setActiveFilter] = useSearchParam('filter', 'all', FILTER_IDS);

    const urlSearch = searchParams.get('search') ?? '';

    const [activeChat, setActiveChatState] = useState(

        () => resolveChatId(searchParams.get('chat')) ?? CONVERSATIONS[0]?.id ?? null

    );

    const [search, setSearch] = useState(urlSearch);

    const [input, setInput] = useState('');

    const [messages, setMessages] = useState(MESSAGES);

    const [headAction, setHeadAction] = useState(null);

    const [threadSearch, setThreadSearch] = useState('');

    const [chatSettings, setChatSettings] = useState({});

    const [leftChats, setLeftChats] = useState([]);

    const [chatToast, setChatToast] = useState(null);

    const bottomRef = useRef(null);

    const headActionsRef = useRef(null);

    const toastTimerRef = useRef(null);



    useEffect(() => {

        const chatId = resolveChatId(searchParams.get('chat'));

        if (chatId != null) setActiveChatState(chatId);

    }, [searchParams]);



    useEffect(() => {

        setSearch(urlSearch);

    }, [urlSearch]);



    function setActiveChat(id) {

        setActiveChatState(id);

        setSearchParams(prev => {

            const params = new URLSearchParams(prev);

            if (id != null) params.set('chat', String(id));

            else params.delete('chat');

            return params;

        }, { replace: true });

    }



    function handleSearchChange(value) {

        setSearch(value);

        setSearchParams(prev => {

            const params = new URLSearchParams(prev);

            if (value.trim()) params.set('search', value);

            else params.delete('search');

            return params;

        }, { replace: true });

    }



    const conversation = CONVERSATIONS.find(c => c.id === activeChat);

    const chatMessages = messages[activeChat] ?? [];

    const visibleMessages = useMemo(() => {
        const q = threadSearch.trim().toLowerCase();
        if (!q) return chatMessages;
        return chatMessages.filter(msg =>
            msg.text?.toLowerCase().includes(q) ||
            msg.sender?.toLowerCase().includes(q)
        );
    }, [chatMessages, threadSearch]);

    const isGroup = conversation?.type === 'team';

    const isPinned = chatId => Boolean(chatSettings[chatId]?.pinned);

    const isMuted = chatId => Boolean(chatSettings[chatId]?.muted);

    function showToast(message) {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setChatToast(message);
        toastTimerRef.current = setTimeout(() => setChatToast(null), 2500);
    }

    function updateChatSetting(chatId, key, value) {
        setChatSettings(prev => ({
            ...prev,
            [chatId]: { ...prev[chatId], [key]: value },
        }));
    }

    function handlePinChat() {
        if (!activeChat) return;
        const next = !isPinned(activeChat);
        updateChatSetting(activeChat, 'pinned', next);
        setHeadAction(null);
        showToast(next ? 'Чат закреплён' : 'Чат откреплён');
    }

    function handleMuteChat() {
        if (!activeChat) return;
        const next = !isMuted(activeChat);
        updateChatSetting(activeChat, 'muted', next);
        setHeadAction(null);
        showToast(next ? 'Уведомления отключены' : 'Уведомления включены');
    }

    function handleClearHistory() {
        if (!activeChat || !conversation) return;
        const confirmed = window.confirm(
            `Очистить все сообщения в «${conversation.name}»? Это действие нельзя отменить.`,
        );
        if (!confirmed) return;

        setMessages(prev => ({ ...prev, [activeChat]: [] }));
        setHeadAction(null);
        setThreadSearch('');
        showToast('История сообщений очищена');
    }

    function handleLeaveChat() {
        if (!activeChat || !conversation) return;
        const confirmed = window.confirm(
            `Покинуть «${conversation.name}»? Вы больше не будете получать сообщения из этого чата.`,
        );
        if (!confirmed) return;

        setLeftChats(prev => {
            const updated = prev.includes(activeChat) ? prev : [...prev, activeChat];
            const nextChat = CONVERSATIONS.find(
                c => c.id !== activeChat && !updated.includes(c.id),
            );
            setActiveChat(nextChat?.id ?? null);
            return updated;
        });
        setHeadAction(null);
        showToast(`Вы покинули «${conversation.name}»`);
    }

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }, []);

    function toggleHeadAction(action) {
        setHeadAction(prev => {
            const next = prev === action ? null : action;
            if (action !== 'search' && prev === 'search') setThreadSearch('');
            return next;
        });
    }

    useEffect(() => {
        setHeadAction(null);
        setThreadSearch('');
    }, [activeChat]);

    useEffect(() => {
        if (headAction !== 'menu') return undefined;

        function handleClickOutside(e) {
            if (headActionsRef.current && !headActionsRef.current.contains(e.target)) {
                setHeadAction(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [headAction]);



    const filteredChats = useMemo(() => {

        let result = CONVERSATIONS.filter(c => !leftChats.includes(c.id));

        if (activeFilter !== 'all') {

            result = result.filter(c => c.type === activeFilter);

        }

        if (search.trim()) {

            const q = search.toLowerCase();

            result = result.filter(c =>

                c.name.toLowerCase().includes(q) ||

                c.lastMessage.toLowerCase().includes(q)

            );

        }

        return result.sort((a, b) => {
            const pinDiff = Number(isPinned(b.id)) - Number(isPinned(a.id));
            if (pinDiff !== 0) return pinDiff;
            return 0;
        });

    }, [activeFilter, search, leftChats, chatSettings]);



    useEffect(() => {

        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    }, [chatMessages, activeChat]);



    function handleSend(e) {

        e.preventDefault();

        if (!input.trim() || !activeChat) return;



        setMessages(prev => ({

            ...prev,

            [activeChat]: [...(prev[activeChat] ?? []), {

                id: Date.now(),

                from: 'me',

                text: input.trim(),

                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),

                read: true,

            }],

        }));

        setInput('');

    }



    return (

        <div className="chat-page">

            <header className="chat-topbar">

                <div className="home-header-search">

                    <SearchIcon />

                    <input

                        type="text"

                        placeholder="Поиск по чатам, людям, сообщениям..."

                        value={search}

                        onChange={e => handleSearchChange(e.target.value)}

                    />

                </div>

                <HeaderActions />

            </header>



            <div className="chat-body">

                <aside className="chat-list">

                    <div className="chat-list-head">

                        <h2>Чаты</h2>

                        <button type="button" className="chat-new-btn">

                            <PlusIcon />

                            Новый чат

                        </button>

                    </div>



                    <div className="chat-filters">

                        {FILTERS.map(({ id, label }) => (

                            <button

                                key={id}

                                type="button"

                                className={`chat-filter${activeFilter === id ? ' active' : ''}`}

                                onClick={() => setActiveFilter(id)}

                            >

                                {label}

                                <span>{filterCount(id)}</span>

                            </button>

                        ))}

                    </div>



                    <div className="chat-list-scroll">

                        {filteredChats.map(conv => (

                            <button

                                key={conv.id}

                                type="button"

                                className={`chat-list-item${activeChat === conv.id ? ' active' : ''}${conv.unread && !isMuted(conv.id) ? ' unread' : ''}${isPinned(conv.id) ? ' pinned' : ''}`}

                                onClick={() => setActiveChat(conv.id)}

                            >

                                <div className="chat-list-avatar" style={{ background: conv.avatarColor }}>

                                    {conv.avatar}

                                </div>

                                <div className="chat-list-body">

                                    <div className="chat-list-top">

                                        <strong>
                                            {isPinned(conv.id) && <span className="chat-list-pin" title="Закреплён">📌</span>}
                                            {conv.name}
                                        </strong>

                                        <time>{conv.time}</time>

                                    </div>

                                    <p>{isMuted(conv.id) ? '🔕 Уведомления отключены' : conv.lastMessage}</p>

                                </div>

                                {conv.unread > 0 && !isMuted(conv.id) && (

                                    <span className="chat-list-badge">{conv.unread}</span>

                                )}

                            </button>

                        ))}

                    </div>

                </aside>



                <div className="chat-main">

                    {conversation ? (

                        <>

                            <header className="chat-main-head">

                                <div className="chat-main-head-info">

                                    <div className="chat-list-avatar lg" style={{ background: conversation.avatarColor }}>

                                        {conversation.avatar}

                                    </div>

                                    <div>

                                        <strong>{conversation.name}</strong>

                                        <span>

                                            {[
                                                isPinned(activeChat) && 'Закреплён',
                                                isMuted(activeChat) && 'Без уведомлений',
                                                conversation.members
                                                    ? `${conversation.members} участников`
                                                    : conversation.taskTitle ?? 'Личный чат',
                                            ].filter(Boolean).join(' · ')}

                                        </span>

                                    </div>

                                </div>

                                <div className="chat-main-head-actions" ref={headActionsRef}>

                                    <button
                                        type="button"
                                        className={`icon-btn${headAction === 'call' ? ' active' : ''}`}
                                        aria-label="Звонок"
                                        aria-pressed={headAction === 'call'}
                                        onClick={() => toggleHeadAction('call')}
                                    >
                                        <PhoneIcon />
                                    </button>

                                    <button
                                        type="button"
                                        className={`icon-btn${headAction === 'search' ? ' active' : ''}`}
                                        aria-label="Поиск"
                                        aria-pressed={headAction === 'search'}
                                        onClick={() => toggleHeadAction('search')}
                                    >
                                        <SearchIcon />
                                    </button>

                                    <button
                                        type="button"
                                        className={`icon-btn${headAction === 'menu' ? ' active' : ''}`}
                                        aria-label="Меню"
                                        aria-pressed={headAction === 'menu'}
                                        onClick={() => toggleHeadAction('menu')}
                                    >
                                        <MoreIcon />
                                    </button>

                                    {headAction === 'menu' && (
                                        <div className="chat-head-menu" role="menu">
                                            <button
                                                type="button"
                                                className={`chat-head-menu-item${isPinned(activeChat) ? ' is-active' : ''}`}
                                                role="menuitem"
                                                onClick={handlePinChat}
                                            >
                                                {isPinned(activeChat) ? 'Открепить чат' : 'Закрепить чат'}
                                            </button>
                                            <button
                                                type="button"
                                                className={`chat-head-menu-item${isMuted(activeChat) ? ' is-active' : ''}`}
                                                role="menuitem"
                                                onClick={handleMuteChat}
                                            >
                                                {isMuted(activeChat) ? 'Включить уведомления' : 'Отключить уведомления'}
                                            </button>
                                            <button
                                                type="button"
                                                className="chat-head-menu-item"
                                                role="menuitem"
                                                onClick={handleClearHistory}
                                            >
                                                Очистить историю
                                            </button>
                                            {isGroup && (
                                                <button
                                                    type="button"
                                                    className="chat-head-menu-item chat-head-menu-item--danger"
                                                    role="menuitem"
                                                    onClick={handleLeaveChat}
                                                >
                                                    Покинуть чат
                                                </button>
                                            )}
                                        </div>
                                    )}

                                </div>

                            </header>

                            {headAction === 'call' && (
                                <div className="chat-head-panel">
                                    <div className="chat-head-call">
                                        <div>
                                            <strong>Голосовой звонок</strong>
                                            <span>Соединение с «{conversation.name}»…</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="chat-head-call-end"
                                            onClick={() => setHeadAction(null)}
                                        >
                                            Завершить
                                        </button>
                                    </div>
                                </div>
                            )}

                            {headAction === 'search' && (
                                <div className="chat-head-panel">
                                    <div className="chat-head-search">
                                        <SearchIcon />
                                        <input
                                            type="search"
                                            placeholder="Поиск в этом чате..."
                                            value={threadSearch}
                                            onChange={e => setThreadSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="chat-thread">

                                {visibleMessages.length === 0 && threadSearch.trim() ? (
                                    <div className="chat-empty">Сообщения не найдены</div>
                                ) : visibleMessages.map(msg => (

                                    <MessageBubble key={msg.id} msg={msg} isGroup={isGroup} />

                                ))}

                                {conversation.typing && (

                                    <div className="chat-typing">

                                        <span className="chat-typing-dots">...</span>

                                        {conversation.typing} печатает...

                                    </div>

                                )}

                                <div ref={bottomRef} />

                            </div>



                            <form className="chat-compose" onSubmit={handleSend}>

                                <div className="chat-compose-tools">

                                    <button type="button" className="chat-tool-btn" aria-label="Файл">

                                        <PaperclipIcon />

                                    </button>

                                    <button type="button" className="chat-tool-btn" aria-label="Изображение">

                                        <ImageIcon />

                                    </button>

                                    <button type="button" className="chat-tool-btn" aria-label="Код">

                                        <CodeIcon />

                                    </button>

                                </div>

                                <input

                                    type="text"

                                    placeholder="Напишите сообщение..."

                                    value={input}

                                    onChange={e => setInput(e.target.value)}

                                />

                                <button type="button" className="chat-tool-btn" aria-label="Эмодзи">

                                    <SmileIcon />

                                </button>

                                <button type="submit" className="chat-send-btn" aria-label="Отправить">

                                    <SendIcon />

                                </button>

                            </form>

                        </>

                    ) : (

                        <div className="chat-empty">Выберите чат</div>

                    )}

                </div>

            </div>

            {chatToast && (
                <div className="chat-toast" role="status">{chatToast}</div>
            )}

        </div>

    );

}



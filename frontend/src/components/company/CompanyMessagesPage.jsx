import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead } from '../admin/AdminShell';
import { SendIcon } from '../pages/icons';

export function CompanyMessagesPage() {
    const {
        messages,
        threads,
        messageTemplates,
        sendCompanyMessage,
        markThreadRead,
        togglePinThread,
    } = useCompanyAdmin();
    const [searchParams] = useSearchParams();
    const threadParam = Number(searchParams.get('thread'));
    const [activeId, setActiveId] = useState(threadParam || messages[0]?.id);
    const [draft, setDraft] = useState('');
    const bottomRef = useRef(null);

    const sortedMessages = useMemo(() =>
        [...messages].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [messages]);

    const active = messages.find(m => m.id === activeId);
    const thread = threads[activeId] ?? [];

    useEffect(() => {
        if (threadParam) setActiveId(threadParam);
    }, [threadParam]);

    useEffect(() => {
        if (activeId) markThreadRead(activeId);
    }, [activeId, markThreadRead]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread.length]);

    function handleSend(e) {
        e.preventDefault();
        if (!draft.trim() || !activeId) return;
        sendCompanyMessage(activeId, draft.trim());
        setDraft('');
    }

    function applyTemplate(text) {
        setDraft(text);
    }

    return (
        <div className="admin-page admin-page--chat">
            <AdminPanelHead title="Сообщения" subtitle="Шаблоны, закрепление и переписка с кандидатами" />

            <div className="admin-chat-layout">
                <aside className="admin-chat-list">
                    {sortedMessages.map(msg => (
                        <button
                            key={msg.id}
                            type="button"
                            className={`admin-chat-item${activeId === msg.id ? ' active' : ''}${msg.pinned ? ' admin-chat-item--pinned' : ''}`}
                            onClick={() => setActiveId(msg.id)}
                        >
                            <span className="admin-list-avatar">{msg.userName.charAt(0)}</span>
                            <div>
                                <strong>{msg.userName}{msg.pinned ? ' 📌' : ''}</strong>
                                <span>{msg.lastMessage}</span>
                            </div>
                            {msg.unread > 0 && <span className="admin-nav-badge">{msg.unread}</span>}
                        </button>
                    ))}
                </aside>

                <div className="admin-chat-main">
                    {active ? (
                        <>
                            <header className="admin-chat-head">
                                <div>
                                    <strong>{active.userName}</strong>
                                    <span>{active.taskTitle}</span>
                                </div>
                                <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost admin-btn--sm"
                                    onClick={() => togglePinThread(activeId)}
                                >
                                    {active.pinned ? 'Открепить' : 'Закрепить'}
                                </button>
                            </header>

                            <div className="crm-message-templates">
                                {messageTemplates.map(t => (
                                    <button key={t.id} type="button" className="crm-template-chip" onClick={() => applyTemplate(t.text)}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="admin-chat-messages">
                                {thread.map(msg => (
                                    <div key={msg.id} className={`admin-chat-bubble${msg.from === 'me' ? ' admin-chat-bubble--mine' : ''}`}>
                                        <p>{msg.text}</p>
                                        <time>{msg.time}</time>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                            <form className="admin-chat-compose" onSubmit={handleSend}>
                                <input
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                    placeholder="Написать сообщение..."
                                />
                                <button type="submit" className="admin-btn admin-btn--primary" aria-label="Отправить">
                                    <SendIcon />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="admin-empty">Выберите диалог</div>
                    )}
                </div>
            </div>
        </div>
    );
}

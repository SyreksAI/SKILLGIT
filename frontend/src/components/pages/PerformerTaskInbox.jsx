import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { HeaderActions } from '../ui/HeaderActions';
import { SendIcon } from './icons';

export function PerformerTaskInbox() {
    const { accessToken } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!accessToken) return undefined;
        let cancelled = false;
        const refresh = async () => {
            try {
                const items = await api.getConversations(accessToken);
                if (!cancelled) {
                    setConversations(items);
                    setActiveId(current => current ?? items[0]?.id ?? null);
                }
            } catch (err) {
                if (!cancelled) setError(err.message || 'Не удалось загрузить переписки');
            }
        };
        refresh();
        const timer = window.setInterval(refresh, 15000);
        return () => { cancelled = true; window.clearInterval(timer); };
    }, [accessToken]);

    useEffect(() => {
        if (!activeId || !accessToken) {
            setMessages([]);
            return undefined;
        }
        let cancelled = false;
        const refresh = () => api.getMessages(activeId, accessToken)
            .then(items => { if (!cancelled) setMessages(items); })
            .catch(err => { if (!cancelled) setError(err.message || 'Не удалось загрузить сообщения'); });
        refresh();
        const timer = window.setInterval(refresh, 5000);
        return () => { cancelled = true; window.clearInterval(timer); };
    }, [activeId, accessToken]);

    async function sendMessage(event) {
        event.preventDefault();
        if (!draft.trim() || !activeId || sending) return;
        setSending(true);
        setError('');
        try {
            const sent = await api.sendMessage(activeId, draft.trim(), accessToken);
            setMessages(prev => [...prev, sent]);
            setDraft('');
            setConversations(await api.getConversations(accessToken));
        } catch (err) {
            setError(err.message || 'Не удалось отправить сообщение');
        } finally {
            setSending(false);
        }
    }

    const active = conversations.find(item => item.id === activeId);

    return (
        <div className="chat-page">
            <header className="chat-topbar">
                <h1>Сообщения по заданиям</h1>
                <HeaderActions />
            </header>
            <div className="chat-body">
                <aside className="chat-list">
                    <div className="chat-list-head"><h2>Компании</h2></div>
                    <div className="chat-list-scroll">
                        {conversations.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                className={`chat-list-item${activeId === item.id ? ' active' : ''}${item.unread ? ' unread' : ''}`}
                                onClick={() => setActiveId(item.id)}
                            >
                                <span className="chat-list-avatar">{item.name?.charAt(0) ?? 'К'}</span>
                                <span className="chat-list-body">
                                    <strong>{item.name}</strong>
                                    <small>{item.taskTitle}</small>
                                    <p>{item.lastMessage}</p>
                                </span>
                                {item.unread > 0 && <span className="chat-list-badge">{item.unread}</span>}
                            </button>
                        ))}
                        {!conversations.length && <p className="chat-empty">Переписки появятся после отклика на задание.</p>}
                    </div>
                </aside>
                <section className="chat-main">
                    {active ? <>
                        <header className="chat-main-head">
                            <div className="chat-main-head-info">
                                <span className="chat-list-avatar">{active.name?.charAt(0) ?? 'К'}</span>
                                <div><strong>{active.name}</strong><span>{active.taskTitle}</span></div>
                            </div>
                        </header>
                        <div className="chat-thread">
                            {messages.map(message => (
                                <div key={message.id} className={`chat-msg${message.from === 'me' ? ' chat-msg--mine' : ''}`}>
                                    {message.from !== 'me' && <span className="chat-msg-avatar">{active.name?.charAt(0) ?? 'К'}</span>}
                                    <div className="chat-msg-content">
                                        <div className="chat-msg-bubble">
                                            <p>{message.text}</p>
                                            <div className="chat-msg-meta"><time>{message.time}</time></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form className="chat-compose" onSubmit={sendMessage}>
                            <input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Напишите сообщение..." />
                            <button type="submit" className="chat-send-btn" aria-label="Отправить" disabled={sending}>
                                <SendIcon />
                            </button>
                        </form>
                    </> : <div className="chat-empty">Выберите переписку</div>}
                    {error && <p className="auth-error" role="alert">{error}</p>}
                </section>
            </div>
        </div>
    );
}

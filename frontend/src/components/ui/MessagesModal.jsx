import React from 'react';
import { Link } from 'react-router-dom';
import { AppModal } from './AppModal';

export function MessagesModal({ isOpen, onClose, conversations }) {
    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Сообщения">
            {conversations.length === 0 ? (
                <p className="app-modal-empty">Нет новых сообщений</p>
            ) : (
                <ul className="modal-messages-list">
                    {conversations.map(chat => (
                        <li key={chat.id}>
                            <Link to={`/chat?chat=${chat.id}`} onClick={onClose} className="modal-message-item">
                                <span
                                    className="modal-message-avatar"
                                    style={{ background: chat.avatarColor }}
                                >
                                    {chat.avatar}
                                </span>
                                <span className="modal-message-info">
                                    <strong>{chat.name}</strong>
                                    <span>{chat.lastMessage}</span>
                                </span>
                                <span className="modal-message-meta">
                                    <time>{chat.time}</time>
                                    {chat.unread > 0 && (
                                        <span className="modal-message-unread">{chat.unread}</span>
                                    )}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <div className="app-modal-footer app-modal-footer-inline">
                <Link to="/chat" className="app-modal-link" onClick={onClose}>
                    Открыть все чаты →
                </Link>
            </div>
        </AppModal>
    );
}

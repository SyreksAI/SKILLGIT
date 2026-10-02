import React from 'react';
import { Link } from 'react-router-dom';
import { AppModal } from './AppModal';

const TYPE_LABELS = {
    task: 'Задача',
    response: 'Отклик',
    team: 'Команда',
    review: 'Проверка',
    system: 'Система',
};

export function NotificationsModal({ isOpen, onClose, items, onMarkAllRead }) {
    const unreadCount = items.filter(item => !item.read).length;

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title="Уведомления"
            footer={(
                <>
                    <Link to="/notifications" className="app-modal-link" onClick={onClose}>
                        Все уведомления
                    </Link>
                    {unreadCount > 0 && (
                        <button type="button" className="app-modal-action" onClick={onMarkAllRead}>
                            Прочитать все
                        </button>
                    )}
                </>
            )}
        >
            {items.length === 0 ? (
                <p className="app-modal-empty">Нет уведомлений</p>
            ) : (
                <ul className="modal-notifications-list">
                    {items.map(item => (
                        <li key={item.id} className={item.read ? '' : 'unread'}>
                            <span className="modal-notification-type" data-type={item.type}>
                                {TYPE_LABELS[item.type] ?? item.type}
                            </span>
                            {item.href ? (
                                <Link to={item.href} onClick={onClose}>{item.text}</Link>
                            ) : (
                                <p>{item.text}</p>
                            )}
                            <time>{item.time}</time>
                        </li>
                    ))}
                </ul>
            )}
        </AppModal>
    );
}

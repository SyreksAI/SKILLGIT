import React from 'react';
import { HeaderBalance } from './HeaderBalance';
import { useModals } from '../../context/ModalsContext';
import { BellIcon, MailIcon, MoonIcon } from '../pages/icons';

export function HeaderActions() {
    const {
        openNotifications,
        openMessages,
        openTheme,
        unreadNotifications,
        unreadMessages,
    } = useModals();

    return (
        <div className="home-header-actions">
            <HeaderBalance />
            <button
                type="button"
                className="icon-btn"
                aria-label="Уведомления"
                onClick={openNotifications}
            >
                <BellIcon />
                {unreadNotifications > 0 && (
                    <span className="icon-btn-badge">{unreadNotifications}</span>
                )}
            </button>
            <button
                type="button"
                className="icon-btn"
                aria-label="Сообщения"
                onClick={openMessages}
            >
                <MailIcon />
                {unreadMessages > 0 && (
                    <span className="icon-btn-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                )}
            </button>
            <button
                type="button"
                className="icon-btn"
                aria-label="Тёмная тема"
                onClick={openTheme}
            >
                <MoonIcon />
            </button>
        </div>
    );
}

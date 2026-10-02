import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationsContext';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon } from './icons';

const TYPE_LABELS = {
    task: 'Задача',
    response: 'Отклик',
    team: 'Команда',
    review: 'Проверка',
    system: 'Система',
};

export function NotificationsPage() {
    const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

    return (
        <div className="notifications-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск уведомлений..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <div className="account-page">
                <header className="account-header">
                    <div>
                        <h1>Уведомления</h1>
                        <p>{unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все уведомления прочитаны'}</p>
                    </div>
                    {unreadCount > 0 && (
                        <button type="button" className="account-save-btn" onClick={markAllRead}>
                            Прочитать все
                        </button>
                    )}
                </header>

                <ul className="notifications-list">
                    {notifications.map(item => (
                        <li key={item.id} className={`notifications-item${item.read ? '' : ' unread'}`}>
                            <span className="modal-notification-type" data-type={item.type}>
                                {TYPE_LABELS[item.type] ?? item.type}
                            </span>
                            <div className="notifications-item-body">
                                {item.href ? (
                                    <Link to={item.href} onClick={() => markRead(item.id)}>{item.text}</Link>
                                ) : (
                                    <p>{item.text}</p>
                                )}
                                <time>{item.time}</time>
                            </div>
                            {!item.read && (
                                <button type="button" className="admin-link" onClick={() => markRead(item.id)}>
                                    Прочитано
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

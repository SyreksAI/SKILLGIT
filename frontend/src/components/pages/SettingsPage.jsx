import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParam } from '../../hooks/useSearchParam';
import { DIRECTIONS } from '../../data/mockData';
import { GhDropdown } from '../ui/GhDropdown';
import { HeaderActions } from '../ui/HeaderActions';
import { useTheme } from '../../context/ThemeContext';
import { useUserSettings } from '../../context/UserSettingsContext';
import { PaymentCardsSettings } from '../settings/PaymentCardsSettings';
import { ArrowRightIcon, SearchIcon, MoonIcon } from './icons';

const SECTIONS = [
    { id: 'public', label: 'Публичный профиль' },
    { id: 'notifications', label: 'Уведомления' },
    { id: 'appearance', label: 'Оформление' },
    { id: 'payments', label: 'Выплаты и реквизиты' },
    { id: 'account', label: 'Аккаунт' },
];

const DIRECTION_OPTIONS = DIRECTIONS.map(d => ({ id: d.id, label: d.label }));

const NOTIFICATIONS = [
    { id: 'tasks', label: 'Новые задачи по моему направлению' },
    { id: 'responses', label: 'Ответы на отклики' },
    { id: 'chat', label: 'Сообщения в чате' },
    { id: 'team', label: 'Приглашения в команды' },
    { id: 'reviews', label: 'Отзывы и проверки' },
];

const SECTION_IDS = SECTIONS.map(s => s.id);

export function SettingsPage() {
    const [section, setSection] = useSearchParam('section', 'public', SECTION_IDS);
    const { user, profile, notifications, saveProfile, toggleNotification, getDirectionLabel } = useUserSettings();
    const [draft, setDraft] = useState(profile);
    const [saved, setSaved] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setDraft(profile);
    }, [profile]);

    function handleSave(e) {
        e.preventDefault();
        saveProfile(draft);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="settings-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск в настройках..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <div className="account-page">
            <header className="account-header">
                <div>
                    <h1>Настройки</h1>
                    <p>Управление профилем и уведомлениями SKILLGIT</p>
                </div>
                <Link to="/profile" className="account-public-link">
                    Мой профиль
                    <ArrowRightIcon />
                </Link>
            </header>

            <div className="account-layout">
                <nav className="account-nav">
                    <div className="account-nav-user">
                        <div className="account-nav-avatar">{user.name.charAt(0)}</div>
                        <div>
                            <strong>{user.name}</strong>
                            <span>@{user.username}</span>
                        </div>
                    </div>
                    {SECTIONS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            className={`account-nav-item${section === id ? ' active' : ''}`}
                            onClick={() => setSection(id)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="account-panel">
                    {section === 'public' && (
                        <form onSubmit={handleSave}>
                            <div className="account-panel-head">
                                <h2>Публичный профиль</h2>
                                <p>Эти данные видны в профиле, LabSkill и при откликах на задачи.</p>
                            </div>

                            <div className="account-form">
                                <label className="account-field">
                                    <span>Имя</span>
                                    <input
                                        type="text"
                                        value={draft.name}
                                        onChange={e => setDraft({ ...draft, name: e.target.value })}
                                    />
                                </label>
                                <label className="account-field">
                                    <span>Username</span>
                                    <input
                                        type="text"
                                        value={draft.username}
                                        onChange={e => setDraft({ ...draft, username: e.target.value })}
                                    />
                                </label>
                                <label className="account-field">
                                    <span>Роль / специализация</span>
                                    <input
                                        type="text"
                                        value={draft.role}
                                        onChange={e => setDraft({ ...draft, role: e.target.value })}
                                    />
                                </label>
                                <div className="account-field">
                                    <span>Направление</span>
                                    <GhDropdown
                                        label={getDirectionLabel(draft.direction)}
                                        value={draft.direction}
                                        options={DIRECTION_OPTIONS}
                                        onChange={direction => setDraft({ ...draft, direction })}
                                    />
                                </div>
                                <label className="account-field account-field-full">
                                    <span>О себе</span>
                                    <textarea
                                        rows={4}
                                        value={draft.bio}
                                        onChange={e => setDraft({ ...draft, bio: e.target.value })}
                                    />
                                </label>
                                <label className="account-field account-field-full">
                                    <span>Навыки</span>
                                    <input
                                        type="text"
                                        placeholder="React, JavaScript, Figma..."
                                        value={draft.skills.join(', ')}
                                        onChange={e => setDraft({
                                            ...draft,
                                            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                        })}
                                    />
                                    <small>Через запятую</small>
                                </label>
                                <label className="account-field">
                                    <span>Город</span>
                                    <input
                                        type="text"
                                        value={draft.location}
                                        onChange={e => setDraft({ ...draft, location: e.target.value })}
                                    />
                                </label>
                                <label className="account-field">
                                    <span>Сайт</span>
                                    <input
                                        type="text"
                                        value={draft.website}
                                        onChange={e => setDraft({ ...draft, website: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="account-actions">
                                <button type="submit" className="account-save-btn">
                                    {saved ? 'Сохранено' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    )}

                    {section === 'notifications' && (
                        <div>
                            <div className="account-panel-head">
                                <h2>Уведомления</h2>
                                <p>Выберите, о чём получать оповещения. Настройки сохраняются автоматически.</p>
                            </div>
                            <ul className="account-toggles">
                                {NOTIFICATIONS.map(({ id, label }) => (
                                    <li key={id}>
                                        <label className="account-toggle">
                                            <input
                                                type="checkbox"
                                                checked={notifications[id]}
                                                onChange={() => toggleNotification(id)}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {section === 'appearance' && (
                        <div>
                            <div className="account-panel-head">
                                <h2>Оформление</h2>
                                <p>Тема интерфейса SKILLGIT.</p>
                            </div>
                            <div className="modal-theme-options settings-theme-options">
                                <button
                                    type="button"
                                    className={`modal-theme-option${theme === 'light' ? ' active' : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <span className="modal-theme-preview modal-theme-preview-light" />
                                    <strong>Светлая</strong>
                                    <span>{theme === 'light' ? 'Активна' : 'Выбрать'}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`modal-theme-option${theme === 'dark' ? ' active' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <span className="modal-theme-preview modal-theme-preview-dark" />
                                    <strong>Тёмная</strong>
                                    <span>{theme === 'dark' ? 'Активна' : 'Выбрать'}</span>
                                </button>
                            </div>
                            <div className="modal-theme-note settings-theme-note">
                                <MoonIcon />
                                <span>Настройка сохраняется локально в браузере.</span>
                            </div>
                        </div>
                    )}

                    {section === 'payments' && <PaymentCardsSettings />}

                    {section === 'account' && (
                        <div>
                            <div className="account-panel-head">
                                <h2>Аккаунт</h2>
                                <p>Безопасность и вход в SKILLGIT.</p>
                            </div>
                            <div className="account-form">
                                <label className="account-field account-field-full">
                                    <span>Email</span>
                                    <input type="email" value="ivan.ivanov@mail.ru" readOnly />
                                </label>
                                <label className="account-field account-field-full">
                                    <span>Новый пароль</span>
                                    <input type="password" placeholder="••••••••" />
                                </label>
                                <label className="account-field account-field-full">
                                    <span>Подтверждение пароля</span>
                                    <input type="password" placeholder="••••••••" />
                                </label>
                            </div>
                            <div className="account-actions">
                                <button type="button" className="account-save-btn">Обновить пароль</button>
                                <button type="button" className="account-danger-btn">Выйти из аккаунта</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}

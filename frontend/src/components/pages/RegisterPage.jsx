import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../auth/AuthShell';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../context/UserSettingsContext';
import { DIRECTIONS } from '../../data/mockData';
import { ArrowRightIcon } from './icons';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const { updateProfile } = useUserSettings();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [direction, setDirection] = useState('dev');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password) {
            setError('Заполните все обязательные поля');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            const user = await register({
                name,
                username,
                email,
                password,
                direction,
            });
            updateProfile({
                name: user.name,
                username: user.username,
                role: user.role,
                direction: user.direction,
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Не удалось зарегистрироваться');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title="Создать аккаунт"
            subtitle="Присоединяйтесь к SKILLGIT — выполняйте задачи, собирайте портфолио и зарабатывайте."
            footer={(
                <Link to="/" className="auth-back">
                    ← На главную
                </Link>
            )}
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="auth-field">
                    <span>Имя и фамилия</span>
                    <input
                        type="text"
                        value={name}
                        onChange={e => {
                            setName(e.target.value);
                            setError('');
                        }}
                        placeholder="Иван Иванов"
                        autoComplete="name"
                        autoFocus
                    />
                </label>

                <label className="auth-field">
                    <span>Имя пользователя</span>
                    <input
                        type="text"
                        value={username}
                        onChange={e => {
                            setUsername(e.target.value);
                            setError('');
                        }}
                        placeholder="ivan-ivanov"
                        autoComplete="username"
                        spellCheck={false}
                    />
                </label>

                <label className="auth-field">
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        placeholder="you@mail.ru"
                        autoComplete="email"
                    />
                </label>

                <label className="auth-field">
                    <span>Направление</span>
                    <select
                        value={direction}
                        onChange={e => setDirection(e.target.value)}
                    >
                        {DIRECTIONS.map(item => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                    </select>
                </label>

                <div className="auth-field-row">
                    <label className="auth-field">
                        <span>Пароль</span>
                        <input
                            type="password"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Минимум 6 символов"
                            autoComplete="new-password"
                        />
                    </label>

                    <label className="auth-field">
                        <span>Повтор пароля</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => {
                                setConfirmPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Ещё раз"
                            autoComplete="new-password"
                        />
                    </label>
                </div>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Создание…' : 'Создать аккаунт'}
                    {!loading && <ArrowRightIcon />}
                </button>
            </form>

            <p className="auth-legal">
                Регистрируясь, вы соглашаетесь с условиями использования SKILLGIT.
            </p>

            <p className="auth-switch">
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </AuthShell>
    );
}

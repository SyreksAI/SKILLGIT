import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '../auth/AuthShell';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../context/UserSettingsContext';
import { ArrowRightIcon } from './icons';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const { updateProfile } = useUserSettings();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        if (!email.trim() || !password) {
            setError('Введите email и пароль');
            return;
        }

        setLoading(true);
        try {
            const user = await login(email, password);
            updateProfile({
                name: user.name,
                username: user.username,
                role: user.role,
                direction: user.direction,
            });
            const redirectTo = location.state?.from?.pathname || '/';
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message || 'Не удалось войти');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title="С возвращением"
            subtitle="Войдите, чтобы откликаться на задачи и вести портфолио в LabSkill."
            footer={(
                <Link to="/" className="auth-back">
                    ← На главную
                </Link>
            )}
        >
            <form className="auth-form" onSubmit={handleSubmit}>
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
                        autoFocus
                    />
                </label>

                <label className="auth-field">
                    <span>Пароль</span>
                    <input
                        type="password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </label>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Вход…' : 'Войти'}
                    {!loading && <ArrowRightIcon />}
                </button>
            </form>

            <p className="auth-hint">
                Демо-аккаунт: <code>ivan.ivanov@mail.ru</code> · пароль <code>demo123</code>
            </p>

            <p className="auth-switch">
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
        </AuthShell>
    );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../auth/AuthShell';
import { useAuth } from '../../context/AuthContext';
import { DIRECTIONS } from '../../data/mockData';
import { ArrowRightIcon } from './icons';

export function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register, isAuthenticated, user } = useAuth();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [direction, setDirection] = useState('dev');
    const [accountType, setAccountType] = useState(
        () => searchParams.get('accountType') === 'customer' ? 'customer' : 'performer',
    );
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(user?.accountType === 'customer' ? '/company/dashboard' : '/', { replace: true });
        }
    }, [isAuthenticated, navigate, user?.accountType]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password) {
            setError('Заполните все обязательные поля');
            return;
        }

        if (password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов');
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
                accountType,
                ...(accountType === 'performer' ? { direction } : {}),
            });
            navigate(user?.accountType === 'customer' ? '/company/dashboard' : '/', { replace: true });
        } catch (err) {
            setError(err.message || 'Не удалось зарегистрироваться');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            accountType={accountType}
            onAccountTypeChange={setAccountType}
            title="Создать аккаунт"
            subtitle={accountType === 'performer'
                ? 'Создайте профиль исполнителя, чтобы находить задачи и показывать свои навыки.'
                : 'Создайте аккаунт заказчика, чтобы размещать задачи и находить специалистов.'}
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

                {accountType === 'performer' && (
                    <label className="auth-field">
                        <span>Ваше направление</span>
                        <select
                            value={direction}
                            onChange={e => setDirection(e.target.value)}
                        >
                            {DIRECTIONS.map(item => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </select>
                    </label>
                )}

                <div className="auth-field-row">
                    <label className="auth-field">
                        <span>Пароль</span>
                        <input
                            type="password"
                            value={password}
                            minLength={8}
                            onChange={e => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Минимум 8 символов"
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
                    {loading ? 'Создание…' : accountType === 'performer' ? 'Создать аккаунт исполнителя' : 'Создать аккаунт заказчика'}
                    {!loading && <ArrowRightIcon />}
                </button>
            </form>

            <p className="auth-legal">
                Регистрируясь, вы соглашаетесь с условиями использования SKILLGIT.
            </p>

            <p className="auth-switch">
                Уже есть аккаунт? <Link to={`/login?accountType=${accountType}`}>Войти</Link>
            </p>
        </AuthShell>
    );
}

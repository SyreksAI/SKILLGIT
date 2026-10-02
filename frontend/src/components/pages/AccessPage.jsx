import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from './icons';

const ALLOWED_PREFIXES = [
    '/company',
    '/admin',
    '/help',
    '/notifications',
    '/companies',
    '/users',
];

function normalizePath(raw) {
    let path = raw.trim();
    if (!path) return null;

    try {
        if (/^https?:\/\//i.test(path)) {
            const url = new URL(path);
            path = `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        return null;
    }

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return path;
}

function isAllowedPath(path) {
    if (!path || path === '/') return false;
    return ALLOWED_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

export function AccessPage() {
    const navigate = useNavigate();
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        const path = normalizePath(value);

        if (!path) {
            setError('Введите корректный адрес');
            return;
        }

        if (!isAllowedPath(path)) {
            setError('Этот адрес недоступен через служебный вход');
            return;
        }

        setError('');
        navigate(path);
    }

    return (
        <div className="access-page">
            <div className="access-card">
                <Link to="/" className="access-logo">
                    <img className="logo-img logo-img--light" src="/logo.jpg" alt="SKILLGIT" />
                    <img className="logo-img logo-img--dark" src="/logo-dark.png" alt="SKILLGIT" />
                </Link>

                <h1>Служебный вход</h1>
                <p>Введите внутренний адрес страницы для перехода.</p>

                <form className="access-form" onSubmit={handleSubmit}>
                    <label className="access-field">
                        <span>Адрес страницы</span>
                        <input
                            type="text"
                            value={value}
                            onChange={e => {
                                setValue(e.target.value);
                                setError('');
                            }}
                            placeholder="/company/dashboard"
                            autoComplete="off"
                            spellCheck={false}
                            autoFocus
                        />
                    </label>
                    {error && <p className="access-error">{error}</p>}
                    <button type="submit" className="access-submit">
                        Перейти
                        <ArrowRightIcon />
                    </button>
                </form>

                <p className="access-hint">
                    Примеры: <code>/company/dashboard</code>, <code>/admin/dashboard</code>, <code>/help</code>
                </p>

                <Link to="/" className="access-back">← На главную</Link>
            </div>
        </div>
    );
}

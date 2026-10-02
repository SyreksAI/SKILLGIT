import { Link, NavLink } from 'react-router-dom';

export function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="auth-page">
            <aside className="auth-panel">
                <div className="auth-panel-head">
                    <Link to="/" className="auth-logo">
                        <img className="logo-img logo-img--light" src="/logo.jpg" alt="SKILLGIT" />
                        <img className="logo-img logo-img--dark" src="/logo-dark.png" alt="SKILLGIT" />
                    </Link>
                </div>

                <nav className="auth-menu" aria-label="Вход и регистрация">
                    <NavLink
                        to="/login"
                        className={({ isActive }) => `auth-nav-item${isActive ? ' active' : ''}`}
                    >
                        Вход
                    </NavLink>
                    <NavLink
                        to="/register"
                        className={({ isActive }) => `auth-nav-item${isActive ? ' active' : ''}`}
                    >
                        Регистрация
                    </NavLink>
                </nav>

                <div className="auth-panel-body">
                    <div className="auth-intro">
                        <h1>{title}</h1>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    {children}
                </div>

                {footer && (
                    <div className="auth-panel-footer">
                        {footer}
                    </div>
                )}
            </aside>
        </div>
    );
}

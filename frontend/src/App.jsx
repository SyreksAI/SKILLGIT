import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import AppRouter from './AppRouter';
import { AuthSync } from './components/auth/AuthSync';
import { useAuth } from './context/AuthContext';
import { useUserSettings } from './context/UserSettingsContext';
import { SettingsIcon, RocketIcon, AgentsIcon } from './components/pages/icons';

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const IconHome = () => (
  <svg {...iconProps}><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" /></svg>
);
const IconTasks = () => (
  <svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
);
const IconChat = () => (
  <svg {...iconProps}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const IconTeam = () => (
  <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconLab = () => (
  <svg {...iconProps}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
);

const NAV = [
  { to: '/', end: true, Icon: IconHome, label: 'Главная' },
  { to: '/tasks', Icon: IconTasks, label: 'Мои задачи', badge: 5 },
  { to: '/chat', Icon: IconChat, label: 'Чат', badge: 12 },
  { to: '/team', Icon: IconTeam, label: 'Команда' },
  { to: '/labskill', Icon: IconLab, label: 'LabSkill' },
  { to: '/skillmate', Icon: AgentsIcon, label: 'SkillMate' },
];

const PAGE_TITLES = {
  '/tasks': 'Мои задачи',
  '/chat': 'Сообщения',
  '/team': 'Команды',
  '/labskill': 'LabSkill',
  '/profile': 'Профиль',
  '/settings': 'Настройки',
};

function Sidebar() {
  const { user } = useUserSettings();
  const { isAuthenticated } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-body">
        <NavLink to="/" className="logo-block">
          <img className="logo-img logo-img--light" src="/logo.jpg" alt="SKILLGIT" />
          <img className="logo-img logo-img--dark" src="/logo-dark.png" alt="SKILLGIT" />
        </NavLink>

        <nav className="menu">
          {NAV.map(({ to, end, Icon, label, badge }) => (
            <NavLink key={`${to}-${label}`} to={to} end={end} className="nav-item">
              <Icon />
              <span>{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-promo">
          <RocketIcon />
          <p>Развивайся. Создавай портфолио. Зарабатывай.</p>
          <Link to="/how-it-works" className="sidebar-promo-link">Как это работает</Link>
        </div>

      </div>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="sidebar-user-block">
            <NavLink to="/profile" className="profile-card">
              <div className="profile-avatar">{user.name.charAt(0)}</div>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">{user.role}</span>
              </div>
            </NavLink>
            <NavLink to="/settings" className="profile-settings-btn" aria-label="Настройки">
              <SettingsIcon />
            </NavLink>
          </div>
        ) : (
          <div className="sidebar-auth-block">
            <Link to="/login" className="sidebar-auth-btn sidebar-auth-btn--primary">Войти</Link>
            <Link to="/register" className="sidebar-auth-btn">Регистрация</Link>
          </div>
        )}
      </div>
    </aside>
  );
}

function TopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname];
  if (!title) return null;

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
    </header>
  );
}

function App() {
  const { pathname } = useLocation();
  const isAccess = pathname === '/access';
  const isAuth = pathname === '/login' || pathname === '/register';
  const isAdminShell = pathname.startsWith('/company') || pathname.startsWith('/admin');
  const isChat = pathname === '/chat';
  const isSkillMate = pathname === '/skillmate';
  const isMateAI = pathname === '/mateai';
  const isHome = pathname === '/';
  const isTasks = pathname === '/tasks';
  const isTeam = pathname === '/team';
  const isLabSkill = pathname === '/labskill' || pathname.startsWith('/labskill/');
  const isProfile = pathname === '/profile';
  const isSettings = pathname === '/settings';
  const isHowItWorks = pathname === '/how-it-works';
  const isNotifications = pathname === '/notifications';
  const isHelp = pathname === '/help';
  const isPublic = pathname.startsWith('/companies/') || pathname.startsWith('/users/');
  const isTaskDetail = /^\/tasks\/\d+$/.test(pathname);
  const isFullWidth = isHome || isTasks || isTeam || isLabSkill || isProfile
    || isSettings || isHowItWorks || isTaskDetail || isNotifications || isHelp || isPublic;

  if (isAccess || isAuth) {
    return (
      <div className={`app${isAuth ? ' app--auth' : ' app--access'}`}>
        <AppRouter />
      </div>
    );
  }

  if (isAdminShell) {
    return (
      <div className="app app--admin">
        <main className="content content--admin">
          <AppRouter />
        </main>
      </div>
    );
  }

  if (isMateAI) {
    return (
      <div className="app app--mateai-standalone">
        <AppRouter />
      </div>
    );
  }

  return (
    <div className="app">
      <AuthSync />
      <Sidebar />
      <div className="main-wrap">
        {!isChat && !isSkillMate && !isFullWidth && <TopBar />}
        <main className={`content${isChat || isSkillMate ? ' content--chat' : ''}${isSkillMate ? ' content--skillmate' : ''}${isFullWidth ? ' content--home' : ''}`}>
          <AppRouter />
        </main>
      </div>
    </div>
  );
}

export default App;

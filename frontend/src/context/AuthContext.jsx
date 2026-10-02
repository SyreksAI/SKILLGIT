import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { CURRENT_USER } from '../data/mockData';

const SESSION_KEY = 'skillgit-auth-session';
const USERS_KEY = 'skillgit-auth-users';

const DEMO_USER = {
    id: '1',
    email: 'ivan.ivanov@mail.ru',
    password: 'demo123',
    name: CURRENT_USER.name,
    username: CURRENT_USER.username,
    role: CURRENT_USER.role,
    direction: CURRENT_USER.direction,
};

function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function loadUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        /* ignore */
    }
    return [DEMO_USER];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session) {
    if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function slugifyUsername(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        direction: user.direction,
    };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(() => loadSession());

    const user = session?.user ?? null;
    const isAuthenticated = Boolean(user);

    const login = useCallback(async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const users = loadUsers();
        const found = users.find(
            u => u.email.toLowerCase() === normalizedEmail && u.password === password,
        );

        if (!found) {
            throw new Error('Неверный email или пароль');
        }

        const nextSession = {
            token: `mock-${found.id}-${Date.now()}`,
            user: publicUser(found),
        };
        saveSession(nextSession);
        setSession(nextSession);
        return nextSession.user;
    }, []);

    const register = useCallback(async (payload) => {
        const name = payload.name.trim();
        const email = payload.email.trim().toLowerCase();
        const password = payload.password;
        const username = slugifyUsername(payload.username || name);
        const direction = payload.direction || 'dev';

        if (!name || !email || !password) {
            throw new Error('Заполните все обязательные поля');
        }

        if (password.length < 6) {
            throw new Error('Пароль должен быть не короче 6 символов');
        }

        const users = loadUsers();

        if (users.some(u => u.email.toLowerCase() === email)) {
            throw new Error('Пользователь с таким email уже существует');
        }

        if (users.some(u => u.username === username)) {
            throw new Error('Это имя пользователя уже занято');
        }

        const newUser = {
            id: String(Date.now()),
            email,
            password,
            name,
            username,
            role: 'Студент',
            direction,
        };

        const nextUsers = [...users, newUser];
        saveUsers(nextUsers);

        const nextSession = {
            token: `mock-${newUser.id}-${Date.now()}`,
            user: publicUser(newUser),
        };
        saveSession(nextSession);
        setSession(nextSession);
        return nextSession.user;
    }, []);

    const logout = useCallback(() => {
        saveSession(null);
        setSession(null);
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        login,
        register,
        logout,
    }), [user, isAuthenticated, login, register, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

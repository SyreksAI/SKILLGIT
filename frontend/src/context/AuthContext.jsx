import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { api } from '../services/api';

const SESSION_KEY = 'skillgit-auth-session';

function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        const session = raw ? JSON.parse(raw) : null;
        // Discard sessions created by the previous browser-only demo auth.
        return session?.token && !session.token.startsWith('mock-') ? session : null;
    } catch {
        return null;
    }
}

function saveSession(session) {
    if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(() => loadSession());

    useEffect(() => {
        if (!session?.token) return undefined;
        let cancelled = false;

        api.getCurrentUser(session.token)
            .then(user => {
                if (cancelled) return;
                const refreshedSession = { ...session, user };
                saveSession(refreshedSession);
                setSession(refreshedSession);
            })
            .catch(() => {
                if (cancelled) return;
                saveSession(null);
                setSession(null);
            });

        return () => { cancelled = true; };
    // Validate the persisted token once when the app starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const user = session?.user ?? null;
    const isAuthenticated = Boolean(user);

    const acceptAuthResponse = useCallback(response => {
        const nextSession = { token: response.access_token, user: response.user };
        saveSession(nextSession);
        setSession(nextSession);
        return nextSession.user;
    }, []);

    const login = useCallback(async (email, password, accountType = 'performer') => {
        const response = await api.loginAccount({
            email: email.trim().toLowerCase(),
            password,
            accountType,
        });
        return acceptAuthResponse(response);
    }, [acceptAuthResponse]);

    const register = useCallback(async payload => {
        const response = await api.registerAccount({
            ...payload,
            name: payload.name.trim(),
            email: payload.email.trim().toLowerCase(),
        });
        return acceptAuthResponse(response);
    }, [acceptAuthResponse]);

    const logout = useCallback(() => {
        const token = session?.token;
        saveSession(null);
        setSession(null);
        if (token) {
            // Clear the browser session immediately, and revoke the server session too.
            return api.logoutAccount(token).catch(() => null);
        }
        return Promise.resolve(null);
    }, [session?.token]);

    const value = useMemo(() => ({
        user,
        accessToken: session?.token ?? null,
        isAuthenticated,
        login,
        register,
        logout,
    }), [user, session?.token, isAuthenticated, login, register, logout]);

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

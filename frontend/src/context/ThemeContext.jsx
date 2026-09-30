import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

const STORAGE_KEY = 'skillgit-theme';

const ThemeContext = createContext(null);

function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((next) => {
        setThemeState(next === 'dark' ? 'dark' : 'light');
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    }), [theme, setTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { DIRECTIONS } from '../data/mockData';

const STORAGE_KEY = 'skillgit-user-settings';

const DEFAULT_NOTIFICATIONS = {
    tasks: true,
    responses: true,
    chat: true,
    team: false,
    reviews: true,
};

const EMPTY_PROFILE = {
    id: null,
    name: '',
    username: '',
    role: '',
    accountType: 'performer',
    direction: null,
    bio: '',
    skills: [],
    location: '',
    website: '',
    company: '',
    stats: {
        tasksDone: 0,
        tasksActive: 0,
        tasksReview: 0,
        balanceAmount: 0,
        balanceLabel: '0 ₽',
        rating: null,
        reviews: 0,
        followers: 0,
        following: 0,
    },
    tasks: [],
    reviews: [],
    activity: [],
    teams: [],
};

function loadNotifications() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw).notifications ?? { ...DEFAULT_NOTIFICATIONS } : { ...DEFAULT_NOTIFICATIONS };
    } catch {
        return { ...DEFAULT_NOTIFICATIONS };
    }
}

function saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ notifications }));
}

const UserSettingsContext = createContext(null);

export function UserSettingsProvider({ children }) {
    const { user: authUser, accessToken, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [profileLoading, setProfileLoading] = useState(Boolean(isAuthenticated));
    const [profileError, setProfileError] = useState('');
    const [profileRefreshKey, setProfileRefreshKey] = useState(0);
    const [notifications, setNotifications] = useState(loadNotifications);

    useEffect(() => {
        const refreshProfile = () => setProfileRefreshKey(key => key + 1);
        window.addEventListener('skillgit:profile-refresh', refreshProfile);
        window.addEventListener('focus', refreshProfile);
        return () => {
            window.removeEventListener('skillgit:profile-refresh', refreshProfile);
            window.removeEventListener('focus', refreshProfile);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (!isAuthenticated || !accessToken) {
            setProfile(EMPTY_PROFILE);
            setProfileLoading(false);
            setProfileError('');
            return undefined;
        }

        setProfileLoading(true);
        setProfileError('');
        api.getProfile(accessToken)
            .then(data => {
                if (!cancelled) setProfile({ ...EMPTY_PROFILE, ...data, stats: { ...EMPTY_PROFILE.stats, ...data.stats } });
            })
            .catch(error => {
                if (cancelled) return;
                setProfile({ ...EMPTY_PROFILE, ...authUser, stats: EMPTY_PROFILE.stats });
                setProfileError(error.message || 'Не удалось загрузить профиль');
            })
            .finally(() => {
                if (!cancelled) setProfileLoading(false);
            });

        return () => { cancelled = true; };
    }, [accessToken, authUser, isAuthenticated, profileRefreshKey]);

    const saveProfile = useCallback(async (nextProfile) => {
        if (!accessToken) throw new Error('Войдите в аккаунт, чтобы сохранить профиль');
        const fields = ['name', 'username', 'role', 'direction', 'bio', 'skills', 'location', 'website', 'company'];
        const changes = Object.fromEntries(fields.map(field => [field, nextProfile[field]]));
        const saved = await api.updateProfile(changes, accessToken);
        setProfile({ ...EMPTY_PROFILE, ...saved, stats: { ...EMPTY_PROFILE.stats, ...saved.stats } });
        return saved;
    }, [accessToken]);

    const toggleNotification = useCallback((id) => {
        setNotifications(previous => {
            const next = { ...previous, [id]: !previous[id] };
            saveNotifications(next);
            return next;
        });
    }, []);

    const getDirectionLabel = useCallback(id => {
        if (!id) return '';
        return DIRECTIONS.find(direction => direction.id === id)?.label ?? id;
    }, []);

    const value = useMemo(() => ({
        user: profile,
        profile,
        profileLoading,
        profileError,
        notifications,
        saveProfile,
        toggleNotification,
        getDirectionLabel,
    }), [profile, profileLoading, profileError, notifications, saveProfile, toggleNotification, getDirectionLabel]);

    return (
        <UserSettingsContext.Provider value={value}>
            {children}
        </UserSettingsContext.Provider>
    );
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext);
    if (!context) {
        throw new Error('useUserSettings must be used within UserSettingsProvider');
    }
    return context;
}

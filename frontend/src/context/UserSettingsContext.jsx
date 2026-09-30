import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { CURRENT_USER, DIRECTIONS } from '../data/mockData';

const STORAGE_KEY = 'skillgit-user-settings';

const DEFAULT_NOTIFICATIONS = {
    tasks: true,
    responses: true,
    chat: true,
    team: false,
    reviews: true,
};

function loadStoredSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

const UserSettingsContext = createContext(null);

export function UserSettingsProvider({ children }) {
    const stored = loadStoredSettings();

    const [profile, setProfile] = useState(() => ({
        name: stored?.profile?.name ?? CURRENT_USER.name,
        username: stored?.profile?.username ?? CURRENT_USER.username,
        role: stored?.profile?.role ?? CURRENT_USER.role,
        direction: stored?.profile?.direction ?? CURRENT_USER.direction,
        bio: stored?.profile?.bio ?? CURRENT_USER.bio,
        skills: stored?.profile?.skills ?? [...CURRENT_USER.skills],
        location: stored?.profile?.location ?? CURRENT_USER.location,
        website: stored?.profile?.website ?? CURRENT_USER.website,
    }));

    const [notifications, setNotifications] = useState(
        () => stored?.notifications ?? { ...DEFAULT_NOTIFICATIONS },
    );

    const persist = useCallback((nextProfile, nextNotifications) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            profile: nextProfile,
            notifications: nextNotifications,
        }));
    }, []);

    const updateProfile = useCallback((patch) => {
        setProfile(prev => {
            const next = { ...prev, ...patch };
            persist(next, notifications);
            return next;
        });
    }, [notifications, persist]);

    const saveProfile = useCallback((nextProfile) => {
        setProfile(nextProfile);
        persist(nextProfile, notifications);
    }, [notifications, persist]);

    const toggleNotification = useCallback((id) => {
        setNotifications(prev => {
            const next = { ...prev, [id]: !prev[id] };
            persist(profile, next);
            return next;
        });
    }, [persist, profile]);

    const user = useMemo(() => ({
        ...CURRENT_USER,
        ...profile,
        stats: CURRENT_USER.stats,
    }), [profile]);

    const value = useMemo(() => ({
        user,
        profile,
        notifications,
        updateProfile,
        saveProfile,
        toggleNotification,
        getDirectionLabel: (id) => DIRECTIONS.find(d => d.id === id)?.label ?? id,
    }), [user, profile, notifications, updateProfile, saveProfile, toggleNotification]);

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

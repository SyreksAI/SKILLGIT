import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../context/UserSettingsContext';

export function AuthSync() {
    const { user, isAuthenticated } = useAuth();
    const { updateProfile } = useUserSettings();

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        updateProfile({
            name: user.name,
            username: user.username,
            role: user.role,
            direction: user.direction,
        });
    }, [isAuthenticated, user, updateProfile]);

    return null;
}

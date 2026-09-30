import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useSearchParam(key, defaultValue, validValues) {
    const [searchParams, setSearchParams] = useSearchParams();

    const value = useMemo(() => {
        const raw = searchParams.get(key);
        if (raw && (!validValues || validValues.includes(raw))) {
            return raw;
        }
        return defaultValue;
    }, [searchParams, key, defaultValue, validValues]);

    const setValue = useCallback((next) => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (next == null || next === '' || next === defaultValue) {
                params.delete(key);
            } else {
                params.set(key, String(next));
            }
            return params;
        }, { replace: true });
    }, [key, defaultValue, setSearchParams]);

    return [value, setValue, searchParams, setSearchParams];
}

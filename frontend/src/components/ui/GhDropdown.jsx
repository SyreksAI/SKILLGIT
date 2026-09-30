import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '../pages/icons';

export function GhDropdown({ label, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const activeOption = options.find(option => option.id === value);
    const defaultId = options[0]?.id;
    const triggerLabel = activeOption && value !== defaultId
        ? `${label}: ${activeOption.label}`
        : label;

    return (
        <div className={`gh-dropdown${open ? ' open' : ''}`} ref={ref}>
            <button
                type="button"
                className={`gh-dropdown-trigger${value !== defaultId ? ' gh-dropdown-trigger--active' : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
            >
                {triggerLabel}
                <ChevronDownIcon />
            </button>
            {open && (
                <ul className="gh-dropdown-menu" role="menu">
                    {options.map(option => (
                        <li key={option.id} role="none">
                            <button
                                type="button"
                                role="menuitem"
                                className={value === option.id ? 'active' : ''}
                                onClick={() => {
                                    onChange(option.id);
                                    setOpen(false);
                                }}
                            >
                                <span>{option.label}</span>
                                {value === option.id && <CheckIcon />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

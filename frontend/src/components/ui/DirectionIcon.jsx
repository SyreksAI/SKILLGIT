import {
    AiIcon,
    CodeIcon,
    PaletteIcon,
    PythonIcon,
    QaIcon,
    ReactIcon,
} from '../pages/icons';

export const DIRECTION_CONFIG = {
    python: { Icon: PythonIcon, color: '#3572A5', bg: 'rgba(53, 114, 165, 0.14)' },
    react: { Icon: ReactIcon, color: '#61DAFB', bg: 'rgba(97, 218, 251, 0.12)' },
    design: { Icon: PaletteIcon, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' },
    uiux: { Icon: PaletteIcon, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' },
    qa: { Icon: QaIcon, color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)' },
    ai: { Icon: AiIcon, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
    dev: { Icon: CodeIcon, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
};

export function DirectionIconBadge({ id }) {
    const config = DIRECTION_CONFIG[id];
    if (!config) return null;

    const { Icon, color, bg } = config;

    return (
        <span className="widget-cat-icon" style={{ color, backgroundColor: bg }}>
            <Icon />
        </span>
    );
}

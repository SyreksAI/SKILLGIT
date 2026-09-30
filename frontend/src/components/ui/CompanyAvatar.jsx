export function CompanyAvatar({ name, color = '#5577ff', size = 36 }) {
    const initial = name?.charAt(0)?.toUpperCase() ?? '?';

    return (
        <div
            className="company-avatar"
            style={{
                width: size,
                height: size,
                background: color,
                fontSize: size * 0.42,
            }}
            aria-hidden="true"
        >
            {initial}
        </div>
    );
}

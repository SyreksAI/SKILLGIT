import { NavLink, Link } from 'react-router-dom';
import { SettingsIcon } from '../pages/icons';

export function AdminStatCard({ label, value, hint, accent, children }) {
    return (
        <div className={`admin-stat-card${accent ? ` admin-stat-card--${accent}` : ''}`}>
            <span className="admin-stat-label">{label}</span>
            <strong className="admin-stat-value">{value}</strong>
            {hint && <span className="admin-stat-hint">{hint}</span>}
            {children}
        </div>
    );
}

export function AdminPanelHead({ title, subtitle, actions }) {
    return (
        <header className="admin-panel-head">
            <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="admin-panel-actions">{actions}</div>}
        </header>
    );
}

export function AdminShell({
    brandName,
    brandSubtitle,
    brandColor,
    basePath,
    navItems,
    children,
    footerLink,
}) {
    return (
        <div className="admin-app">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <span className="admin-sidebar-logo" style={{ background: brandColor }}>
                        {brandName.charAt(0)}
                    </span>
                    <div>
                        <strong>{brandName}</strong>
                        <span>{brandSubtitle}</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {navItems.map(({ to, label, Icon, badge }) => (
                        <NavLink
                            key={to}
                            to={`${basePath}/${to}`}
                            end={to === 'dashboard'}
                            className={({ isActive }) =>
                                `admin-nav-item${isActive ? ' active' : ''}`
                            }
                        >
                            {Icon && <Icon />}
                            <span>{label}</span>
                            {badge > 0 && <span className="admin-nav-badge">{badge}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    {footerLink}
                    <Link to="/" className="admin-back-link">← В SKILLGIT</Link>
                </div>
            </aside>

            <div className="admin-main">
                {children}
            </div>
        </div>
    );
}

export function AdminTable({
    columns,
    columnClassNames,
    colWidths,
    children,
    empty,
    tableClassName,
}) {
    if (empty) {
        return <div className="admin-empty">{empty}</div>;
    }
    return (
        <div className="admin-table-wrap">
            <table className={`admin-table${tableClassName ? ` ${tableClassName}` : ''}`}>
                {colWidths?.length > 0 && (
                    <colgroup>
                        {colWidths.map((width, index) => (
                            <col key={columns[index] ?? index} style={{ width }} />
                        ))}
                    </colgroup>
                )}
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={col || index}
                                className={columnClassNames?.[index] ?? undefined}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

export function AdminBadge({ children, tone = 'default' }) {
    return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export function AdminActionGroup({ children }) {
    return <div className="admin-action-group">{children}</div>;
}

export function AdminSettingsLink({ basePath }) {
    return (
        <NavLink to={`${basePath}/settings`} className="admin-settings-link">
            <SettingsIcon />
            Настройки
        </NavLink>
    );
}

import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, DownloadIcon, FilterIcon, MoreIcon, SearchIcon, SettingsIcon } from '../../pages/icons';

export function DropdownSelect({ label, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const active = options.find(item => item.id === value);

    return (
        <div className="gh-pulse-period" ref={rootRef}>
            <button
                type="button"
                className="gh-pulse-period-btn"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
            >
                {label}: <strong>{active?.label ?? value}</strong>
                <ChevronDownIcon />
            </button>
            {open && (
                <div className="gh-pulse-period-menu">
                    {options.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            className={value === item.id ? 'active' : ''}
                            onClick={() => {
                                onChange(item.id);
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function CardActions() {
    return (
        <div className="gh-insights-card-actions">
            <button type="button" className="gh-insights-icon-btn" aria-label="More options">
                <MoreIcon />
            </button>
            <button type="button" className="gh-insights-icon-btn" aria-label="Settings">
                <SettingsIcon />
            </button>
        </div>
    );
}

export function InsightsCard({ title, subtitle, children, actions, className = '' }) {
    return (
        <section className={`gh-insights-card${className ? ` ${className}` : ''}`}>
            <header className="gh-insights-card-head">
                <div className="gh-insights-card-head-text">
                    <h3>{title}</h3>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                {actions}
            </header>
            <div className="gh-insights-card-body">{children}</div>
        </section>
    );
}

export function InsightsPanelHead({ title, subtitle, children }) {
    return (
        <header className="gh-insights-panel-head">
            <div>
                <h2>{title}</h2>
                {subtitle && <p className="gh-insights-panel-sub">{subtitle}</p>}
            </div>
            {children}
        </header>
    );
}

export function InsightsSubTabs({ tabs, active, onChange }) {
    return (
        <nav className="gh-insights-subtabs" aria-label="Section tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    className={`gh-insights-subtab${active === tab.id ? ' active' : ''}`}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.Icon && <tab.Icon />}
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}

export function InsightsFilterBar() {
    return (
        <div className="gh-insights-filter-bar">
            <span className="gh-insights-filter-label"><FilterIcon /> Filter</span>
            <input type="search" placeholder="Search or filter" aria-label="Search or filter" />
            <SearchIcon />
            <button type="button" className="gh-insights-icon-btn" aria-label="Download">
                <DownloadIcon />
            </button>
        </div>
    );
}

export function InsightsEmptyState({ icon: Icon, title, children, action }) {
    return (
        <div className="gh-insights-empty-state">
            {Icon && (
                <div className="gh-insights-empty-icon">
                    <Icon />
                </div>
            )}
            <h3>{title}</h3>
            {children}
            {action}
        </div>
    );
}

export function InsightsEmptyTable({ title, description, linkLabel, linkHref = '#' }) {
    return (
        <div className="gh-insights-empty-table">
            <h3>{title}</h3>
            <p>{description}</p>
            {linkLabel && <a href={linkHref} className="gh-link-btn">{linkLabel}</a>}
        </div>
    );
}

export function InsightsMetricCard({ title, value, description }) {
    return (
        <div className="gh-insights-metric-card">
            <h4>{title}</h4>
            <strong>{value}</strong>
            {description && <p>{description}</p>}
        </div>
    );
}

export function InsightsSectionTitle({ children }) {
    return <h3 className="gh-insights-section-title">{children}</h3>;
}

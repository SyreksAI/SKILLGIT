export function SettingsPanel({ title, children }) {
    return (
        <div className="gh-settings-panel">
            {title && <h2 className="gh-settings-panel-title">{title}</h2>}
            {children}
        </div>
    );
}

export function SettingsBox({ children, danger = false }) {
    return (
        <div className={`gh-settings-box${danger ? ' gh-settings-box--danger' : ''}`}>
            {children}
        </div>
    );
}

export function SettingsBoxHeader({ title }) {
    return <h3 className="gh-settings-box-header">{title}</h3>;
}

export function SettingsBoxRow({ title, description, children, last = false }) {
    return (
        <div className={`gh-settings-box-row${last ? ' is-last' : ''}`}>
            <div className="gh-settings-box-row-text">
                {title && <strong>{title}</strong>}
                {description && <p>{description}</p>}
            </div>
            {children != null && (
                <div className="gh-settings-box-row-control">{children}</div>
            )}
        </div>
    );
}

export function SettingsField({ label, hint, children }) {
    return (
        <div className="gh-settings-field">
            {label && <label className="gh-settings-field-label">{label}</label>}
            {children}
            {hint && <p className="gh-settings-field-hint">{hint}</p>}
        </div>
    );
}

export function SettingsToggleRow({ title, description, checked, onChange, disabled, last = false }) {
    return (
        <SettingsBoxRow title={title} description={description} last={last}>
            <label className="gh-settings-toggle">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange?.(e.target.checked)}
                    disabled={disabled}
                />
                <span className="gh-settings-toggle-track" aria-hidden="true" />
            </label>
        </SettingsBoxRow>
    );
}

export function SettingsEmptyState({ message = 'Not configured yet.', action }) {
    return (
        <div className="gh-settings-empty">
            <p>{message}</p>
            {action}
        </div>
    );
}

export function SettingsPanelToolbar({ children }) {
    return <div className="gh-settings-panel-toolbar">{children}</div>;
}

export function SettingsNotice({ children }) {
    return <div className="gh-settings-notice">{children}</div>;
}

export function SettingsTable({ columns, children, empty }) {
    if (empty) {
        return (
            <div className="gh-settings-table gh-settings-table--empty">
                {empty}
            </div>
        );
    }

    const gridCols = columns?.length
        ? { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) auto` }
        : undefined;

    return (
        <div className="gh-settings-table">
            {columns?.length > 0 && (
                <div className="gh-settings-table-head" style={gridCols}>
                    {columns.map(col => (
                        <span key={col}>{col}</span>
                    ))}
                    <span className="gh-settings-table-actions" aria-hidden="true" />
                </div>
            )}
            <div className="gh-settings-table-body">{children}</div>
        </div>
    );
}

export function SettingsTableRow({ cells, actions, children }) {
    if (children) {
        return <div className="gh-settings-table-row">{children}</div>;
    }

    const gridCols = {
        gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))${actions ? ' auto' : ''}`,
    };

    return (
        <div className="gh-settings-table-row" style={gridCols}>
            {cells.map((cell, i) => (
                <div key={i} className="gh-settings-table-cell">{cell}</div>
            ))}
            {actions && <div className="gh-settings-table-actions">{actions}</div>}
        </div>
    );
}

export function SettingsRadioGroup({ name, value, onChange, options, disabled }) {
    return (
        <div className="gh-settings-radio-group">
            {options.map(opt => (
                <label
                    key={opt.value}
                    className={`gh-settings-radio${value === opt.value ? ' active' : ''}`}
                >
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange?.(opt.value)}
                        disabled={disabled}
                    />
                    <div>
                        <strong>{opt.label}</strong>
                        {opt.description && <span>{opt.description}</span>}
                    </div>
                </label>
            ))}
        </div>
    );
}

export function SettingsSubTabs({ tabs, active, onChange }) {
    return (
        <div className="gh-settings-subtabs" role="tablist">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active === tab.id}
                    className={`gh-settings-subtab${active === tab.id ? ' active' : ''}`}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

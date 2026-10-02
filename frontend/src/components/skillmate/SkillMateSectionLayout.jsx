import { PlusIcon, SearchIcon } from '../pages/icons';

export function SkillMateSectionLayout({
    title,
    desc,
    search,
    onSearchChange,
    searchPlaceholder = 'Поиск',
    actionLabel,
    onAction,
    stats,
    children,
}) {
    return (
        <div className="skillmate-page">
            <div className="skillmate-page-inner">
                <header className="skillmate-page-head">
                    <div className="skillmate-page-head-text">
                        <h1>{title}</h1>
                        {desc && <p>{desc}</p>}
                    </div>
                    {(search !== undefined || actionLabel) && (
                        <div className="skillmate-page-head-tools">
                            {search !== undefined && (
                                <div className="skillmate-page-search">
                                    <SearchIcon />
                                    <input
                                        type="search"
                                        placeholder={searchPlaceholder}
                                        value={search}
                                        onChange={e => onSearchChange?.(e.target.value)}
                                    />
                                </div>
                            )}
                            {actionLabel && (
                                <button
                                    type="button"
                                    className="skillmate-page-head-add"
                                    aria-label={actionLabel}
                                    onClick={onAction}
                                >
                                    <PlusIcon />
                                </button>
                            )}
                        </div>
                    )}
                </header>

                {stats?.length > 0 && (
                    <div className="skillmate-page-stats">
                        {stats.map(({ label, value }) => (
                            <div key={label} className="skillmate-page-stat">
                                <strong>{value}</strong>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="skillmate-page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function SkillMatePageBlock({ title, linkLabel, children }) {
    return (
        <section className="skillmate-page-block">
            {linkLabel ? (
                <button type="button" className="skillmate-page-block-title skillmate-page-block-title--link">
                    {title}
                    <span aria-hidden="true">›</span>
                </button>
            ) : (
                <h2 className="skillmate-page-block-title">{title}</h2>
            )}
            {children}
        </section>
    );
}

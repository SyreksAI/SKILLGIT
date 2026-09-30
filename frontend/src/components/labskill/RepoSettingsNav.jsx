import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../pages/icons';
import { getSettingsGroupForSection, SETTINGS_SIDEBAR } from '../../data/settingsNavData';

function getDefaultOpenGroups(section) {
    const open = new Set();
    const activeGroup = getSettingsGroupForSection(section);
    if (activeGroup) open.add(activeGroup);
    return open;
}

export function RepoSettingsNav({ section, onChangeSection }) {
    const [openGroups, setOpenGroups] = useState(() => getDefaultOpenGroups(section));

    useEffect(() => {
        const activeGroup = getSettingsGroupForSection(section);
        if (activeGroup) {
            setOpenGroups(prev => new Set([...prev, activeGroup]));
        }
    }, [section]);

    const openSet = useMemo(() => openGroups, [openGroups]);

    function toggleGroup(groupId) {
        setOpenGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
    }

    return (
        <nav className="gh-repo-settings-nav" aria-label="Settings">
            {SETTINGS_SIDEBAR.map((item, index) => {
                if (item.kind === 'heading') {
                    return (
                        <div key={`heading-${item.label}`} className="gh-repo-settings-nav-heading">
                            {item.label}
                        </div>
                    );
                }

                if (item.kind === 'divider') {
                    return <div key={`divider-${index}`} className="gh-repo-settings-nav-divider" />;
                }

                if (item.kind === 'link') {
                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`gh-repo-settings-nav-item${section === item.id ? ' active' : ''}`}
                            onClick={() => onChangeSection(item.id)}
                        >
                            <span className="gh-repo-settings-nav-label">{item.label}</span>
                        </button>
                    );
                }

                if (item.kind === 'group') {
                    const isOpen = openSet.has(item.id);
                    const isGroupActive = item.children.some(child => child.id === section);

                    return (
                        <div key={item.id} className="gh-repo-settings-nav-group">
                            <button
                                type="button"
                                className={`gh-repo-settings-nav-item gh-repo-settings-nav-item--group${isGroupActive ? ' has-active-child' : ''}`}
                                onClick={() => toggleGroup(item.id)}
                                aria-expanded={isOpen}
                            >
                                <span className="gh-repo-settings-nav-label">{item.label}</span>
                                <span className="gh-repo-settings-nav-chevron">
                                    {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                </span>
                            </button>
                            {isOpen && (
                                <div className="gh-repo-settings-nav-children">
                                    {item.children.map(child => (
                                        <button
                                            key={child.id}
                                            type="button"
                                            className={`gh-repo-settings-nav-subitem${section === child.id ? ' active' : ''}`}
                                            onClick={() => onChangeSection(child.id)}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                }

                return null;
            })}
        </nav>
    );
}

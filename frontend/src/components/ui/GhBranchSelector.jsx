import { useEffect, useMemo, useRef, useState } from 'react';
import { GitBranchIcon, SearchIcon, CheckIcon } from '../pages/icons';

export function GhBranchSelector({
    branches,
    selectedBranch,
    onSelect,
    onViewAll,
    onClose,
    anchorRef,
}) {
    const panelRef = useRef(null);
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return branches;
        const q = query.toLowerCase();
        return branches.filter(branch => branch.name.toLowerCase().includes(q));
    }, [branches, query]);

    useEffect(() => {
        function handleClickOutside(e) {
            const root = anchorRef?.current ?? panelRef.current;
            if (root && !root.contains(e.target)) onClose?.();
        }
        function handleEscape(e) {
            if (e.key === 'Escape') onClose?.();
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [anchorRef, onClose]);

    return (
        <div className="gh-branch-panel" ref={panelRef}>
            <div className="gh-branch-panel-search">
                <SearchIcon />
                <input
                    type="search"
                    placeholder="Find a branch..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="gh-branch-panel-section">
                <header>Branches</header>
                <ul className="gh-branch-panel-list">
                    {filtered.length === 0 ? (
                        <li className="gh-branch-panel-empty">No branches found</li>
                    ) : (
                        filtered.map(branch => (
                            <li key={branch.name}>
                                <button
                                    type="button"
                                    className={`gh-branch-panel-item${selectedBranch === branch.name ? ' active' : ''}`}
                                    onClick={() => {
                                        onSelect?.(branch.name);
                                        onClose?.();
                                    }}
                                >
                                    <GitBranchIcon />
                                    <span className="gh-branch-panel-name">{branch.name}</span>
                                    {branch.default && <span className="gh-branch-panel-badge">default</span>}
                                    {selectedBranch === branch.name && <CheckIcon />}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <footer className="gh-branch-panel-footer">
                <button type="button" className="gh-link-btn" onClick={() => { onViewAll?.(); onClose?.(); }}>
                    View all branches
                </button>
            </footer>
        </div>
    );
}

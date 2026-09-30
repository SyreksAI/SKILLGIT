import React, { useEffect, useRef, useState } from 'react';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { TerminalIcon, CopyIcon, HelpCircleIcon, CheckIcon } from '../pages/icons';

const CLONE_TABS = [
    { id: 'https', label: 'HTTPS' },
    { id: 'ssh', label: 'SSH' },
];

function buildCloneValue(tab, owner, repoName) {
    if (tab === 'ssh') {
        return `git@labskill.skillgit.ru:${owner}/${repoName}.git`;
    }
    return `https://labskill.skillgit.ru/${owner}/${repoName}.git`;
}

function cloneHint(tab) {
    return tab === 'ssh'
        ? 'Clone using SSH.'
        : 'Clone using the web URL.';
}

export function GhClonePanel({ owner, repoName, anchorRef, onClose }) {
    const panelRef = useRef(null);
    const { recordRepoClone } = useLabSkillRepos();
    const [tab, setTab] = useState('https');
    const [copied, setCopied] = useState(false);

    const cloneValue = buildCloneValue(tab, owner, repoName);

    useEffect(() => {
        function handleClickOutside(e) {
            const root = anchorRef?.current ?? panelRef.current;
            if (root && !root.contains(e.target)) {
                onClose?.();
            }
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

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(cloneValue);
            recordRepoClone(owner, repoName);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    }

    return (
        <div className="gh-clone-panel" ref={panelRef}>
            <header className="gh-clone-head">
                <div className="gh-clone-head-title">
                    <TerminalIcon />
                    <strong>Clone</strong>
                </div>
                <button type="button" className="gh-clone-help" aria-label="Справка о клонировании">
                    <HelpCircleIcon />
                </button>
            </header>

            <div className="gh-clone-tabs" role="tablist">
                {CLONE_TABS.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.id}
                        className={`gh-clone-tab${tab === item.id ? ' active' : ''}`}
                        onClick={() => setTab(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="gh-clone-input-row">
                <input
                    type="text"
                    className="gh-clone-input"
                    value={cloneValue}
                    readOnly
                    aria-label="Clone URL"
                />
                <button
                    type="button"
                    className={`gh-clone-copy${copied ? ' gh-clone-copy--done' : ''}`}
                    onClick={handleCopy}
                    aria-label={copied ? 'Copied' : 'Copy to clipboard'}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>

            <p className="gh-clone-hint">{cloneHint(tab)}</p>
        </div>
    );
}

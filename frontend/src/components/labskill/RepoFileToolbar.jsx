import React, { useEffect, useRef, useState } from 'react';
import { formatFileSize, getFileStats } from '../../utils/repoFiles';
import {
    AgentsIcon,
    ChevronDownIcon,
    CodeIcon,
    CopyIcon,
    DownloadIcon,
    FileIcon,
    PlusIcon,
} from '../pages/icons';

const FILE_VIEWS = [
    { id: 'code', label: 'Code' },
    { id: 'blame', label: 'Blame' },
];

function EditIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
    );
}

export function RepoFileToolbar({
    filename,
    content,
    size,
    view,
    onViewChange,
    onAddFile,
    onToggleRaw,
    isRaw,
    onCopy,
    onDownload,
    copyLabel = 'Copy',
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const editRef = useRef(null);
    const stats = getFileStats(content, size);

    useEffect(() => {
        if (!editOpen) return undefined;

        function handleClickOutside(e) {
            if (editRef.current && !editRef.current.contains(e.target)) {
                setEditOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editOpen]);

    async function handleCopy() {
        if (!content) return;
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="gh-file-toolbar">
            <div className="gh-file-toolbar-left">
                <div className="gh-file-view-tabs" role="tablist" aria-label="File view">
                    {FILE_VIEWS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={view === id}
                            className={`gh-file-view-tab${view === id ? ' active' : ''}`}
                            onClick={() => onViewChange(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <span className="gh-file-toolbar-stats">
                    {stats.lineCount} lines ({stats.loc} loc) · {formatFileSize(stats.bytes)}
                </span>
            </div>

            <div className="gh-file-toolbar-actions">
                <button
                    type="button"
                    className="gh-file-action-btn gh-file-action-btn--stack"
                    aria-label="Create new file"
                    title="Create new file"
                    onClick={onAddFile}
                >
                    <FileIcon />
                    <PlusIcon />
                </button>
                <button
                    type="button"
                    className="gh-file-action-btn"
                    aria-label="Ask SkillMate"
                    title="Ask SkillMate about this file"
                >
                    <AgentsIcon />
                </button>
                <button
                    type="button"
                    className={`gh-file-action-btn gh-file-action-btn--text${isRaw ? ' active' : ''}`}
                    onClick={onToggleRaw}
                >
                    Raw
                </button>
                <button
                    type="button"
                    className="gh-file-action-btn"
                    aria-label="Copy file contents"
                    title={copied ? 'Copied' : 'Copy raw contents'}
                    onClick={handleCopy}
                >
                    <CopyIcon />
                </button>
                <button
                    type="button"
                    className="gh-file-action-btn"
                    aria-label="Download file"
                    title="Download raw file"
                    onClick={onDownload}
                >
                    <DownloadIcon />
                </button>
                <div className="gh-file-action-dropdown" ref={editRef}>
                    <button
                        type="button"
                        className={`gh-file-action-btn gh-file-action-btn--split${editOpen ? ' active' : ''}`}
                        aria-expanded={editOpen}
                        onClick={() => setEditOpen(open => !open)}
                    >
                        <EditIcon />
                        <ChevronDownIcon />
                    </button>
                    {editOpen && (
                        <div className="gh-file-action-menu">
                            <button type="button" onClick={() => setEditOpen(false)}>Edit file</button>
                            <button type="button" onClick={() => setEditOpen(false)}>Open in editor</button>
                            <button type="button" onClick={() => setEditOpen(false)}>Delete file</button>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className={`gh-file-action-btn${!isRaw && view === 'code' ? ' active' : ''}`}
                    aria-label="Toggle code view"
                    title="Code view"
                    onClick={() => {
                        onViewChange('code');
                        if (isRaw) onToggleRaw();
                    }}
                >
                    <CodeIcon />
                </button>
            </div>
            {copied && <span className="gh-file-toolbar-toast" role="status">{copyLabel}</span>}
        </div>
    );
}

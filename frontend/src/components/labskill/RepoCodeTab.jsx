import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GhFileUploadZone } from '../ui/GhFileUploadZone';
import { GhMarkdown } from '../ui/GhMarkdown';
import { GhClonePanel } from '../ui/GhClonePanel';
import { GhCodeBlock } from '../ui/GhCodeBlock';
import { RepoFileToolbar } from './RepoFileToolbar';
import { GhFileBlame } from './GhFileBlame';
import { GhBranchSelector } from '../ui/GhBranchSelector';
import { RepoCommitsList } from './RepoCommitsList';
import { RepoCommitDetail } from './RepoCommitDetail';
import { RepoBranchesView } from './RepoBranchesView';
import { RepoTagsView } from './RepoTagsView';
import { getDefaultBranchName, getRepoBranches, getRepoTags } from '../../data/branchData';
import {
    buildFileTree,
    formatFileSize,
    getReadmeContent,
    processProjectUpload,
} from '../../utils/repoFiles';
import { findCommitBySha } from '../../utils/commitUtils';
import {
    CodeIcon,
    FileIcon,
    FolderIcon,
    HistoryIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    SearchIcon,
    BookIcon,
    GitBranchIcon,
    TagIcon,
} from '../pages/icons';

export function RepoCodeTab({
    repo,
    owner,
    repoName,
    onUpload,
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const uploadRef = useRef(null);
    const folderRef = useRef(null);
    const codeDropdownRef = useRef(null);
    const branchDropdownRef = useRef(null);
    const addFileDropdownRef = useRef(null);
    const fileSearchRef = useRef(null);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [addFileOpen, setAddFileOpen] = useState(false);
    const [codeOpen, setCodeOpen] = useState(false);
    const [branchOpen, setBranchOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [fileSearch, setFileSearch] = useState('');
    const [fileView, setFileView] = useState('code');
    const [fileRaw, setFileRaw] = useState(false);

    const currentPath = searchParams.get('path') || '';
    const activeFile = searchParams.get('file') || '';
    const commitsView = searchParams.has('commits');
    const branchesView = searchParams.has('branches');
    const tagsView = searchParams.has('tags');
    const activeCommitSha = searchParams.get('commit') || '';
    const defaultBranch = getDefaultBranchName(repo, repoName);
    const selectedBranch = searchParams.get('branch') || defaultBranch;
    const branches = useMemo(() => getRepoBranches(repo, repoName), [repo, repoName]);
    const tags = useMemo(() => getRepoTags(repo, repoName), [repo, repoName]);
    const activeBranchMeta = useMemo(
        () => branches.find(b => b.name === selectedBranch) ?? branches[0],
        [branches, selectedBranch],
    );
    const activeCommit = useMemo(
        () => findCommitBySha(repo.commits, activeCommitSha),
        [repo.commits, activeCommitSha],
    );

    const tree = useMemo(() => {
        let items = buildFileTree(repo.files || [], currentPath);
        if (fileSearch.trim()) {
            const q = fileSearch.toLowerCase();
            items = items.filter(item => item.name.toLowerCase().includes(q));
        }
        return items;
    }, [repo, currentPath, fileSearch]);

    const selectedFile = useMemo(() => {
        if (!activeFile) return null;
        return repo.files?.find(f => f.path === activeFile) ?? null;
    }, [repo, activeFile]);

    const readme = useMemo(() => {
        if (activeFile) return null;
        return getReadmeContent(repo.files || []);
    }, [repo, activeFile]);

    const breadcrumbs = useMemo(() => {
        const parts = currentPath ? currentPath.split('/') : [];
        const crumbs = [{ label: repoName, path: '' }];
        let acc = '';
        for (const part of parts) {
            acc = acc ? `${acc}/${part}` : part;
            crumbs.push({ label: part, path: acc });
        }
        return crumbs;
    }, [currentPath, repoName]);

    const latestCommit = repo.commits?.[0];
    const commitCount = repo.commits?.length ?? 1;
    const branchCount = branches.length;
    const tagCount = tags.length;

    useEffect(() => {
        function handleClickOutside(e) {
            if (addFileOpen && addFileDropdownRef.current && !addFileDropdownRef.current.contains(e.target)) {
                setAddFileOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [addFileOpen]);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key !== 't' || e.metaKey || e.ctrlKey || e.altKey) return;
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
            e.preventDefault();
            fileSearchRef.current?.focus();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    function openFolder(path) {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('path', path);
            p.delete('file');
            return p;
        }, { replace: true });
    }

    function openFile(path) {
        setFileView('code');
        setFileRaw(false);
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('file', path);
            return p;
        }, { replace: true });
    }

    function downloadActiveFile() {
        if (!selectedFile?.content || !activeFile) return;
        const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = activeFile.split('/').pop();
        link.click();
        URL.revokeObjectURL(url);
    }

    function openAddFileInFolder() {
        const folderPath = activeFile.includes('/')
            ? activeFile.split('/').slice(0, -1).join('/')
            : '';
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (folderPath) p.set('path', folderPath);
            else p.delete('path');
            p.delete('file');
            return p;
        }, { replace: true });
        setUploadOpen(true);
    }

    function goToRoot() {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.delete('path');
            p.delete('file');
            p.delete('commits');
            p.delete('commit');
            p.delete('branches');
            p.delete('tags');
            return p;
        }, { replace: true });
    }

    function selectBranch(name) {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (!name || name === defaultBranch) p.delete('branch');
            else p.set('branch', name);
            p.delete('branches');
            p.delete('tags');
            p.delete('commits');
            p.delete('commit');
            return p;
        }, { replace: true });
    }

    function openBranchesView() {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('branches', '1');
            p.delete('tags');
            p.delete('commits');
            p.delete('commit');
            p.delete('path');
            p.delete('file');
            return p;
        }, { replace: true });
    }

    function openTagsView() {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('tags', '1');
            p.delete('branches');
            p.delete('commits');
            p.delete('commit');
            p.delete('path');
            p.delete('file');
            return p;
        }, { replace: true });
    }

    function openCommitsList() {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('commits', '1');
            p.delete('path');
            p.delete('file');
            p.delete('commit');
            return p;
        }, { replace: true });
    }

    function openCommit(sha) {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('commit', sha);
            p.delete('commits');
            p.delete('path');
            p.delete('file');
            return p;
        }, { replace: true });
    }

    async function handleQuickUpload(fileList) {
        const { files } = await processProjectUpload(fileList);
        onUpload(files);
        setUploadOpen(false);
        setAddFileOpen(false);
        setUploadFiles([]);
    }

    async function handlePanelUpload() {
        if (!uploadFiles.length) return;
        onUpload(uploadFiles);
        setUploadOpen(false);
        setAddFileOpen(false);
        setUploadFiles([]);
    }

    if (branchesView) {
        return (
            <RepoBranchesView
                repo={repo}
                repoName={repoName}
                owner={owner}
                selectedBranch={selectedBranch}
                onSelectBranch={name => {
                    selectBranch(name);
                    setSearchParams(prev => {
                        const p = new URLSearchParams(prev);
                        p.delete('branches');
                        return p;
                    }, { replace: true });
                }}
            />
        );
    }

    if (tagsView) {
        return (
            <RepoTagsView
                repo={repo}
                repoName={repoName}
                owner={owner}
            />
        );
    }

    if (commitsView) {
        return (
            <RepoCommitsList
                repo={repo}
                owner={owner}
                repoName={repoName}
                selectedBranch={selectedBranch}
                onSelectCommit={openCommit}
            />
        );
    }

    if (activeCommitSha) {
        if (!activeCommit) {
            return (
                <div className="gh-repo-commits">
                    <div className="gh-repo-empty-state">
                        <p>Commit not found.</p>
                        <button type="button" className="gh-link-btn" onClick={openCommitsList}>
                            Back to commits
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <RepoCommitDetail
                repo={repo}
                owner={owner}
                repoName={repoName}
                commit={activeCommit}
                onBackToList={openCommitsList}
                onOpenFile={path => openFile(path)}
            />
        );
    }

    if (activeFile) {
        return (
            <div className="gh-repo-file-view">
                <nav className="gh-repo-breadcrumbs">
                    <Link to={`/labskill/${owner}/${repoName}`} onClick={e => { e.preventDefault(); goToRoot(); }}>
                        {repoName}
                    </Link>
                    {breadcrumbs.slice(1).map(crumb => (
                        <React.Fragment key={crumb.path}>
                            <ChevronRightIcon />
                            {crumb.path === activeFile.split('/').slice(0, -1).join('/') ? (
                                <span>{crumb.label}</span>
                            ) : (
                                <button type="button" className="gh-link-btn" onClick={() => openFolder(crumb.path)}>
                                    {crumb.label}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                    <ChevronRightIcon />
                    <strong>{activeFile.split('/').pop()}</strong>
                </nav>

                {selectedFile?.isBinary || selectedFile?.content == null ? (
                    <>
                        <div className="gh-repo-file-meta">
                            <span>{formatFileSize(selectedFile?.size)}</span>
                            {selectedFile?.isBinary && <span className="gh-upload-badge">binary</span>}
                            <button type="button" className="gh-link-btn" onClick={() => {
                                setSearchParams(prev => {
                                    const p = new URLSearchParams(prev);
                                    p.delete('file');
                                    return p;
                                }, { replace: true });
                            }}>
                                ← Back to files
                            </button>
                        </div>
                        <div className="gh-repo-code">
                            <div className="gh-repo-binary">
                                <FileIcon />
                                <p>Binary file — preview unavailable</p>
                                <span>{formatFileSize(selectedFile?.size)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <RepoFileToolbar
                            filename={activeFile}
                            content={selectedFile.content}
                            size={selectedFile.size}
                            view={fileView}
                            onViewChange={(nextView) => {
                                setFileView(nextView);
                                if (nextView === 'blame') setFileRaw(false);
                            }}
                            onAddFile={openAddFileInFolder}
                            isRaw={fileRaw}
                            onToggleRaw={() => {
                                setFileRaw(raw => !raw);
                                if (!fileRaw) setFileView('code');
                            }}
                            onDownload={downloadActiveFile}
                            copyLabel="Copied!"
                        />
                        {fileRaw ? (
                            <div className="gh-file-raw">
                                <pre>{selectedFile.content}</pre>
                            </div>
                        ) : fileView === 'blame' ? (
                            <GhFileBlame
                                filename={activeFile}
                                content={selectedFile.content}
                                commit={latestCommit}
                            />
                        ) : (
                            <GhCodeBlock
                                filename={activeFile}
                                content={selectedFile.content}
                                showHeader={false}
                            />
                        )}
                    </>
                )}
            </div>
        );
    }

    return (
        <>
            {selectedBranch !== defaultBranch && activeBranchMeta && (
                <div className="gh-repo-branch-banner">
                    <GitBranchIcon />
                    <span>
                        This branch is <strong>{activeBranchMeta.ahead ?? 0} commit{(activeBranchMeta.ahead ?? 0) !== 1 ? 's' : ''} ahead</strong>
                        {activeBranchMeta.behind ? (
                            <>, <strong>{activeBranchMeta.behind} behind</strong></>
                        ) : null}
                        {' '}{defaultBranch}.
                    </span>
                    <button type="button" className="gh-link-btn" onClick={() => selectBranch(defaultBranch)}>
                        Switch to {defaultBranch}
                    </button>
                </div>
            )}

            <div className="gh-repo-toolbar">
                <div className="gh-repo-toolbar-left">
                    <div className="gh-repo-dropdown" ref={branchDropdownRef}>
                        <button
                            type="button"
                            className={`gh-repo-branch${branchOpen ? ' gh-repo-branch--open' : ''}`}
                            onClick={() => {
                                setBranchOpen(v => !v);
                                setCodeOpen(false);
                                setAddFileOpen(false);
                            }}
                            aria-expanded={branchOpen}
                        >
                            <GitBranchIcon />
                            <span>{selectedBranch}</span>
                            <ChevronDownIcon />
                        </button>
                        {branchOpen && (
                            <GhBranchSelector
                                branches={branches}
                                selectedBranch={selectedBranch}
                                onSelect={selectBranch}
                                onViewAll={openBranchesView}
                                onClose={() => setBranchOpen(false)}
                                anchorRef={branchDropdownRef}
                            />
                        )}
                    </div>
                    <button type="button" className="gh-repo-meta-link gh-link-btn" onClick={openBranchesView}>
                        <GitBranchIcon />
                        {branchCount} Branch{branchCount !== 1 ? 'es' : ''}
                    </button>
                    <button type="button" className="gh-repo-meta-link gh-link-btn" onClick={openTagsView}>
                        <TagIcon />
                        {tagCount} Tag{tagCount !== 1 ? 's' : ''}
                    </button>
                </div>
                <div className="gh-repo-toolbar-right">
                    <div className="gh-repo-file-search">
                        <SearchIcon />
                        <input
                            ref={fileSearchRef}
                            type="search"
                            placeholder="Go to file"
                            value={fileSearch}
                            onChange={e => setFileSearch(e.target.value)}
                        />
                        <kbd>t</kbd>
                    </div>
                    <div className="gh-repo-dropdown" ref={addFileDropdownRef}>
                        <button
                            type="button"
                            className="gh-repo-action-btn gh-repo-action-btn--split"
                            onClick={() => {
                                setAddFileOpen(v => !v);
                                setCodeOpen(false);
                                setBranchOpen(false);
                            }}
                        >
                            Add file
                            <ChevronDownIcon />
                        </button>
                        {addFileOpen && (
                            <div className="gh-repo-dropdown-menu">
                                <button type="button" onClick={() => { uploadRef.current?.click(); setAddFileOpen(false); }}>
                                    Upload files
                                </button>
                                <button type="button" onClick={() => { folderRef.current?.click(); setAddFileOpen(false); }}>
                                    Upload folder
                                </button>
                                <button type="button" onClick={() => { setUploadOpen(true); setAddFileOpen(false); }}>
                                    Open upload panel
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="gh-repo-dropdown" ref={codeDropdownRef}>
                        <button
                            type="button"
                            className={`gh-btn-green gh-btn-green--split${codeOpen ? ' gh-btn-green--open' : ''}`}
                            onClick={() => setCodeOpen(v => !v)}
                            aria-expanded={codeOpen}
                        >
                            <CodeIcon />
                            Code
                            <ChevronDownIcon />
                        </button>
                        {codeOpen && (
                            <GhClonePanel
                                owner={owner}
                                repoName={repoName}
                                anchorRef={codeDropdownRef}
                                onClose={() => setCodeOpen(false)}
                            />
                        )}
                    </div>
                    <input ref={uploadRef} type="file" multiple hidden onChange={e => { handleQuickUpload(e.target.files); e.target.value = ''; }} />
                    <input ref={folderRef} type="file" multiple hidden webkitdirectory="" directory="" onChange={e => { handleQuickUpload(e.target.files); e.target.value = ''; }} />
                </div>
            </div>

            {uploadOpen && (
                <div className="gh-repo-upload-panel">
                    <GhFileUploadZone files={uploadFiles} onChange={setUploadFiles} />
                    <div className="gh-repo-upload-actions">
                        <button type="button" className="gh-create-btn gh-create-btn--ghost" onClick={() => setUploadOpen(false)}>Cancel</button>
                        <button type="button" className="gh-create-btn gh-create-btn--primary" disabled={!uploadFiles.length} onClick={handlePanelUpload}>
                            Commit files
                        </button>
                    </div>
                </div>
            )}

            <div className={`gh-repo-file-table${latestCommit ? '' : ' gh-repo-file-table--solo'}`}>
            {latestCommit && (
                <div className="gh-repo-commit-bar">
                    <div className="gh-repo-commit-author">
                        <span className="gh-repo-commit-avatar">{latestCommit.author.charAt(0)}</span>
                        <span className="gh-repo-commit-author-name">{latestCommit.author}</span>
                        <span>{latestCommit.message}</span>
                    </div>
                    <div className="gh-repo-commit-meta">
                        <button
                            type="button"
                            className="gh-repo-commit-sha gh-link-btn"
                            onClick={() => openCommit(latestCommit.sha)}
                        >
                            {latestCommit.sha}
                        </button>
                        <span>{latestCommit.date}</span>
                        <button
                            type="button"
                            className="gh-repo-commit-count gh-link-btn"
                            onClick={openCommitsList}
                        >
                            <HistoryIcon />
                            {commitCount} Commit{commitCount !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            )}

            <div className={`gh-repo-files${latestCommit ? '' : ' gh-repo-files--solo'}`}>
                {currentPath && (
                    <button
                        type="button"
                        className="gh-repo-file-row gh-repo-file-row--back"
                        onClick={() => {
                            const parts = currentPath.split('/');
                            parts.pop();
                            if (parts.length) openFolder(parts.join('/'));
                            else goToRoot();
                        }}
                    >
                        <span className="gh-repo-file-icon">↩</span>
                        <span className="gh-repo-file-name">..</span>
                    </button>
                )}
                {tree.map(item => (
                    item.type === 'dir' ? (
                        <button key={item.path} type="button" className="gh-repo-file-row" onClick={() => openFolder(item.displayPath || item.path)}>
                            <span className="gh-repo-file-icon"><FolderIcon /></span>
                            <span className="gh-repo-file-name">{item.name}</span>
                            <span className="gh-repo-file-msg">{latestCommit?.message ?? 'Initial commit'}</span>
                            <span className="gh-repo-file-date">{repo.updated}</span>
                        </button>
                    ) : (
                        <button key={item.path} type="button" className="gh-repo-file-row" onClick={() => openFile(item.path)}>
                            <span className="gh-repo-file-icon"><FileIcon /></span>
                            <span className="gh-repo-file-name">{item.name}</span>
                            <span className="gh-repo-file-msg">{latestCommit?.message ?? 'Initial commit'}</span>
                            <span className="gh-repo-file-date">{repo.updated}</span>
                        </button>
                    )
                ))}
            </div>
            </div>

            {readme ? (
                <article className="gh-repo-readme">
                    <header className="gh-repo-readme-head"><BookIcon /><span>README</span></header>
                    <div className="gh-repo-readme-body"><GhMarkdown content={readme} /></div>
                </article>
            ) : (
                <article className="gh-repo-readme">
                    <header className="gh-repo-readme-head"><BookIcon /><span>README</span></header>
                    <div className="gh-repo-readme-empty">
                        <BookIcon />
                        <h3>Add a README</h3>
                        <p>Help people interested in this repository understand your project.</p>
                        <button type="button" className="gh-btn-green">Add a README</button>
                    </div>
                </article>
            )}
        </>
    );
}

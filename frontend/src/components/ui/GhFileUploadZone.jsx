import React, { useRef, useState } from 'react';
import { UploadIcon, FolderIcon, FileIcon, XIcon } from '../pages/icons';
import {
    collectFilesFromDataTransfer,
    formatFileSize,
    mergeUploadedFiles,
    normalizeAndAnalyze,
    processProjectUpload,
    readUploadFileList,
} from '../../utils/repoFiles';

export function GhFileUploadZone({ files, onChange, onAnalysis }) {
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);

    async function applyUpload(rawFiles) {
        if (!rawFiles?.length) return;

        setLoading(true);
        try {
            const read = await readUploadFileList(Array.from(rawFiles));
            const merged = mergeUploadedFiles(files, read);
            const { files: normalized, analysis } = normalizeAndAnalyze(merged);

            onChange(normalized);
            onAnalysis?.(analysis);
        } finally {
            setLoading(false);
        }
    }

    async function onDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const collected = await collectFilesFromDataTransfer(e.dataTransfer);
        await applyUpload(collected);
    }

    async function onFolderSelect(fileList) {
        setLoading(true);
        try {
            const { files: normalized } = await processProjectUpload(fileList);
            const merged = mergeUploadedFiles(files, normalized);
            const { files: finalFiles, analysis } = normalizeAndAnalyze(merged);

            onChange(finalFiles);
            onAnalysis?.(analysis);
        } finally {
            setLoading(false);
        }
    }

    function removeFile(path) {
        const next = files.filter(file => file.path !== path);
        const { analysis } = normalizeAndAnalyze(next);
        onChange(next);
        onAnalysis?.(analysis.fileCount ? analysis : null);
    }

    function clearAll() {
        onChange([]);
        onAnalysis?.(null);
    }

    return (
        <div className="gh-upload">
            <div
                className={`gh-upload-drop${dragOver ? ' gh-upload-drop--active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
            >
                <UploadIcon />
                <strong>Drag and drop files or a folder here</strong>
                <p>Upload individual files or an entire project folder</p>
                <div className="gh-upload-actions">
                    <button
                        type="button"
                        className="gh-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        <FileIcon />
                        Choose files
                    </button>
                    <button
                        type="button"
                        className="gh-upload-btn"
                        onClick={() => folderInputRef.current?.click()}
                        disabled={loading}
                    >
                        <FolderIcon />
                        Choose folder
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={e => {
                        applyUpload(e.target.files);
                        e.target.value = '';
                    }}
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    hidden
                    webkitdirectory=""
                    directory=""
                    onChange={e => {
                        onFolderSelect(e.target.files);
                        e.target.value = '';
                    }}
                />
            </div>

            {loading && <p className="gh-upload-status">Reading files...</p>}

            {files.length > 0 && (
                <div className="gh-upload-list">
                    <div className="gh-upload-list-head">
                        <span>{files.length} file(s) ready to upload</span>
                        <button type="button" className="gh-link-btn" onClick={clearAll}>
                            Clear all
                        </button>
                    </div>
                    <ul>
                        {files.map(file => (
                            <li key={file.path}>
                                <FileIcon />
                                <span className="gh-upload-path" title={file.path}>{file.path}</span>
                                <span className="gh-upload-size">{formatFileSize(file.size)}</span>
                                {file.isBinary && <span className="gh-upload-badge">binary</span>}
                                <button
                                    type="button"
                                    className="gh-upload-remove"
                                    aria-label="Remove file"
                                    onClick={() => removeFile(file.path)}
                                >
                                    <XIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

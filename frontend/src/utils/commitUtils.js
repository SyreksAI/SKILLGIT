export function countLines(content) {
    if (content == null || content === '') return 0;
    return content.split('\n').length;
}

export function buildCommitChanges(files, status = 'added') {
    return (files || []).map(file => ({
        path: file.path,
        status,
        additions: countLines(file.content) || 1,
        deletions: 0,
    }));
}

export function buildUploadCommitChanges(existingFiles, newFiles) {
    const existing = new Set((existingFiles || []).map(file => file.path));

    return (newFiles || []).map(file => {
        const isModified = existing.has(file.path);
        const lines = countLines(file.content) || 1;

        return {
            path: file.path,
            status: isModified ? 'modified' : 'added',
            additions: lines,
            deletions: isModified ? Math.min(8, Math.max(1, Math.floor(lines / 4))) : 0,
        };
    });
}

export function findCommitBySha(commits, sha) {
    if (!sha || !commits?.length) return null;
    const normalized = sha.toLowerCase();
    return commits.find(commit => (
        commit.sha === sha
        || commit.sha?.toLowerCase() === normalized
        || commit.sha?.toLowerCase().startsWith(normalized)
    )) ?? null;
}

export function formatCommitStats(changes = []) {
    let additions = 0;
    let deletions = 0;

    for (const change of changes) {
        additions += change.additions ?? 0;
        deletions += change.deletions ?? 0;
    }

    return { additions, deletions, files: changes.length };
}

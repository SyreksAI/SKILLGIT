const DAYS_AGO_BY_REPO_ID = {
    1: 2,
    2: 5,
    3: 1,
    4: 14,
    5: 7,
    6: 3,
    7: 21,
    8: 30,
};

export function repoUpdatedAt(repo) {
    if (repo.updatedAt) return repo.updatedAt;
    const days = DAYS_AGO_BY_REPO_ID[repo.id];
    if (days != null) return Date.now() - days * 86400000;
    if (typeof repo.id === 'number') return repo.id;
    return 0;
}

export function mergeSearchRepos(contextRepos, exploreRepos = []) {
    const seen = new Set();
    const merged = [];

    for (const repo of contextRepos) {
        const key = `${repo.owner}/${repo.name}`;
        seen.add(key);
        merged.push(repo);
    }

    for (const repo of exploreRepos) {
        const key = `${repo.owner}/${repo.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(repo);
    }

    return merged;
}

export function formatWebsiteUrl(website) {
    if (!website) return '';
    if (/^https?:\/\//i.test(website)) return website;
    return `https://${website}`;
}

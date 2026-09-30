const REPO_BRANCHES = {
    'syreks-ai-frontend': [
        { name: 'main', default: true, sha: 'a91f3c2', updated: '1 day ago', behind: 0, ahead: 0 },
        { name: 'develop', default: false, sha: 'b72e4d1', updated: '1 week ago', behind: 0, ahead: 2 },
        { name: 'feature/chat-ui', default: false, sha: 'c63d5e0', updated: '2 weeks ago', behind: 1, ahead: 5 },
    ],
    'tinkoff-landing': [
        { name: 'main', default: true, sha: 'f4a8b21', updated: '2 days ago', behind: 0, ahead: 0 },
        { name: 'fix/mobile-nav', default: false, sha: 'e391a10', updated: '1 week ago', behind: 0, ahead: 1 },
    ],
    'vk-mobile-ui': [
        { name: 'main', default: true, sha: '7c2b891', updated: '5 days ago', behind: 0, ahead: 0 },
        { name: 'design/tokens', default: false, sha: '6b1a780', updated: '2 weeks ago', behind: 0, ahead: 3 },
    ],
};

const REPO_TAGS = {
    'syreks-ai-frontend': [
        { name: 'v0.1.0', sha: '8f3a2b1', date: '3 weeks ago', downloads: 12 },
    ],
    'tinkoff-landing': [],
    'vk-mobile-ui': [
        { name: 'v1.0.0', sha: '5a0976f', date: '1 month ago', downloads: 4 },
        { name: 'v0.9.0', sha: '4f8865e', date: '2 months ago', downloads: 2 },
    ],
};

function fallbackBranch(repo) {
    const name = repo.defaultBranch || 'main';
    return [{
        name,
        default: true,
        sha: repo.commits?.[0]?.sha ?? '8f3a2b1',
        updated: repo.updated || 'recently',
        behind: 0,
        ahead: 0,
    }];
}

export function getRepoBranches(repo, repoName) {
    if (repo.branchList?.length) return repo.branchList;
    return REPO_BRANCHES[repoName] ?? fallbackBranch(repo);
}

export function getRepoTags(repo, repoName) {
    if (repo.tagList) return repo.tagList;
    return REPO_TAGS[repoName] ?? [];
}

export function getDefaultBranchName(repo, repoName) {
    const branches = getRepoBranches(repo, repoName);
    return branches.find(b => b.default)?.name ?? repo.defaultBranch ?? 'main';
}

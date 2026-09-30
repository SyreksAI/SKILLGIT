import { CURRENT_USER } from './mockData';
import { getRepoIssues, getRepoPullRequests, getRepoWorkflows } from './repoTabData';
import { formatCommitStats } from '../utils/commitUtils';

const PERIOD_DAYS = {
    '1w': 7,
    '2w': 14,
    '4w': 28,
    '3m': 90,
    '6m': 180,
    '1y': 365,
};

const END_DATE = new Date('2026-09-30T12:00:00');

function formatPulseDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatShortDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function commitsWithDates(commits = []) {
    return commits.map((commit, index) => {
        const parsedDate = new Date(END_DATE);
        parsedDate.setDate(parsedDate.getDate() - index * 2);
        return { ...commit, parsedDate };
    });
}

function filterCommitsByPeriod(commits, period) {
    const days = PERIOD_DAYS[period] ?? 7;
    const cutoff = new Date(END_DATE);
    cutoff.setDate(cutoff.getDate() - days);
    return commitsWithDates(commits).filter(commit => commit.parsedDate >= cutoff);
}

export function getPulseDateRange(period = '1w') {
    const start = new Date(END_DATE);
    start.setDate(start.getDate() - (PERIOD_DAYS[period] ?? 7) + 1);
    return `${formatPulseDate(start)} – ${formatPulseDate(END_DATE)}`;
}

export function getPeriodLabel(period) {
    const labels = {
        '1w': '1 week',
        '2w': '2 weeks',
        '4w': '4 weeks',
        '3m': 'Last 3 months',
        '6m': 'Last 6 months',
        '1y': 'Last year',
        month: 'Current month',
    };
    return labels[period] ?? '1 week';
}

function aggregateCommitStats(commits) {
    const authors = new Set();
    const filesChanged = new Set();
    let additions = 0;
    let deletions = 0;
    const committerMap = {};

    for (const commit of commits) {
        if (commit.author) authors.add(commit.author);
        committerMap[commit.author] = (committerMap[commit.author] || 0) + 1;

        for (const change of commit.changes ?? []) {
            filesChanged.add(change.path);
            additions += change.additions ?? 0;
            deletions += change.deletions ?? 0;
        }
    }

    const topCommitters = Object.entries(committerMap)
        .map(([name, count]) => ({
            name,
            count,
            initial: name.charAt(0).toUpperCase(),
        }))
        .sort((a, b) => b.count - a.count);

    return {
        authors: authors.size,
        commits: commits.length,
        filesChanged: filesChanged.size,
        additions,
        deletions,
        topCommitters,
    };
}

function buildIssueOverview(repoName) {
    const issues = getRepoIssues(repoName);
    const pulls = getRepoPullRequests(repoName);
    const openIssues = issues.filter(item => item.state === 'open').length;
    const closedIssues = issues.filter(item => item.state === 'closed').length;
    const openPulls = pulls.filter(item => item.state === 'open').length;
    const mergedPulls = pulls.filter(item => item.state === 'merged').length;

    return {
        activePullRequests: openPulls,
        activeIssues: openIssues,
        mergedPullRequests: mergedPulls,
        openPullRequests: openPulls,
        closedIssues,
        newIssues: openIssues,
    };
}

export function getRepoPulseData(repo, repoName, period = '1w') {
    const filtered = filterCommitsByPeriod(repo.commits ?? [], period);
    const commitStats = aggregateCommitStats(filtered);

    return {
        dateRange: getPulseDateRange(period),
        branch: repo.defaultBranch || 'main',
        overview: buildIssueOverview(repoName),
        summary: {
            authors: commitStats.authors,
            commitsMain: commitStats.commits,
            commitsAll: commitStats.commits,
            filesChanged: commitStats.filesChanged,
            additions: commitStats.additions,
            deletions: commitStats.deletions,
        },
        topCommitters: commitStats.topCommitters,
    };
}

export function getRepoContributorsData(repo, period = '3m', contribType = 'commits') {
    const filtered = filterCommitsByPeriod(repo.commits ?? [], period);
    const map = {};

    for (const commit of filtered) {
        const name = commit.author || CURRENT_USER.name;
        if (!map[name]) {
            map[name] = { name, commits: 0, additions: 0, deletions: 0 };
        }
        map[name].commits += 1;
        const stats = formatCommitStats(commit.changes);
        map[name].additions += stats.additions;
        map[name].deletions += stats.deletions;
    }

    const list = Object.values(map);
    const sorters = {
        commits: (a, b) => b.commits - a.commits,
        additions: (a, b) => b.additions - a.additions,
        deletions: (a, b) => b.deletions - a.deletions,
    };

    return list.sort(sorters[contribType] ?? sorters.commits);
}

export function getContributorsWeeklyData(repo, period = '3m', contribType = 'commits') {
    const filtered = filterCommitsByPeriod(repo.commits ?? [], period);
    const weeks = period === '1y' ? 26 : period === '6m' ? 18 : 13;
    const buckets = Array.from({ length: weeks }, () => 0);

    filtered.forEach((commit, index) => {
        const bucketIndex = Math.min(weeks - 1, Math.floor((index / Math.max(filtered.length, 1)) * weeks));
        const stats = formatCommitStats(commit.changes);
        if (contribType === 'additions') buckets[bucketIndex] += stats.additions;
        else if (contribType === 'deletions') buckets[bucketIndex] += stats.deletions;
        else buckets[bucketIndex] += 1;
    });

    return buckets.map((count, index) => ({
        label: index === buckets.length - 2 ? 'Sep 21' : index === buckets.length - 1 ? 'Sep 28' : '',
        count,
    }));
}

export function getContributorsDateRange(period = '3m') {
    const start = new Date(END_DATE);
    start.setDate(start.getDate() - (PERIOD_DAYS[period] ?? 90));
    return `Weekly from ${formatPulseDate(start)} to ${formatPulseDate(END_DATE)}`;
}

export function getFullCommunityStandards(repo) {
    const files = repo.files ?? [];
    const names = new Set(files.map(f => f.name.toLowerCase()));
    const hasReadme = names.has('readme.md') || files.some(f => f.name.toLowerCase().startsWith('readme'));
    const hasLicense = names.has('license') || names.has('license.md');

    return [
        { id: 'description', label: 'Description', hint: null, guide: null, done: Boolean(repo.description?.trim()) },
        { id: 'readme', label: 'README', hint: 'READMEs help people understand and use your project.', guide: 'Writing a README', done: hasReadme },
        { id: 'code-of-conduct', label: 'Code of conduct', hint: 'Define standards for how your community engages.', guide: 'Contributor Covenant', done: names.has('code_of_conduct.md') },
        { id: 'contributing', label: 'Contributing', hint: 'Explain how people can contribute to your project.', guide: 'Setting guidelines for repository contributors', done: names.has('contributing.md') },
        { id: 'license', label: 'License', hint: 'Include an open source license to tell others what they can do.', guide: 'Choosing a license', done: hasLicense },
        { id: 'security', label: 'Security policy', hint: 'Define how users should report security vulnerabilities.', guide: 'Adding a security policy', done: names.has('security.md') },
        { id: 'issues', label: 'Issue templates', hint: 'Help community report issues in a structured way.', guide: 'Configuring issue templates', done: files.some(f => f.path.includes('.skillgit/ISSUE_TEMPLATE') || f.path.includes('.github/ISSUE_TEMPLATE')) },
        { id: 'pulls', label: 'Pull request template', hint: 'Help contributors open meaningful pull requests.', guide: 'Creating a pull request template', done: names.has('pull_request_template.md') },
    ];
}

function historyToChart(history = [], key = 'total') {
    return history.map(entry => ({
        label: formatShortDate(new Date(entry.date)),
        value: entry[key] ?? 0,
    }));
}

export function getTrafficCloneData(repo) {
    const history = repo.analytics?.cloneHistory ?? [];
    if (history.length) {
        return history.map(entry => ({
            label: formatShortDate(new Date(entry.date)),
            clones: entry.total ?? 0,
            unique: entry.unique ?? 0,
        }));
    }

    const cloneCount = Math.max(repo.analytics?.clones ?? 0, 0);
    return Array.from({ length: 14 }, (_, index) => {
        const date = new Date('2026-09-16');
        date.setDate(date.getDate() + index);
        const isSpike = index >= 12;
        return {
            label: formatShortDate(date),
            clones: isSpike ? cloneCount : Math.max(cloneCount - 3, 0),
            unique: isSpike ? Math.max(cloneCount - 3, 0) : 0,
        };
    });
}

export function getTrafficVisitorData(repo) {
    const history = repo.analytics?.viewHistory ?? [];
    if (history.length) {
        return history.map(entry => ({
            label: formatShortDate(new Date(entry.date)),
            views: entry.total ?? 0,
            unique: entry.unique ?? 0,
        }));
    }

    return Array.from({ length: 14 }, (_, index) => {
        const date = new Date('2026-09-16');
        date.setDate(date.getDate() + index);
        return {
            label: formatShortDate(date),
            views: 0,
            unique: 0,
        };
    });
}

export function getYearlyCommitsData(repo, period = '1y') {
    const filtered = filterCommitsByPeriod(repo.commits ?? [], period);
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const buckets = months.map(label => ({ label, count: 0 }));

    filtered.forEach((commit, index) => {
        const bucketIndex = Math.min(buckets.length - 1, Math.floor((index / Math.max(filtered.length, 1)) * buckets.length));
        buckets[bucketIndex].count += 1;
    });

    return buckets;
}

export function getCodeFrequencySummary(repo, period = '1y') {
    const filtered = filterCommitsByPeriod(repo.commits ?? [], period);
    let additions = 0;
    let deletions = 0;

    for (const commit of filtered) {
        const stats = formatCommitStats(commit.changes);
        additions += stats.additions;
        deletions += stats.deletions;
    }

    return { additions, deletions };
}

export function getNetworkGraphData(repo, owner) {
    const latest = repo.commits?.[0];
    return {
        owner: owner || repo.owner || CURRENT_USER.username,
        branch: repo.defaultBranch || 'main',
        dateLabel: 'Sep',
        dayLabel: '28',
        hasCommit: Boolean(latest),
    };
}

export function getForksData(repo) {
    const forksList = repo.analytics?.forksList ?? [];
    return {
        count: repo.forks ?? forksList.length,
        forks: forksList,
    };
}

export function getActionsMetrics(repoName) {
    const workflows = getRepoWorkflows(repoName);
    const runs = workflows.flatMap(w => w.runs ?? []);
    const successRuns = runs.filter(run => run.status === 'success');
    const failedRuns = runs.filter(run => run.status === 'failure' || run.status === 'failed');
    const totalMinutes = runs.length * 2;

    return {
        workflows: workflows.length,
        totalRuns: runs.length,
        successRate: runs.length ? Math.round((successRuns.length / runs.length) * 100) : 0,
        avgDuration: runs.length ? `${Math.max(1, Math.round(totalMinutes / runs.length))}m` : '< 1s',
        avgQueue: runs.length ? '12s' : '< 1s',
        failureRate: runs.length ? `${Math.round((failedRuns.length / runs.length) * 100)}%` : '0%',
        failedUsage: failedRuns.length * 2,
        billableMinutes: totalMinutes,
        totalMinutes,
        totalJobRuns: runs.length,
        dataRange: 'Showing data from 09/01/2026 to 33 minutes ago',
    };
}

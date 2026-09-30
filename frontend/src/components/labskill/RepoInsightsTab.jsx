import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRepoSettings } from '../../data/repoSettingsModel';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import {
    getActionsMetrics,
    getCodeFrequencySummary,
    getContributorsDateRange,
    getContributorsWeeklyData,
    getForksData,
    getFullCommunityStandards,
    getNetworkGraphData,
    getPeriodLabel,
    getRepoContributorsData,
    getRepoPulseData,
    getTrafficCloneData,
    getTrafficVisitorData,
    getYearlyCommitsData,
} from '../../data/insightsData';
import {
    CardActions,
    DropdownSelect,
    InsightsCard,
    InsightsEmptyState,
    InsightsEmptyTable,
    InsightsFilterBar,
    InsightsMetricCard,
    InsightsPanelHead,
    InsightsSectionTitle,
    InsightsSubTabs,
} from './insights/InsightsShared';
import {
    CodeFrequencyAreaChart,
    LineChart,
    MiniWeeklyBarChart,
    TimelineSlider,
    WeeklyBarChart,
    YearlyCommitsChart,
} from './insights/InsightsCharts';
import {
    CheckCircleIcon,
    ChevronDownIcon,
    CubeIcon,
    DiscussIcon,
    GitForkIcon,
    GitMergeIcon,
    IssueIcon,
    PlayIcon,
    PullRequestIcon,
    ServerIcon,
    SettingsIcon,
    WorkflowIcon,
    MoreIcon,
} from '../pages/icons';

const INSIGHTS_NAV = [
    { id: 'pulse', label: 'Pulse' },
    { id: 'contributors', label: 'Contributors' },
    { id: 'community', label: 'Community' },
    { id: 'standards', label: 'Community standards' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'commits', label: 'Commits' },
    { id: 'frequency', label: 'Code frequency' },
    { id: 'dependencies', label: 'Dependency graph' },
    { id: 'network', label: 'Network' },
    { id: 'forks', label: 'Forks' },
    { id: 'actions-usage', label: 'Actions usage metrics' },
    { id: 'actions-performance', label: 'Actions performance metrics' },
];

const PULSE_PERIODS = [
    { id: '1w', label: '1 week' },
    { id: '2w', label: '2 weeks' },
    { id: '4w', label: '4 weeks' },
];

const CONTRIBUTOR_PERIODS = [
    { id: '3m', label: 'Last 3 months' },
    { id: '6m', label: 'Last 6 months' },
    { id: '1y', label: 'Last year' },
];

const CONTRIBUTION_TYPES = [
    { id: 'commits', label: 'Commits' },
    { id: 'additions', label: 'Additions' },
    { id: 'deletions', label: 'Deletions' },
];

const ACTIONS_TABS = [
    { id: 'workflows', label: 'Workflows', Icon: WorkflowIcon },
    { id: 'jobs', label: 'Jobs', Icon: PlayIcon },
    { id: 'os', label: 'Runtime OS', Icon: ServerIcon },
    { id: 'runner', label: 'Runner type', Icon: ServerIcon },
];

const SECTION_IDS = INSIGHTS_NAV.map(item => item.id);

function PulsePeriodSelect({ period, onChange }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="gh-pulse-period" ref={rootRef}>
            <button type="button" className="gh-pulse-period-btn" aria-expanded={open} onClick={() => setOpen(v => !v)}>
                Period: <strong>{getPeriodLabel(period)}</strong>
                <ChevronDownIcon />
            </button>
            {open && (
                <div className="gh-pulse-period-menu">
                    {PULSE_PERIODS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            className={period === item.id ? 'active' : ''}
                            onClick={() => { onChange(item.id); setOpen(false); }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function PulseOverview({ overview }) {
    const maxActivity = Math.max(
        overview.activePullRequests,
        overview.activeIssues,
        1,
    );
    const prWidth = (overview.activePullRequests / maxActivity) * 100;
    const issueWidth = (overview.activeIssues / maxActivity) * 100;

    return (
        <InsightsCard title="Overview">
            <div className="gh-pulse-activity-bars">
                <div className="gh-pulse-activity-row">
                    <div className="gh-pulse-activity-track">
                        <div className="gh-pulse-activity-fill gh-pulse-activity-fill--pr" style={{ width: `${prWidth}%` }} />
                    </div>
                    <span>{overview.activePullRequests} Active pull request{overview.activePullRequests !== 1 ? 's' : ''}</span>
                </div>
                <div className="gh-pulse-activity-row">
                    <div className="gh-pulse-activity-track">
                        <div className="gh-pulse-activity-fill gh-pulse-activity-fill--issue" style={{ width: `${issueWidth}%` }} />
                    </div>
                    <span>{overview.activeIssues} Active issue{overview.activeIssues !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div className="gh-pulse-stats-grid">
                <div className="gh-pulse-stat"><GitMergeIcon /><strong>{overview.mergedPullRequests}</strong><span>Merged pull requests</span></div>
                <div className="gh-pulse-stat"><PullRequestIcon /><strong>{overview.openPullRequests}</strong><span>Open pull requests</span></div>
                <div className="gh-pulse-stat"><CheckCircleIcon /><strong>{overview.closedIssues}</strong><span>Closed issues</span></div>
                <div className="gh-pulse-stat"><IssueIcon /><strong>{overview.newIssues}</strong><span>New issues</span></div>
            </div>
        </InsightsCard>
    );
}

function PulseSummary({ summary, branch }) {
    const verb = summary.authors === 1 ? 'has' : 'have';
    return (
        <InsightsCard title="Summary" className="gh-insights-card--summary">
            <p className="gh-pulse-summary-text">
                Excluding merges, <strong>{summary.authors} author{summary.authors !== 1 ? 's' : ''}</strong> {verb} pushed{' '}
                <strong>{summary.commitsMain} commit{summary.commitsMain !== 1 ? 's' : ''}</strong> to {branch} and{' '}
                <strong>{summary.commitsAll} commit{summary.commitsAll !== 1 ? 's' : ''}</strong> to all branches.
            </p>
            <p className="gh-pulse-summary-text">
                On {branch}, <strong>{summary.filesChanged} file{summary.filesChanged !== 1 ? 's' : ''}</strong> have changed and there have been{' '}
                <strong className="gh-diff-add">{summary.additions} addition{summary.additions !== 1 ? 's' : ''}</strong> and{' '}
                <strong className="gh-diff-del">{summary.deletions} deletion{summary.deletions !== 1 ? 's' : ''}</strong>.
            </p>
        </InsightsCard>
    );
}

function TopCommittersChart({ committers }) {
    const max = Math.max(...committers.map(c => c.count), 1);
    const ticks = Array.from({ length: max + 1 }, (_, i) => max - i);

    return (
        <InsightsCard title="Top committers" className="gh-insights-card--chart" actions={<CardActions />}>
            {committers.length === 0 ? (
                <p className="gh-insights-empty">No commits in this period.</p>
            ) : (
                <div className="gh-pulse-chart">
                    <div className="gh-pulse-chart-y">
                        <span>Commits</span>
                        <div className="gh-pulse-chart-ticks">{ticks.map(tick => <span key={tick}>{tick}</span>)}</div>
                    </div>
                    <div className="gh-pulse-chart-area">
                        {ticks.map(tick => (
                            <div key={tick} className="gh-pulse-chart-grid-line" style={{ bottom: `${(tick / max) * 100}%` }} />
                        ))}
                        <div className="gh-pulse-chart-bars">
                            {committers.map(c => (
                                <div key={c.name} className="gh-pulse-chart-col">
                                    <div className="gh-pulse-chart-bar" style={{ height: `${(c.count / max) * 100}%` }} />
                                    <span className="gh-pulse-chart-avatar">{c.initial}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </InsightsCard>
    );
}

function PulsePanel({ repo, repoName, period, onPeriodChange }) {
    const pulse = useMemo(() => getRepoPulseData(repo, repoName, period), [repo, repoName, period]);
    return (
        <>
            <header className="gh-insights-panel-head gh-insights-panel-head--pulse">
                <h2>{pulse.dateRange}</h2>
                <PulsePeriodSelect period={period} onChange={onPeriodChange} />
            </header>
            <PulseOverview overview={pulse.overview} />
            <div className="gh-insights-split">
                <PulseSummary summary={pulse.summary} branch={pulse.branch} />
                <TopCommittersChart committers={pulse.topCommitters} />
            </div>
        </>
    );
}

function ContributorsPanel({ repo }) {
    const [period, setPeriod] = useState('3m');
    const [contribType, setContribType] = useState('commits');
    const contributors = useMemo(
        () => getRepoContributorsData(repo, period, contribType),
        [repo, period, contribType],
    );
    const weekly = useMemo(
        () => getContributorsWeeklyData(repo, period, contribType),
        [repo, period, contribType],
    );
    const branch = repo.defaultBranch || 'main';

    return (
        <>
            <InsightsPanelHead
                title="Contributors"
                subtitle={`Contributions per week to ${branch}, excluding merge commits`}
            >
                <div className="gh-insights-head-controls">
                    <DropdownSelect label="Period" value={period} options={CONTRIBUTOR_PERIODS} onChange={setPeriod} />
                    <DropdownSelect label="Contributions" value={contribType} options={CONTRIBUTION_TYPES} onChange={setContribType} />
                </div>
            </InsightsPanelHead>

            <InsightsCard
                title="Commits over time"
                subtitle={getContributorsDateRange(period)}
                actions={<CardActions />}
            >
                <WeeklyBarChart data={weekly} />
                <TimelineSlider months={['Jul 2026', 'Aug 2026', 'Sep 2026']} />
            </InsightsCard>

            {contributors.map((person, index) => (
                <div key={person.name} className="gh-insights-contributor-card">
                    <div className="gh-insights-contributor-card-head">
                        <span className="gh-insights-contributor-rank">#{index + 1}</span>
                        <CardActions />
                    </div>
                    <div className="gh-insights-contributor-card-body">
                        <div className="gh-insights-contributor-card-info">
                            <span className="gh-insights-contributor-avatar">{person.name.charAt(0)}</span>
                            <div>
                                <a href="#" className="gh-insights-contributor-name" onClick={e => e.preventDefault()}>{person.name}</a>
                                <p>
                                    {person.commits} commit{person.commits !== 1 ? 's' : ''}{' '}
                                    <span className="gh-diff-add">{person.additions.toLocaleString()} ++</span>{' '}
                                    <span className="gh-diff-del">{person.deletions} --</span>
                                </p>
                            </div>
                        </div>
                        <MiniWeeklyBarChart data={weekly} />
                    </div>
                </div>
            ))}
        </>
    );
}

function CommunityPanel({ repo, owner, repoName, readOnly }) {
    const { updateRepoSettings } = useLabSkillRepos();
    const discussionsEnabled = getRepoSettings(repo).features.discussions;

    if (discussionsEnabled) {
        return (
            <>
                <InsightsPanelHead title="Community" />
                <InsightsCard title="Discussions activity">
                    <p className="gh-insights-standards-intro">
                        Discussions are enabled for this repository. Community insights will populate
                        as conversations grow.
                    </p>
                    <div className="gh-insights-actions-metrics">
                        <InsightsMetricCard title="Open discussions" value="0" description="Active threads in the last 30 days" />
                        <InsightsMetricCard title="Participants" value={String(new Set((repo.commits ?? []).map(c => c.author)).size)} description="Unique contributors from commits" />
                    </div>
                </InsightsCard>
            </>
        );
    }

    return (
        <>
            <InsightsPanelHead title="Community" />
            <InsightsEmptyState
                icon={DiscussIcon}
                title="Enable Discussions to unlock Community Insights!"
                action={(
                    <button
                        type="button"
                        className="gh-btn-green"
                        disabled={readOnly}
                        onClick={() => updateRepoSettings(owner, repoName, { features: { discussions: true } })}
                    >
                        Set up discussions
                    </button>
                )}
            >
                <p>
                    Discussions is the central space for your community to share announcements,
                    ask questions, and host conversations.
                </p>
            </InsightsEmptyState>
        </>
    );
}

function StandardsPanel({ repo }) {
    const standards = useMemo(() => getFullCommunityStandards(repo), [repo]);

    return (
        <>
            <InsightsPanelHead title="Community Standards" />
            <p className="gh-insights-standards-intro">
                Here&apos;s how this project compares to{' '}
                <a href="#" className="gh-link-btn" onClick={e => e.preventDefault()}>recommended community standards</a>.
            </p>
            <InsightsCard title="Checklist">
                <ul className="gh-insights-standards-list">
                    {standards.map(item => (
                        <li key={item.id}>
                            <span className={`gh-insights-standards-dot${item.done ? ' done' : ''}`} />
                            <div className="gh-insights-standards-content">
                                <strong>{item.label}</strong>
                                {item.hint && <p>{item.hint}</p>}
                                {item.guide && (
                                    <a href="#" className="gh-link-btn" onClick={e => e.preventDefault()}>{item.guide}</a>
                                )}
                            </div>
                            {!item.done && (
                                <button type="button" className="gh-insights-standards-add">Add</button>
                            )}
                        </li>
                    ))}
                </ul>
            </InsightsCard>
            <p className="gh-insights-standards-footer">
                <a href="#" className="gh-link-btn" onClick={e => e.preventDefault()}>What is the community profile?</a>
            </p>
        </>
    );
}

function TrafficPanel({ repo }) {
    const cloneData = useMemo(() => getTrafficCloneData(repo), [repo]);
    const visitorData = useMemo(() => getTrafficVisitorData(repo), [repo]);
    const totalClones = cloneData.reduce((s, d) => s + d.clones, 0);
    const totalUnique = cloneData.reduce((s, d) => s + d.unique, 0);
    const totalViews = visitorData.reduce((s, d) => s + d.views, 0);
    const totalVisitors = visitorData.reduce((s, d) => s + d.unique, 0);

    return (
        <>
            <InsightsPanelHead title="Traffic" />
            <InsightsSectionTitle>Git clones</InsightsSectionTitle>
            <div className="gh-insights-traffic-row">
                <InsightsCard title="Clones in last 14 days" actions={<CardActions />}>
                    <strong className="gh-insights-traffic-metric">{totalClones} Clones</strong>
                    <LineChart
                        data={cloneData.map(d => ({ label: d.label, value: d.clones }))}
                        yMax={Math.max(totalClones, 12)}
                        yTicks={[0, 3, 6, 9, 12]}
                    />
                </InsightsCard>
                <InsightsCard title="Unique cloners in last 14 days" actions={<CardActions />}>
                    <strong className="gh-insights-traffic-metric">{totalUnique} Unique cloners</strong>
                    <LineChart
                        data={cloneData.map(d => ({ label: d.label, value: d.unique }))}
                        yMax={Math.max(totalUnique, 9)}
                        yTicks={[0, 2, 4, 6, 9]}
                    />
                </InsightsCard>
            </div>

            <InsightsSectionTitle>Visitors</InsightsSectionTitle>
            <div className="gh-insights-traffic-row">
                <InsightsCard title="Total views in last 14 days" actions={<CardActions />}>
                    <strong className="gh-insights-traffic-metric">{totalViews} Views</strong>
                    <LineChart
                        data={visitorData.map(d => ({ label: d.label, value: d.views }))}
                        yMax={Math.max(totalViews, 12)}
                        yTicks={[0, 3, 6, 9, 12]}
                    />
                </InsightsCard>
                <InsightsCard title="Unique visitors in last 14 days" actions={<CardActions />}>
                    <strong className="gh-insights-traffic-metric">{totalVisitors} Unique visitors</strong>
                    <LineChart
                        data={visitorData.map(d => ({ label: d.label, value: d.unique }))}
                        yMax={Math.max(totalVisitors, 9)}
                        yTicks={[0, 2, 4, 6, 9]}
                    />
                </InsightsCard>
            </div>

            <div className="gh-insights-traffic-row">
                <InsightsCard title="Referring sites">
                    <InsightsEmptyTable
                        title=""
                        description="No referring sites data available for this period. Data in this table may take several days to appear."
                    />
                </InsightsCard>
                <InsightsCard title="Popular content">
                    <InsightsEmptyTable
                        title=""
                        description="No popular content data available for this period. Data in this table may take several days to appear."
                    />
                </InsightsCard>
            </div>
        </>
    );
}

function CommitsPanel({ repo, owner, repoName }) {
    const data = useMemo(() => getYearlyCommitsData(repo), [repo]);

    return (
        <>
            <InsightsPanelHead title={`Commits over the last year of ${owner}/${repoName}`} />
            <InsightsCard title="Commits" subtitle="Number of commits per week" actions={<CardActions />}>
                <YearlyCommitsChart data={data} />
            </InsightsCard>
        </>
    );
}

function FrequencyPanel({ repo, owner, repoName }) {
    const summary = useMemo(() => getCodeFrequencySummary(repo), [repo]);

    return (
        <>
            <InsightsPanelHead title={`Code frequency over the history of ${owner}/${repoName}`} />
            <InsightsCard title="Code frequency" subtitle="Additions and deletions per week" actions={<CardActions />}>
                <CodeFrequencyAreaChart additions={summary.additions} deletions={summary.deletions} />
            </InsightsCard>
        </>
    );
}

function DependenciesPanel({ repo, owner, repoName, readOnly }) {
    const { updateRepoSettings } = useLabSkillRepos();
    const settings = getRepoSettings(repo);
    const enabled = settings.features.dependencyGraph || settings.advancedSecurity.dependencyGraph;
    const [tab, setTab] = useState('dependencies');
    const depTabs = [
        { id: 'dependencies', label: 'Dependencies' },
        { id: 'dependents', label: 'Dependents' },
        { id: 'dependabot', label: 'Dependabot' },
    ];

    function enableDependencyGraph() {
        updateRepoSettings(owner, repoName, {
            features: { dependencyGraph: true },
            advancedSecurity: { dependencyGraph: true },
        });
    }

    if (enabled) {
        const packageFiles = (repo.files ?? []).filter(f =>
            ['package.json', 'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml'].includes(f.name),
        );

        return (
            <>
                <InsightsPanelHead title="Dependency graph" />
                <InsightsSubTabs tabs={depTabs} active={tab} onChange={setTab} />
                <InsightsCard title={tab === 'dependabot' ? 'Dependabot alerts' : 'Dependencies'}>
                    {packageFiles.length === 0 ? (
                        <p className="gh-insights-empty">No manifest files detected in this repository yet.</p>
                    ) : (
                        <ul className="gh-insights-standards-list">
                            {packageFiles.map(file => (
                                <li key={file.path}>
                                    <span className="gh-insights-standards-dot done" />
                                    <div className="gh-insights-standards-content">
                                        <strong>{file.path}</strong>
                                        <p>Tracked for dependency analysis</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </InsightsCard>
            </>
        );
    }

    return (
        <>
            <InsightsPanelHead title="Dependency graph" />
            <InsightsSubTabs tabs={depTabs} active={tab} onChange={setTab} />
            <div className="gh-insights-dep-empty">
                <InsightsEmptyState
                    icon={CubeIcon}
                    title="Dependency graph is disabled"
                    action={(
                        <button
                            type="button"
                            className="gh-btn-green"
                            disabled={readOnly}
                            onClick={enableDependencyGraph}
                        >
                            Enable the dependency graph
                        </button>
                    )}
                >
                    <p>
                        Track this repository&apos;s dependencies and sub-dependencies.{' '}
                        <a href="#" className="gh-link-btn" onClick={e => e.preventDefault()}>Learn more about how we use your data.</a>
                    </p>
                </InsightsEmptyState>
            </div>
        </>
    );
}

function NetworkPanel({ repo, owner }) {
    const network = useMemo(() => getNetworkGraphData(repo, owner), [repo, owner]);

    return (
        <>
            <InsightsPanelHead
                title="Network graph"
                subtitle="Timeline of the most recent commits to this repository and its network ordered by most recently pushed to and updated daily."
            >
                <button type="button" className="gh-insights-icon-btn" aria-label="More options"><MoreIcon /></button>
            </InsightsPanelHead>
            <div className="gh-insights-network-graph">
                <div className="gh-insights-network-head">
                    <span>Owners</span>
                    <div className="gh-insights-network-date">
                        <strong>{network.dateLabel}</strong>
                        <span>{network.dayLabel}</span>
                    </div>
                </div>
                <div className="gh-insights-network-row">
                    <span className="gh-insights-network-owner">{network.owner}</span>
                    <div className="gh-insights-network-track">
                        {network.hasCommit && (
                            <>
                                <span className="gh-insights-network-dot" />
                                <span className="gh-insights-network-branch">{network.branch}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function ForksPanel({ repo }) {
    const forks = useMemo(() => getForksData(repo), [repo]);

    return (
        <>
            <InsightsPanelHead title="Forks">
                <button type="button" className="gh-link-btn">Switch to tree view</button>
            </InsightsPanelHead>
            {forks.count === 0 ? (
                <InsightsEmptyState icon={GitForkIcon} title="No one has forked this repository yet">
                    <p>
                        Forks are a great way to contribute to a repository. After{' '}
                        <a href="#" className="gh-link-btn" onClick={e => e.preventDefault()}>forking a repository</a>, you can send the original author a{' '}
                        <a href="#" className="gh-link-btn" onClick={e => e.preventDefault()}>pull request</a>.
                    </p>
                </InsightsEmptyState>
            ) : (
                <InsightsCard title={`${forks.count} fork${forks.count !== 1 ? 's' : ''}`}>
                    <ul className="gh-insights-forks">
                        {forks.forks.map(fork => (
                            <li key={fork.user}>
                                <span className="gh-pulse-chart-avatar">{fork.user.charAt(0)}</span>
                                <div>
                                    <strong>{fork.user}</strong>
                                    <span>Forked {fork.date}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </InsightsCard>
            )}
        </>
    );
}

function ActionsUsagePanel({ repoName }) {
    const metrics = useMemo(() => getActionsMetrics(repoName), [repoName]);
    const [tab, setTab] = useState('workflows');

    return (
        <>
            <InsightsPanelHead title="Actions Usage Metrics" subtitle={metrics.dataRange}>
                <DropdownSelect label="Period" value="month" options={[{ id: 'month', label: 'Current month' }]} onChange={() => {}} />
            </InsightsPanelHead>
            <div className="gh-insights-actions-metrics">
                <InsightsMetricCard
                    title="Total minutes"
                    value={metrics.totalMinutes}
                    description="Total minutes across all workflows in this repository for current month"
                />
                <InsightsMetricCard
                    title="Total job runs"
                    value={metrics.totalJobRuns}
                    description="Total job runs across all workflows in this repository for current month"
                />
            </div>
            <InsightsSubTabs tabs={ACTIONS_TABS} active={tab} onChange={setTab} />
            <InsightsFilterBar />
            <InsightsEmptyTable
                title="No table data available yet."
                description="You don't have workflows on any of your organization repositories."
                linkLabel="Get started with LabSkill Actions"
            />
        </>
    );
}

function ActionsPerformancePanel({ repoName }) {
    const metrics = useMemo(() => getActionsMetrics(repoName), [repoName]);
    const [tab, setTab] = useState('workflows');

    return (
        <>
            <InsightsPanelHead title="Actions Performance Metrics" subtitle={metrics.dataRange}>
                <DropdownSelect label="Period" value="month" options={[{ id: 'month', label: 'Current month' }]} onChange={() => {}} />
            </InsightsPanelHead>
            <div className="gh-insights-actions-metrics gh-insights-actions-metrics--4">
                <InsightsMetricCard title="Avg job run time" value={metrics.avgDuration} description="Average run time of jobs in this repository for current month." />
                <InsightsMetricCard title="Avg job queue time" value={metrics.avgQueue} description="Average queue time of jobs in this repository for current month." />
                <InsightsMetricCard title="Job failure rate" value={metrics.failureRate} description="Failure rate across jobs in this repository for current month." />
                <InsightsMetricCard title="Failed job usage" value={metrics.failedUsage} description="Total minutes used across failed jobs in this repository for current month." />
            </div>
            <InsightsSubTabs tabs={ACTIONS_TABS} active={tab} onChange={setTab} />
            <InsightsFilterBar />
            <InsightsEmptyTable
                title="No table data available yet."
                description="You don't have workflows on any of your organization repositories."
                linkLabel="Get started with LabSkill Actions"
            />
        </>
    );
}

export function RepoInsightsTab({ repo, repoName, owner, readOnly = false }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const rawSection = searchParams.get('insights') || 'pulse';
    const section = SECTION_IDS.includes(rawSection) ? rawSection : 'pulse';
    const [period, setPeriod] = useState('1w');
    const repoOwner = owner || repo.owner;

    function changeSection(id) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (id === 'pulse') params.delete('insights');
            else params.set('insights', id);
            return params;
        }, { replace: true });
    }

    function renderPanel() {
        switch (section) {
            case 'contributors':
                return <ContributorsPanel repo={repo} />;
            case 'community':
                return (
                    <CommunityPanel
                        repo={repo}
                        owner={repoOwner}
                        repoName={repoName}
                        readOnly={readOnly}
                    />
                );
            case 'standards':
                return <StandardsPanel repo={repo} />;
            case 'traffic':
                return <TrafficPanel repo={repo} />;
            case 'commits':
                return <CommitsPanel repo={repo} owner={repoOwner} repoName={repoName} />;
            case 'frequency':
                return <FrequencyPanel repo={repo} owner={repoOwner} repoName={repoName} />;
            case 'dependencies':
                return (
                    <DependenciesPanel
                        repo={repo}
                        owner={repoOwner}
                        repoName={repoName}
                        readOnly={readOnly}
                    />
                );
            case 'network':
                return <NetworkPanel repo={repo} owner={repoOwner} />;
            case 'forks':
                return <ForksPanel repo={repo} />;
            case 'actions-usage':
                return <ActionsUsagePanel repoName={repoName} />;
            case 'actions-performance':
                return <ActionsPerformancePanel repoName={repoName} />;
            default:
                return <PulsePanel repo={repo} repoName={repoName} period={period} onPeriodChange={setPeriod} />;
        }
    }

    return (
        <div className="gh-insights-layout">
            <nav className="gh-insights-nav" aria-label="Insights sections">
                {INSIGHTS_NAV.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        className={`gh-insights-nav-item${section === item.id ? ' active' : ''}`}
                        onClick={() => changeSection(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="gh-insights-main">{renderPanel()}</div>
        </div>
    );
}

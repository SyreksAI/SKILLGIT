import { getRepoWorkflows } from '../../data/repoTabData';
import { PlayIcon, CheckIcon, GitBranchIcon } from '../pages/icons';

function RunStatusIcon({ status }) {
    if (status === 'success') {
        return <span className="gh-repo-run-status gh-repo-run-status--success"><CheckIcon /></span>;
    }
    return <span className="gh-repo-run-status gh-repo-run-status--pending"><PlayIcon /></span>;
}

export function RepoActionsTab({ repoName }) {
    const workflows = getRepoWorkflows(repoName);
    const allRuns = workflows.flatMap(w => w.runs.map(r => ({ ...r, workflow: w.name })));

    return (
        <div className="gh-repo-section">
            <div className="gh-repo-section-head gh-repo-section-head--simple">
                <h2 className="gh-repo-section-title">All workflows</h2>
                <button type="button" className="gh-repo-action-btn">New workflow</button>
            </div>

            {workflows.length === 0 ? (
                <div className="gh-repo-empty-state gh-repo-empty-state--large">
                    <PlayIcon />
                    <h3>Get started with Actions</h3>
                    <p>Build, test, and deploy your code. Make code reviews and manage pull requests.</p>
                    <button type="button" className="gh-btn-green">Set up a workflow yourself</button>
                </div>
            ) : (
                <>
                    <div className="gh-repo-workflow-list">
                        {workflows.map(wf => (
                            <div key={wf.id} className="gh-repo-workflow-card">
                                <div className="gh-repo-workflow-head">
                                    <PlayIcon />
                                    <div>
                                        <strong>{wf.name}</strong>
                                        <span>{wf.file}</span>
                                    </div>
                                    <span className={`gh-repo-workflow-badge gh-repo-workflow-badge--${wf.badge}`}>
                                        {wf.badge}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="gh-repo-subtitle">{allRuns.length} workflow run{allRuns.length !== 1 ? 's' : ''}</h3>
                    <ul className="gh-repo-run-list">
                        {allRuns.map(run => (
                            <li key={run.id} className="gh-repo-run-item">
                                <RunStatusIcon status={run.status} />
                                <div className="gh-repo-run-body">
                                    <strong>{run.message}</strong>
                                    <span className="gh-repo-run-meta">
                                        {run.workflow} #{run.id} · {run.event} on{' '}
                                        <span className="gh-repo-pr-branch"><GitBranchIcon /> {run.branch}</span>
                                        {' '}by {run.author}
                                    </span>
                                </div>
                                <div className="gh-repo-run-time">
                                    <span>{run.time}</span>
                                    <span>{run.duration}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

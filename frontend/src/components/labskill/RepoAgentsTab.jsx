import { AgentsIcon, PlusIcon } from '../pages/icons';

const SAMPLE_AGENTS = [
    {
        id: 1,
        name: 'Code review agent',
        description: 'Reviews pull requests and suggests improvements.',
        status: 'idle',
        lastRun: '2 days ago',
    },
    {
        id: 2,
        name: 'Docs agent',
        description: 'Keeps README and inline docs up to date.',
        status: 'running',
        lastRun: 'Running now',
    },
];

export function RepoAgentsTab() {
    return (
        <div className="gh-repo-section">
            <div className="gh-repo-section-head gh-repo-section-head--simple">
                <h2 className="gh-repo-section-title">Agents</h2>
                <button type="button" className="gh-btn-green">
                    <PlusIcon /> New agent
                </button>
            </div>

            <p className="gh-repo-settings-desc">
                AI agents that can work on issues and pull requests in this repository.
            </p>

            <div className="gh-repo-agents-list">
                {SAMPLE_AGENTS.map(agent => (
                    <article key={agent.id} className="gh-repo-agent-card">
                        <div className="gh-repo-agent-icon"><AgentsIcon /></div>
                        <div className="gh-repo-agent-body">
                            <div className="gh-repo-agent-head">
                                <strong>{agent.name}</strong>
                                <span className={`gh-repo-agent-status gh-repo-agent-status--${agent.status}`}>
                                    {agent.status === 'running' ? 'Running' : 'Idle'}
                                </span>
                            </div>
                            <p>{agent.description}</p>
                            <span className="gh-repo-agent-meta">{agent.lastRun}</span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

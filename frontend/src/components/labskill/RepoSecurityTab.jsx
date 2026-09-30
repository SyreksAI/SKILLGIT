import { getRepoSecurity } from '../../data/repoTabData';
import { ShieldIcon, CheckIcon } from '../pages/icons';

function SecurityFeature({ title, description, enabled, alerts, actionLabel }) {
    return (
        <div className="gh-repo-security-card">
            <div className="gh-repo-security-icon"><ShieldIcon /></div>
            <div className="gh-repo-security-body">
                <div className="gh-repo-security-head">
                    <strong>{title}</strong>
                    {enabled ? (
                        <span className="gh-repo-security-badge gh-repo-security-badge--enabled">
                            <CheckIcon /> Enabled
                        </span>
                    ) : (
                        <span className="gh-repo-security-badge">Not enabled</span>
                    )}
                </div>
                <p>{description}</p>
                {alerts > 0 && <p className="gh-repo-security-alerts">{alerts} open alert{alerts !== 1 ? 's' : ''}</p>}
                {!enabled && actionLabel && (
                    <button type="button" className="gh-repo-action-btn">{actionLabel}</button>
                )}
            </div>
        </div>
    );
}

export function RepoSecurityTab({ repo }) {
    const security = getRepoSecurity(repo);

    return (
        <div className="gh-repo-section">
            <div className="gh-repo-section-head gh-repo-section-head--simple">
                <h2 className="gh-repo-section-title">Security overview</h2>
            </div>

            <div className="gh-repo-security-grid">
                <SecurityFeature
                    title="Dependency graph"
                    description="Understand your dependencies."
                    enabled={security.dependabot.enabled}
                    alerts={security.dependabot.alerts}
                    actionLabel="Enable Dependabot"
                />
                <SecurityFeature
                    title="Dependabot alerts"
                    description="Get notified when one of your dependencies has a vulnerability."
                    enabled={security.dependabot.enabled}
                    alerts={security.dependabot.alerts}
                    actionLabel="Enable Dependabot alerts"
                />
                <SecurityFeature
                    title="Code scanning alerts"
                    description="Automatically detect common vulnerability and coding problems."
                    enabled={security.codeScanning.enabled}
                    alerts={security.codeScanning.alerts}
                    actionLabel="Set up code scanning"
                />
                <SecurityFeature
                    title="Secret scanning alerts"
                    description="Get notified when a secret is pushed to this repository."
                    enabled={security.secretScanning.enabled}
                    alerts={security.secretScanning.alerts}
                />
            </div>
        </div>
    );
}

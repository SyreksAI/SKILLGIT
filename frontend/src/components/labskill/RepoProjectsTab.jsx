import { getRepoProjects } from '../../data/repoTabData';
import { ProjectIcon, PlusIcon } from '../pages/icons';

export function RepoProjectsTab({ repoName }) {
    const projects = getRepoProjects(repoName);

    return (
        <div className="gh-repo-section">
            <div className="gh-repo-section-head gh-repo-section-head--simple">
                <h2 className="gh-repo-section-title">{projects.length} project{projects.length !== 1 ? 's' : ''}</h2>
                <button type="button" className="gh-btn-green"><PlusIcon /> New project</button>
            </div>

            {projects.length === 0 ? (
                <div className="gh-repo-empty-state gh-repo-empty-state--large">
                    <ProjectIcon />
                    <h3>Welcome to projects</h3>
                    <p>Built like a spreadsheet, project tables give you a live canvas to filter, sort, and group issues and pull requests.</p>
                    <button type="button" className="gh-btn-green"><PlusIcon /> New project</button>
                </div>
            ) : (
                <div className="gh-repo-project-grid">
                    {projects.map(project => (
                        <a key={project.id} href="#" className="gh-repo-project-card">
                            <div className="gh-repo-project-cover" />
                            <div className="gh-repo-project-body">
                                <strong>{project.name}</strong>
                                <p>{project.description}</p>
                                <span>{project.columns} columns · {project.cards} cards · Updated {project.updated}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

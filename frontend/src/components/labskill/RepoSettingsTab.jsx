import { useSearchParams } from 'react-router-dom';
import { useLabSkillRepos } from '../../context/LabSkillReposContext';
import { SETTINGS_SECTION_IDS } from '../../data/settingsNavData';
import { RepoSettingsNav } from './RepoSettingsNav';
import { getSettingsPanelComponent } from './settings/settingsRegistry';
import { SettingsEmptyState, SettingsPanel } from './settings/SettingsShared';

export function RepoSettingsTab({ repo, owner, repoName, readOnly = false }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { updateRepo, updateRepoSettings, deleteRepo } = useLabSkillRepos();
    const rawSection = searchParams.get('section') || 'general';
    const section = SETTINGS_SECTION_IDS.includes(rawSection) ? rawSection : 'general';

    const panelProps = {
        repo,
        owner,
        repoName,
        readOnly,
        updateRepo,
        updateRepoSettings,
        deleteRepo,
    };

    function changeSection(id) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (id === 'general') params.delete('section');
            else params.set('section', id);
            return params;
        }, { replace: true });
    }

    function renderSectionContent() {
        const Panel = getSettingsPanelComponent(section);

        if (!Panel) {
            return (
                <SettingsPanel title="Settings">
                    <SettingsEmptyState message="This settings section is not available." />
                </SettingsPanel>
            );
        }

        return <Panel {...panelProps} />;
    }

    return (
        <div className="gh-repo-settings">
            <RepoSettingsNav section={section} onChangeSection={changeSection} />
            <div className="gh-repo-settings-main">
                {readOnly && (
                    <p className="gh-repo-settings-readonly">
                        This is a read-only repository. Settings cannot be changed.
                    </p>
                )}
                {renderSectionContent()}
            </div>
        </div>
    );
}

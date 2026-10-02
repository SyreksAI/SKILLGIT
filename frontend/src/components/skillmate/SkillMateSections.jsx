import { SkillMateImagesPage } from './SkillMateImagesPage';
import { SkillMateLibraryPage } from './SkillMateLibraryPage';
import { SkillMatePluginsPage } from './SkillMatePluginsPage';
import { SkillMateScheduledPage } from './SkillMateScheduledPage';
import { SkillMateProjectsPage } from './SkillMateProjectsPage';

const SECTION_PAGES = {
    images: SkillMateImagesPage,
    library: SkillMateLibraryPage,
    scheduled: SkillMateScheduledPage,
    plugins: SkillMatePluginsPage,
};

export function SkillMateSectionView({ sectionId, projects, onOpenCreateProject }) {
    if (sectionId === 'projects') {
        return (
            <SkillMateProjectsPage
                projects={projects}
                onCreate={onOpenCreateProject}
            />
        );
    }

    const Page = SECTION_PAGES[sectionId];
    if (!Page) return null;
    return <Page />;
}

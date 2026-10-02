import { useMemo, useState } from 'react';
import { FolderIcon, SearchIcon } from '../pages/icons';

const FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'mine', label: 'Созданные вами' },
    { id: 'shared', label: 'Доступные вам' },
];

export function SkillMateProjectsPage({ projects = [], onCreate }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const items = useMemo(() => {
        let list = projects;

        if (filter === 'mine') {
            list = list.filter(project => project.owner !== 'shared');
        } else if (filter === 'shared') {
            list = list.filter(project => project.owner === 'shared');
        }

        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter(project => project.name.toLowerCase().includes(q));
    }, [projects, filter, search]);

    return (
        <div className="skillmate-projects-page">
            <div className="skillmate-projects-page-inner">
                <header className="skillmate-projects-head">
                    <h1>Проекты</h1>
                    <div className="skillmate-projects-head-tools">
                        <div className="skillmate-projects-search">
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder="Поиск проектов"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="skillmate-projects-create"
                            onClick={onCreate}
                        >
                            Создать
                        </button>
                    </div>
                </header>

                <div className="skillmate-projects-filters" role="tablist" aria-label="Фильтры проектов">
                    {FILTERS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={filter === item.id}
                            className={filter === item.id ? 'active' : ''}
                            onClick={() => setFilter(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {items.length === 0 ? (
                    <div className="skillmate-projects-empty">
                        <span className="skillmate-projects-empty-icon" aria-hidden="true">
                            <FolderIcon />
                        </span>
                        <p>Пока нет проектов</p>
                    </div>
                ) : (
                    <div className="skillmate-projects-grid">
                        {items.map(project => (
                            <button
                                key={project.id}
                                type="button"
                                className="skillmate-projects-card"
                            >
                                <span
                                    className="skillmate-projects-card-icon"
                                    style={{ background: project.accent }}
                                >
                                    {project.label}
                                </span>
                                <span className="skillmate-projects-card-name">{project.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

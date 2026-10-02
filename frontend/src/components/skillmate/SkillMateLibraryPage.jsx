import { useMemo, useState } from 'react';
import { SKILLMATE_LIBRARY_ITEMS } from '../../data/skillMateSectionsData';
import {
    ChevronDownIcon,
    FileIcon,
    FolderIcon,
    GridIcon,
    ListIcon,
    SearchIcon,
    SettingsIcon,
    SlidersHorizontalIcon,
} from '../pages/icons';

const TABS = [
    { id: 'recommendations', label: 'Рекомендации' },
    { id: 'favorites', label: 'Избранное' },
    { id: 'folders', label: 'Папки' },
    { id: 'images', label: 'Изображения' },
    { id: 'all', label: 'Все' },
];

export function SkillMateLibraryPage() {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('recommendations');
    const [view, setView] = useState('list');

    const items = useMemo(() => {
        let list = SKILLMATE_LIBRARY_ITEMS;

        if (tab === 'favorites') {
            list = list.filter(item => item.favorite);
        } else if (tab === 'folders') {
            list = list.filter(item => item.kind === 'folder');
        } else if (tab === 'images') {
            list = list.filter(item => item.kind === 'image');
        } else if (tab === 'recommendations') {
            list = list.filter(item => item.recommended);
        }

        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter(item => item.name.toLowerCase().includes(q));
    }, [search, tab]);

    return (
        <div className="skillmate-library-page">
            <div className="skillmate-library-page-inner">
                <header className="skillmate-library-head">
                    <h1>Библиотека</h1>
                    <div className="skillmate-library-head-tools">
                        <button
                            type="button"
                            className="skillmate-library-icon-btn"
                            aria-label="Фильтры"
                        >
                            <SlidersHorizontalIcon />
                        </button>

                        <div className="skillmate-library-view-toggle" role="group" aria-label="Вид">
                            <button
                                type="button"
                                className={view === 'grid' ? 'active' : ''}
                                aria-label="Сетка"
                                aria-pressed={view === 'grid'}
                                onClick={() => setView('grid')}
                            >
                                <GridIcon />
                            </button>
                            <button
                                type="button"
                                className={view === 'list' ? 'active' : ''}
                                aria-label="Список"
                                aria-pressed={view === 'list'}
                                onClick={() => setView('list')}
                            >
                                <ListIcon />
                            </button>
                        </div>

                        <div className="skillmate-library-search">
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder="Поиск в библиотеке"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <button type="button" className="skillmate-library-create">
                            Создать
                            <ChevronDownIcon />
                        </button>

                        <button
                            type="button"
                            className="skillmate-library-icon-btn"
                            aria-label="Настройки"
                        >
                            <SettingsIcon />
                        </button>
                    </div>
                </header>

                <div className="skillmate-library-tabs" role="tablist" aria-label="Разделы библиотеки">
                    {TABS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === item.id}
                            className={tab === item.id ? 'active' : ''}
                            onClick={() => setTab(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {view === 'list' ? (
                    <div className="skillmate-library-table">
                        <div className="skillmate-library-table-head">
                            <span>Имя</span>
                            <span>Последняя активность</span>
                        </div>
                        {items.length === 0 ? (
                            <p className="skillmate-library-empty">Ничего не найдено</p>
                        ) : (
                            <ul className="skillmate-library-rows">
                                {items.map(item => (
                                    <li key={item.id}>
                                        <button type="button" className="skillmate-library-row">
                                            <span className="skillmate-library-row-name">
                                                {item.kind === 'image' ? (
                                                    <span className="skillmate-library-thumb">
                                                        <img src={item.preview} alt="" loading="lazy" />
                                                    </span>
                                                ) : (
                                                    <span className={`skillmate-library-file-icon${item.kind === 'document' ? ' doc' : ''}${item.kind === 'folder' ? ' folder' : ''}`}>
                                                        {item.kind === 'folder' ? <FolderIcon /> : <FileIcon />}
                                                    </span>
                                                )}
                                                <span>{item.name}</span>
                                            </span>
                                            <time>{item.activity}</time>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="skillmate-library-grid">
                        {items.length === 0 ? (
                            <p className="skillmate-library-empty">Ничего не найдено</p>
                        ) : (
                            items.map(item => (
                                <button key={item.id} type="button" className="skillmate-library-grid-card">
                                    {item.kind === 'image' ? (
                                        <img src={item.preview} alt="" loading="lazy" />
                                    ) : (
                                        <span className="skillmate-library-grid-file">
                                            <FileIcon />
                                        </span>
                                    )}
                                    <strong>{item.name}</strong>
                                    <time>{item.activity}</time>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

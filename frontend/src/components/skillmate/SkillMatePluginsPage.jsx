import { useMemo, useState } from 'react';
import {
    getAllCatalogPlugins,
    SKILLMATE_PLUGIN_CATALOG,
    SKILLMATE_PLUGINS_INSTALLED,
} from '../../data/skillMatePluginsData';
import { SkillMatePageBlock, SkillMateSectionLayout } from './SkillMateSectionLayout';
import { PlusIcon, SparkleIcon } from '../pages/icons';

function PluginIcon({ iconBg, iconLabel, sparkle = false, size = 'md' }) {
    return (
        <span className={`skillmate-plugins-icon skillmate-plugins-icon--${size}`}>
            <span className="skillmate-plugins-icon-box" style={{ background: iconBg }}>
                {iconLabel}
            </span>
            {sparkle && (
                <span className="skillmate-plugins-icon-badge" aria-hidden="true">
                    <SparkleIcon />
                </span>
            )}
        </span>
    );
}

function PluginRow({ plugin, installed, onToggle }) {
    return (
        <div className="skillmate-plugins-row">
            <PluginIcon
                iconBg={plugin.iconBg}
                iconLabel={plugin.iconLabel}
                sparkle={plugin.sparkle}
            />
            <div className="skillmate-plugins-row-text">
                <strong>{plugin.name}</strong>
                <span>{plugin.desc}</span>
            </div>
            <button
                type="button"
                className={`skillmate-plugins-add${installed ? ' installed' : ''}`}
                aria-label={installed ? `Удалить ${plugin.name}` : `Добавить ${plugin.name}`}
                aria-pressed={installed}
                onClick={() => onToggle(plugin.id)}
            >
                <PlusIcon />
            </button>
        </div>
    );
}

function PluginCategorySection({ section, installedIds, onToggle, showMore = true }) {
    if (section.items.length === 0) return null;

    return (
        <SkillMatePageBlock title={section.title}>
            <div className="skillmate-plugins-grid">
                {section.items.map(plugin => (
                    <PluginRow
                        key={plugin.id}
                        plugin={plugin}
                        installed={installedIds.has(plugin.id)}
                        onToggle={onToggle}
                    />
                ))}
            </div>
            {showMore && section.more && (
                <button type="button" className="skillmate-plugins-more">
                    <span className="skillmate-plugins-more-icons">
                        {section.more.preview.map(item => (
                            <span
                                key={item.id}
                                className="skillmate-plugins-more-icon"
                                style={{ background: item.iconBg }}
                            >
                                {item.iconLabel}
                            </span>
                        ))}
                    </span>
                    {section.more.label}
                </button>
            )}
        </SkillMatePageBlock>
    );
}

export function SkillMatePluginsPage() {
    const [search, setSearch] = useState('');
    const [installedIds, setInstalledIds] = useState(() => (
        new Set(SKILLMATE_PLUGINS_INSTALLED.map(p => p.id))
    ));

    const q = search.trim().toLowerCase();
    const allPlugins = useMemo(() => getAllCatalogPlugins(), []);

    const catalog = useMemo(() => {
        if (!q) return SKILLMATE_PLUGIN_CATALOG;

        return SKILLMATE_PLUGIN_CATALOG
            .map(section => ({
                ...section,
                items: section.items.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.desc.toLowerCase().includes(q)
                ),
            }))
            .filter(section => section.items.length > 0);
    }, [q]);

    const installed = allPlugins.filter(p => installedIds.has(p.id));

    function togglePlugin(id) {
        setInstalledIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    const hasResults = catalog.length > 0;

    return (
        <SkillMateSectionLayout
            title="Плагины"
            desc="Работайте со SkillMate в любимых инструментах."
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Искать плагины"
            actionLabel="Добавить плагин"
            stats={[
                { label: 'Установлено', value: installed.length },
                { label: 'Доступно', value: allPlugins.length },
            ]}
        >
            {installed.length > 0 && !q && (
                <SkillMatePageBlock title="Установленные" linkLabel>
                    <div className="skillmate-plugins-installed">
                        {installed.map(plugin => (
                            <button
                                key={plugin.id}
                                type="button"
                                className="skillmate-plugins-installed-item"
                                aria-label={plugin.name}
                            >
                                <PluginIcon
                                    iconBg={plugin.iconBg}
                                    iconLabel={plugin.iconLabel}
                                    sparkle={plugin.sparkle}
                                    size="lg"
                                />
                            </button>
                        ))}
                    </div>
                </SkillMatePageBlock>
            )}

            {catalog.map(section => (
                <PluginCategorySection
                    key={section.id}
                    section={section}
                    installedIds={installedIds}
                    onToggle={togglePlugin}
                    showMore={!q}
                />
            ))}

            {!hasResults && (
                <p className="skillmate-page-empty">Плагины не найдены</p>
            )}
        </SkillMateSectionLayout>
    );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TEAMS, getDirectionLabel, DIRECTIONS } from '../../data/mockData';
import { TeamCard } from '../ui/TeamCard';
import { CreateTeamModal } from '../ui/CreateTeamModal';
import { TeamRightSidebar } from '../layout/TeamRightSidebar';
import { HeaderActions } from '../ui/HeaderActions';
import { useSearchParam } from '../../hooks/useSearchParam';
import {
    SearchIcon,
    UsersIcon,
    PlusIcon,
    ArrowRightIcon,
} from './icons';

const FILTERS = [
    { id: 'all', label: 'Все команды' },
    { id: 'mine', label: 'Мои' },
    { id: 'open', label: 'Открытые' },
];

const FILTER_IDS = FILTERS.map(f => f.id);
const DIRECTION_IDS = ['all', ...DIRECTIONS.map(d => d.id)];

export function TeamPage() {
    const [teams, setTeams] = useState(TEAMS);
    const [joined, setJoined] = useState([1, 5]);
    const [createOpen, setCreateOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useSearchParam('filter', 'all', FILTER_IDS);
    const [directionFilter, setDirectionFilter] = useSearchParam('direction', 'all', DIRECTION_IDS);
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
    const gridRef = useRef(null);

    useEffect(() => {
        const q = searchParams.get('search');
        if (q != null) setSearch(q);
    }, [searchParams]);

    function handleSearchChange(value) {
        setSearch(value);
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (value.trim()) params.set('search', value);
            else params.delete('search');
            return params;
        }, { replace: true });
    }

    function openCreateTeam() {
        setCreateOpen(true);
    }

    function handleCreateTeam(payload) {
        const nextId = teams.reduce((max, team) => Math.max(max, team.id), 0) + 1;

        const newTeam = {
            id: nextId,
            name: payload.name,
            description: payload.description,
            members: 1,
            maxMembers: payload.maxMembers,
            direction: payload.direction,
            tags: payload.tags.length > 0 ? payload.tags : ['Новая команда'],
            avatar: payload.avatar,
            color: payload.color,
            activity: 'Создана только что',
            open: payload.open,
        };

        setTeams(prev => [newTeam, ...prev]);
        setJoined(prev => (prev.includes(newTeam.id) ? prev : [...prev, newTeam.id]));
        setActiveFilter('mine');
        setCreateOpen(false);

        requestAnimationFrame(() => {
            gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function scrollToTeams() {
        setActiveFilter('open');
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function toggleJoin(id) {
        setJoined(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    const stats = useMemo(() => ({
        joined: joined.length,
        totalMembers: teams.filter(t => joined.includes(t.id)).reduce((s, t) => s + t.members, 0),
        openTeams: teams.filter(t => t.open && t.members < t.maxMembers).length,
    }), [joined, teams]);

    const filteredTeams = useMemo(() => {
        let result = [...teams];

        if (activeFilter === 'mine') {
            result = result.filter(t => joined.includes(t.id));
        } else if (activeFilter === 'open') {
            result = result.filter(t => t.open && t.members < t.maxMembers);
        }

        if (directionFilter !== 'all') {
            result = result.filter(t => t.direction === directionFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }

        return result;
    }, [activeFilter, directionFilter, search, joined, teams]);

    const filterCount = (id) => {
        if (id === 'all') return teams.length;
        if (id === 'mine') return joined.length;
        return teams.filter(t => t.open && t.members < t.maxMembers).length;
    };

    return (
        <div className="teams-layout">
            <div className="teams-center">
                <header className="home-header">
                    <div className="home-header-search">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Поиск команд, технологий, направлений..."
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                        />
                    </div>
                    <HeaderActions />
                </header>

                <div className="teams-page-head">
                    <div className="teams-page-title">
                        <span className="teams-page-icon"><UsersIcon /></span>
                        <div>
                            <h1>Команды</h1>
                            <p>
                                Объединяйся с джунами своего направления — pet-проекты,
                                менторство, хакатоны и подготовка к собеседованиям.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="teams-create-btn"
                        onClick={openCreateTeam}
                    >
                        <PlusIcon />
                        Создать команду
                    </button>
                </div>

                <section className="teams-hero-banner">
                    <div>
                        <h2>Работай в команде — расти быстрее</h2>
                        <p>
                            {teams.reduce((s, t) => s + t.members, 0)} участников уже в командах SKILLGIT.
                            Вступай в открытую или создай свою.
                        </p>
                        <button type="button" className="teams-hero-btn" onClick={scrollToTeams}>
                            Найти команду
                            <ArrowRightIcon />
                        </button>
                    </div>
                </section>

                <div className="teams-filters">
                    {FILTERS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            className={`tasks-filter${activeFilter === id ? ' active' : ''}`}
                            onClick={() => setActiveFilter(id)}
                        >
                            {label}
                            <span className="tasks-filter-count">{filterCount(id)}</span>
                        </button>
                    ))}
                </div>

                <div className="teams-directions">
                    <button
                        type="button"
                        className={`home-filter${directionFilter === 'all' ? ' active' : ''}`}
                        onClick={() => setDirectionFilter('all')}
                    >
                        Все направления
                    </button>
                    {DIRECTIONS.map(dir => (
                        <button
                            key={dir.id}
                            type="button"
                            className={`home-filter${directionFilter === dir.id ? ' active' : ''}`}
                            onClick={() => setDirectionFilter(dir.id)}
                        >
                            {dir.label}
                        </button>
                    ))}
                </div>

                {filteredTeams.length === 0 ? (
                    <div className="home-empty">Команды не найдены</div>
                ) : (
                    <div className="teams-grid" ref={gridRef}>
                        {filteredTeams.map(team => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                joined={joined.includes(team.id)}
                                directionLabel={getDirectionLabel(team.direction)}
                                onToggle={() => toggleJoin(team.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <TeamRightSidebar stats={stats} onCreateTeam={openCreateTeam} />

            <CreateTeamModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={handleCreateTeam}
            />
        </div>
    );
}

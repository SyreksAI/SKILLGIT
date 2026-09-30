import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TASKS, CURRENT_USER } from '../../data/mockData';
import { TaskCard } from '../ui/TaskCard';
import { HomeRightSidebar } from '../layout/HomeRightSidebar';
import { HeaderActions } from '../ui/HeaderActions';
import {
    SearchIcon,
    GridIcon,
    CompassIcon,
    CheckCircleIcon,
    FlameIcon,
    ArrowRightIcon,
} from './icons';

const FILTERS = [
    { id: 'all', label: 'Все задания', Icon: GridIcon },
    { id: 'direction', label: 'Моё направление', Icon: CompassIcon },
    { id: 'checked', label: 'С галочкой', Icon: CheckCircleIcon },
    { id: 'high-pay', label: 'Высокая оплата', Icon: FlameIcon },
];

const FILTER_IDS = FILTERS.map(f => f.id);

export function HomePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlFilter = searchParams.get('filter');
    const urlSearch = searchParams.get('search') ?? '';
    const activeFilter = FILTER_IDS.includes(urlFilter) ? urlFilter : 'all';
    const [search, setSearch] = useState(urlSearch);
    const [appliedIds, setAppliedIds] = useState([]);

    useEffect(() => {
        setSearch(urlSearch);
    }, [urlSearch]);

    function setActiveFilter(id) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (id === 'all') params.delete('filter');
            else params.set('filter', id);
            return params;
        }, { replace: true });
    }

    function handleSearchChange(value) {
        setSearch(value);
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (value.trim()) params.set('search', value);
            else params.delete('search');
            return params;
        }, { replace: true });
    }

    const filteredTasks = useMemo(() => {
        let result = [...TASKS];

        if (activeFilter === 'direction') {
            result = result.filter(t => t.direction === CURRENT_USER.direction);
        } else if (activeFilter === 'checked') {
            result = result.filter(t => t.verified);
        } else if (activeFilter === 'high-pay') {
            result = result.filter(t => t.highPay);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.company.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }

        return result;
    }, [activeFilter, search]);
    

    return (
        <div className="home-layout">
            <div className="home-center">
                <header className="home-header">
                    <div className="home-header-search">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Поиск заданий, компаний, технологий..."
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                        />
                    </div>
                    <HeaderActions />
                </header>

                <div className="home-filters">
                    {FILTERS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            className={`home-filter${activeFilter === id ? ' active' : ''}`}
                            onClick={() => setActiveFilter(id)}
                        >
                            <Icon />
                            {label}
                        </button>
                    ))}
                </div>

                <section className="home-hero">
                    <div className="home-hero-text">
                        <h2>Реальные задачи от компаний</h2>
                        <p>
                            Выполняй задания, получай опыт, пополняй портфолио
                            и зарабатывай. Твой старт в IT и креативной индустрии.
                        </p>
                        <button
                            type="button"
                            className="home-hero-btn"
                            onClick={() => document.querySelector('.home-tasks')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Найти задание
                            <ArrowRightIcon />
                        </button>
                    </div>
                    <div className="home-hero-art" aria-hidden="true">
                        <div className="hero-laptop">
                            <div className="hero-screen" />
                            <div className="hero-keyboard" />
                        </div>
                        <span className="hero-float hero-float-1">Python</span>
                        <span className="hero-float hero-float-2">React</span>
                        <span className="hero-float hero-float-3">UI/UX</span>
                    </div>
                </section>

                <section className="home-tasks">
                    <div className="home-tasks-head">
                        <h3>Популярные задания</h3>
                        <Link to="/tasks" className="home-tasks-link">
                            Мои задачи <ArrowRightIcon />
                        </Link>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="home-empty">Ничего не найдено</div>
                    ) : (
                        <div className="home-tasks-grid">
                            {filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onApply={
                                        appliedIds.includes(task.id)
                                            ? undefined
                                            : (t) => {
                                                setAppliedIds(p => [...p, t.id]);
                                                navigate(`/tasks/${t.id}`);
                                            }
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <HomeRightSidebar />
        </div>
    );
}

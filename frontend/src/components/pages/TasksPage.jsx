import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParam } from '../../hooks/useSearchParam';
import { MY_TASKS } from '../../data/mockData';
import { MyTaskRow } from '../ui/MyTaskRow';
import { TasksRightSidebar } from '../layout/TasksRightSidebar';
import { HeaderActions } from '../ui/HeaderActions';
import { useBalance } from '../../context/BalanceContext';
import {
    SearchIcon,
    RocketIcon,
    GridIcon,
} from './icons';

const FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'Активные' },
    { id: 'review', label: 'На проверке' },
    { id: 'completed', label: 'Выполненные' },
];

function countByStatus(tasks) {
    const active = tasks.filter(t => t.status === 'in_progress' || t.status === 'applied').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { total: tasks.length, active, review, completed };
}

const FILTER_IDS = FILTERS.map(f => f.id);

export function TasksPage() {
    const [activeFilter, setActiveFilter] = useSearchParam('filter', 'all', FILTER_IDS);
    const [search, setSearch] = useState('');
    const { balanceLabel } = useBalance();

    const counts = useMemo(() => countByStatus(MY_TASKS), []);

    const sidebarStats = useMemo(() => {
        const completed = counts.completed;
        const progress = counts.total ? Math.round((completed / counts.total) * 100) : 0;

        return {
            ...counts,
            progress,
            balance: balanceLabel,
        };
    }, [counts, balanceLabel]);

    const filteredTasks = useMemo(() => {
        let result = [...MY_TASKS];

        if (activeFilter === 'active') {
            result = result.filter(t => t.status === 'in_progress' || t.status === 'applied');
        } else if (activeFilter === 'review') {
            result = result.filter(t => t.status === 'review');
        } else if (activeFilter === 'completed') {
            result = result.filter(t => t.status === 'completed');
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.company.toLowerCase().includes(q) ||
                t.tags?.some(tag => tag.toLowerCase().includes(q))
            );
        }

        return result;
    }, [activeFilter, search]);

    const filterCount = (id) => {
        if (id === 'all') return counts.total;
        return counts[id] ?? 0;
    };

    return (
        <div className="tasks-layout">
            <div className="tasks-center">
                <header className="home-header">
                    <div className="home-header-search">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Поиск задач, компаний, технологий..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <HeaderActions />
                </header>

                <div className="tasks-page-head">
                    <div className="tasks-page-title">
                        <span className="tasks-page-icon"><GridIcon /></span>
                        <div>
                            <h1>Мои задачи</h1>
                            <p>
                                Здесь собраны все ваши активные и выполненные задания.
                                Отслеживайте прогресс, сроки и оплату.
                            </p>
                        </div>
                    </div>
                    <Link to="/" className="tasks-find-btn">
                        <RocketIcon />
                        Найти задание
                    </Link>
                </div>

                <div className="tasks-filters">
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

                <div className="tasks-list">
                    {filteredTasks.length === 0 ? (
                        <div className="home-empty">Задач не найдено</div>
                    ) : (
                        filteredTasks.map(task => (
                            <MyTaskRow key={task.id} task={task} />
                        ))
                    )}
                </div>
            </div>

            <TasksRightSidebar stats={sidebarStats} />
        </div>
    );
}

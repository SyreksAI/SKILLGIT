import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TASKS } from '../../data/mockData';
import { getCompanyBySlug } from '../../data/companyAdminData';
import { api } from '../../services/api';
import { TaskCard } from '../ui/TaskCard';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon } from './icons';

export function CompanyPublicPage() {
    const { slug } = useParams();
    const [remoteState, setRemoteState] = useState({ slug: null, loading: true, data: null, error: '' });

    useEffect(() => {
        let cancelled = false;
        setRemoteState({ slug, loading: true, data: null, error: '' });
        api.getPublicCompany(slug)
            .then(data => {
                if (!cancelled) setRemoteState({ slug, loading: false, data, error: '' });
            })
            .catch(error => {
                if (!cancelled) setRemoteState({ slug, loading: false, data: null, error: error.message });
            });
        return () => { cancelled = true; };
    }, [slug]);

    const state = remoteState.slug === slug
        ? remoteState
        : { slug, loading: true, data: null, error: '' };
    const company = state.data ?? getCompanyBySlug(slug);
    const companyNotFound = state.error.includes('404') || state.error.includes('не найдена');

    if (!company && state.loading) {
        return (
            <div className="public-page">
                <header className="home-header"><HeaderActions /></header>
                <div className="account-page"><p>Загружаем компанию…</p></div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="public-page">
                <header className="home-header">
                    <HeaderActions />
                </header>
                <div className="account-page">
                    <h1>{companyNotFound ? 'Компания не найдена' : 'Не удалось загрузить компанию'}</h1>
                    <p>{companyNotFound
                        ? 'У этой компании пока нет опубликованных заданий или ссылка устарела.'
                        : 'Проверьте подключение и попробуйте открыть страницу ещё раз.'}</p>
                    <Link to="/" className="admin-link">← На главную</Link>
                </div>
            </div>
        );
    }

    const companyTasks = state.data?.tasks ?? TASKS.filter(t => t.company === company.name);

    return (
        <div className="public-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <div className="public-company">
                <header className="public-company-hero" style={{ '--company-color': company.color }}>
                    <span className="public-company-logo">{company.name.charAt(0)}</span>
                    <div>
                        <h1>{company.name}</h1>
                        <p>{company.industry ?? company.description}</p>
                        {company.verified && <span className="public-verified">✓ Верифицированный работодатель</span>}
                    </div>
                </header>

                {company.description && (
                    <section className="admin-card">
                        <h2>О компании</h2>
                        <p className="admin-text">{company.description}</p>
                    </section>
                )}

                <section className="home-tasks">
                    <div className="home-tasks-head">
                        <h3>Активные задания ({companyTasks.length})</h3>
                    </div>
                    {companyTasks.length === 0 ? (
                        <p className="admin-empty-text">Нет открытых заданий</p>
                    ) : (
                        <div className="home-tasks-grid">
                            {companyTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

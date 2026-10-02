import { Link, useParams } from 'react-router-dom';
import { TASKS } from '../../data/mockData';
import { getCompanyBySlug } from '../../data/companyAdminData';
import { TaskCard } from '../ui/TaskCard';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon } from './icons';

export function CompanyPublicPage() {
    const { slug } = useParams();
    const company = getCompanyBySlug(slug);

    if (!company) {
        return (
            <div className="public-page">
                <header className="home-header">
                    <HeaderActions />
                </header>
                <div className="account-page">
                    <h1>Компания не найдена</h1>
                    <Link to="/" className="admin-link">← На главную</Link>
                </div>
            </div>
        );
    }

    const companyTasks = TASKS.filter(t => t.company === company.name);

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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { APPLICANT_STATUSES } from '../../data/companyAdminData';
import { AdminPanelHead, AdminTable } from '../admin/AdminShell';
import { ApplicantStatusBadge, CrmCandidateDrawer } from '../crm/CrmShared';

export function CompanyApplicantsPage() {
    const {
        filteredApplicants,
        applicantNotes,
        team,
        updateApplicantStatus,
        assignApplicant,
        addApplicantNote,
        createDealFromApplicant,
    } = useCompanyAdmin();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    const filtered = filteredApplicants.filter(a =>
        statusFilter === 'all' ? true : a.status === statusFilter,
    );

    return (
        <div className="admin-page">
            <AdminPanelHead
                title="Кандидаты"
                subtitle="Таблица + карточка кандидата с заметками и назначением"
                actions={(
                    <Link to="/company/pipeline" className="admin-btn admin-btn--ghost">
                        Kanban-воронка
                    </Link>
                )}
            />

            <div className="admin-filters">
                <button type="button" className={`admin-filter${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>
                    Все ({filteredApplicants.length})
                </button>
                {APPLICANT_STATUSES.map(st => (
                    <button
                        key={st.id}
                        type="button"
                        className={`admin-filter${statusFilter === st.id ? ' active' : ''}`}
                        onClick={() => setStatusFilter(st.id)}
                    >
                        {st.label} ({filteredApplicants.filter(a => a.status === st.id).length})
                    </button>
                ))}
            </div>

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Кандидат', 'Задание', 'Рейтинг', 'Ответственный', 'Статус', '']}>
                    {filtered.map(a => {
                        const assignee = team.find(m => m.id === a.assigneeId);
                        return (
                            <tr key={a.id} className="crm-table-row-clickable" onClick={() => setSelected(a)}>
                                <td>
                                    <div className="admin-user-cell">
                                        <span className="admin-list-avatar">{a.avatar}</span>
                                        <div>
                                            <strong>{a.userName}</strong>
                                            <span>@{a.username}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{a.taskTitle}</td>
                                <td>★ {a.rating}</td>
                                <td>{assignee ? assignee.name : '—'}</td>
                                <td><ApplicantStatusBadge status={a.status} /></td>
                                <td className="admin-table-actions" onClick={e => e.stopPropagation()}>
                                    <Link to={`/users/${a.username}`} className="admin-link">Профиль</Link>
                                    <Link to={`/company/messages?thread=${a.id}`} className="admin-link">Чат</Link>
                                </td>
                            </tr>
                        );
                    })}
                </AdminTable>
            </div>

            <CrmCandidateDrawer
                applicant={selected}
                notes={selected ? applicantNotes[selected.id] : []}
                team={team}
                onClose={() => setSelected(null)}
                onStatusChange={updateApplicantStatus}
                onAddNote={addApplicantNote}
                onAssign={assignApplicant}
                onCreateDeal={createDealFromApplicant}
            />
        </div>
    );
}

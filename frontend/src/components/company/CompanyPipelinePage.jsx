import { useState } from 'react';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { APPLICANT_STATUSES } from '../../data/companyAdminData';
import { AdminPanelHead } from '../admin/AdminShell';
import { CrmKanbanCard, CrmCandidateDrawer } from '../crm/CrmShared';

export function CompanyPipelinePage() {
    const {
        filteredApplicants,
        applicantNotes,
        team,
        updateApplicantStatus,
        moveApplicantNext,
        moveApplicantPrev,
        assignApplicant,
        addApplicantNote,
        createDealFromApplicant,
    } = useCompanyAdmin();
    const [selected, setSelected] = useState(null);

    const columns = APPLICANT_STATUSES.filter(s => s.id !== 'rejected');

    return (
        <div className="admin-page admin-page--pipeline">
            <AdminPanelHead
                title="Воронка найма"
                subtitle="Kanban по этапам: от отклика до оффера и работы"
            />

            <div className="crm-kanban">
                {columns.map(col => {
                    const cards = filteredApplicants.filter(a => a.status === col.id);
                    return (
                        <section key={col.id} className="crm-kanban-col" style={{ '--col-color': col.color }}>
                            <header className="crm-kanban-col-head">
                                <span className="crm-kanban-col-dot" />
                                <strong>{col.label}</strong>
                                <span className="crm-kanban-col-count">{cards.length}</span>
                            </header>
                            <div className="crm-kanban-col-body">
                                {cards.map(applicant => (
                                    <CrmKanbanCard
                                        key={applicant.id}
                                        applicant={applicant}
                                        team={team}
                                        onOpen={setSelected}
                                        onMoveNext={col.id !== 'hired' ? () => moveApplicantNext(applicant.id) : null}
                                        onMovePrev={col.id !== 'new' ? () => moveApplicantPrev(applicant.id) : null}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                })}

                <section className="crm-kanban-col crm-kanban-col--muted">
                    <header className="crm-kanban-col-head">
                        <span className="crm-kanban-col-dot" />
                        <strong>Отказ</strong>
                        <span className="crm-kanban-col-count">
                            {filteredApplicants.filter(a => a.status === 'rejected').length}
                        </span>
                    </header>
                    <div className="crm-kanban-col-body">
                        {filteredApplicants.filter(a => a.status === 'rejected').map(applicant => (
                            <CrmKanbanCard
                                key={applicant.id}
                                applicant={applicant}
                                team={team}
                                onOpen={setSelected}
                                onMovePrev={() => moveApplicantPrev(applicant.id)}
                            />
                        ))}
                    </div>
                </section>
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

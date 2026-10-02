import { useState } from 'react';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead, AdminTable } from '../admin/AdminShell';

export function CompanyTeamPage() {
    const { team, addTeamMember, removeTeamMember } = useCompanyAdmin();
    const [form, setForm] = useState({ name: '', email: '', role: 'Recruiter' });

    function handleAdd(e) {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) return;
        addTeamMember({
            ...form,
            avatar: form.name.charAt(0).toUpperCase(),
        });
        setForm({ name: '', email: '', role: 'Recruiter' });
    }

    return (
        <div className="admin-page">
            <AdminPanelHead title="Команда HR" subtitle="Менеджеры с доступом к кабинету компании" />

            <form className="admin-card admin-form admin-form--inline" onSubmit={handleAdd}>
                <label className="admin-field">
                    <span>Имя</span>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Email</span>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Роль</span>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option>HR Lead</option>
                        <option>Recruiter</option>
                        <option>Tech Lead</option>
                        <option>Viewer</option>
                    </select>
                </label>
                <button type="submit" className="admin-btn admin-btn--primary">Пригласить</button>
            </form>

            <div className="admin-card admin-card--flush">
                <AdminTable columns={['Сотрудник', 'Email', 'Роль', '']}>
                    {team.map(member => (
                        <tr key={member.id}>
                            <td>
                                <div className="admin-user-cell">
                                    <span className="admin-list-avatar">{member.avatar}</span>
                                    <strong>{member.name}</strong>
                                </div>
                            </td>
                            <td>{member.email}</td>
                            <td>{member.role}</td>
                            <td>
                                <button type="button" className="admin-link admin-link--danger" onClick={() => removeTeamMember(member.id)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </div>
    );
}

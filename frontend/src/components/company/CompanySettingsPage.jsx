import { useState } from 'react';
import { useCompanyAdmin } from '../../context/CompanyAdminContext';
import { AdminPanelHead } from '../admin/AdminShell';

export function CompanySettingsPage() {
    const { company, updateCompany } = useCompanyAdmin();
    const [form, setForm] = useState({
        name: company.name,
        email: company.email,
        website: company.website,
        description: company.description,
        industry: company.industry,
    });
    const [saved, setSaved] = useState(false);

    function handleSave(e) {
        e.preventDefault();
        updateCompany(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="admin-page">
            <AdminPanelHead title="Настройки компании" subtitle="Профиль и контактные данные" />

            <form className="admin-card admin-form" onSubmit={handleSave}>
                <label className="admin-field">
                    <span>Название</span>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Отрасль</span>
                    <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Email для связи</span>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>Сайт</span>
                    <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                </label>
                <label className="admin-field">
                    <span>О компании</span>
                    <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </label>
                <div className="admin-form-actions">
                    <button type="submit" className="admin-btn admin-btn--primary">
                        {saved ? 'Сохранено' : 'Сохранить'}
                    </button>
                </div>
            </form>

            <section className="admin-card">
                <h2>Тариф</h2>
                <p className="admin-text">Текущий план: <strong>{company.plan}</strong></p>
                <p className="admin-text-sm">Верификация: {company.verified ? '✓ Подтверждена' : 'Ожидает проверки'}</p>
            </section>
        </div>
    );
}

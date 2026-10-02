import { useState } from 'react';
import { usePlatformAdmin } from '../../context/PlatformAdminContext';
import { AdminPanelHead } from '../admin/AdminShell';

export function PlatformSettingsPage() {
    const { settings, updateSettings } = usePlatformAdmin();
    const [form, setForm] = useState({ ...settings });
    const [saved, setSaved] = useState(false);

    function handleSave(e) {
        e.preventDefault();
        updateSettings({
            ...form,
            commissionRate: Number(form.commissionRate),
            minTaskPrice: Number(form.minTaskPrice),
            maxTaskPrice: Number(form.maxTaskPrice),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="admin-page">
            <AdminPanelHead title="Настройки платформы" subtitle="Глобальные параметры SKILLGIT" />

            <form className="admin-card admin-form" onSubmit={handleSave}>
                <label className="admin-field">
                    <span>Комиссия платформы, %</span>
                    <input type="number" min={0} max={30} value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} />
                </label>
                <div className="admin-form-row">
                    <label className="admin-field">
                        <span>Мин. бюджет задачи, ₽</span>
                        <input type="number" value={form.minTaskPrice} onChange={e => setForm({ ...form, minTaskPrice: e.target.value })} />
                    </label>
                    <label className="admin-field">
                        <span>Макс. бюджет задачи, ₽</span>
                        <input type="number" value={form.maxTaskPrice} onChange={e => setForm({ ...form, maxTaskPrice: e.target.value })} />
                    </label>
                </div>
                <label className="admin-field">
                    <span>Email поддержки</span>
                    <input type="email" value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })} />
                </label>
                <label className="admin-toggle">
                    <input type="checkbox" checked={form.autoVerifyCompanies} onChange={e => setForm({ ...form, autoVerifyCompanies: e.target.checked })} />
                    <span>Авто-верификация новых компаний</span>
                </label>
                <label className="admin-toggle admin-toggle--danger">
                    <input type="checkbox" checked={form.maintenanceMode} onChange={e => setForm({ ...form, maintenanceMode: e.target.checked })} />
                    <span>Режим обслуживания (закрыть платформу)</span>
                </label>
                <div className="admin-form-actions">
                    <button type="submit" className="admin-btn admin-btn--primary">
                        {saved ? 'Сохранено' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </div>
    );
}
